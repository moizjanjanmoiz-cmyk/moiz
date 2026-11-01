-- OWNER REVIEW REQUIRED. Apply AFTER marketplace-setup-review.sql. Not applied.
-- Existing products/orders/users are not modified.
BEGIN;
CREATE TABLE public.mb_products(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),shop_id uuid NOT NULL REFERENCES public.mb_shops(id),owner_id uuid NOT NULL REFERENCES auth.users(id),details jsonb NOT NULL,images text[] NOT NULL CHECK(cardinality(images) BETWEEN 3 AND 8),status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','paused')),reason text NOT NULL DEFAULT '',created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE public.mb_products ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mb_products FROM anon,authenticated;
GRANT SELECT ON public.mb_products TO authenticated;
CREATE POLICY mb_products_owner_read ON public.mb_products FOR SELECT TO authenticated USING(owner_id=auth.uid() OR public.mb_is_admin());
CREATE VIEW public.mb_public_products WITH(security_barrier=true) AS SELECT p.id,p.shop_id,p.details,p.images,p.created_at,p.updated_at,s.name AS shop_name,s.slug AS shop_slug,s.verified AS shop_verified,s.city FROM public.mb_products p JOIN public.mb_shops s ON s.id=p.shop_id WHERE p.status='approved' AND s.status='approved';
GRANT SELECT ON public.mb_public_products TO anon,authenticated;
CREATE FUNCTION public.mb_save_product(details jsonb,image_paths text[],product_id uuid DEFAULT NULL) RETURNS public.mb_products LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE s public.mb_shops; p public.mb_products; path text; uid uuid:=auth.uid();
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 SELECT * INTO s FROM public.mb_shops WHERE owner_id=uid AND status='approved' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Approved shop required'; END IF;
 IF octet_length(details::text)>50000 THEN RAISE EXCEPTION 'Product data too large'; END IF;
 IF jsonb_typeof(details) IS DISTINCT FROM 'object' OR coalesce(length(trim(details->>'name')),0) NOT BETWEEN 2 AND 180 OR coalesce(length(details->>'description'),0) NOT BETWEEN 20 AND 5000 OR coalesce(length(details->>'category'),0)<2 OR coalesce(length(details->>'contents'),0)<2 OR (details->>'condition') NOT IN ('new','used','refurbished') OR coalesce(details->>'condition','')='' THEN RAISE EXCEPTION 'Invalid details'; END IF;
 IF coalesce(details->>'price','') !~ '^[0-9]+(\.[0-9]{1,2})?$' OR (details->>'price')::numeric<=0 OR (details->>'price')::numeric>100000000 OR coalesce(details->>'stock','') !~ '^[0-9]+$' OR (details->>'stock')::numeric>10000000 OR coalesce(details->>'dispatch','') !~ '^[0-9]+$' OR (details->>'dispatch')::numeric NOT BETWEEN 1 AND 90 THEN RAISE EXCEPTION 'Invalid price/stock/dispatch'; END IF;
 IF coalesce(details->>'salePrice','')<>'' AND (details->>'salePrice' !~ '^[0-9]+(\.[0-9]{1,2})?$' OR (details->>'salePrice')::numeric<=0 OR (details->>'salePrice')::numeric>=(details->>'price')::numeric) THEN RAISE EXCEPTION 'Invalid discount'; END IF;
 IF details->>'enableWhatsapp'='true' AND (details->>'whatsappConsent' IS DISTINCT FROM 'true' OR coalesce(details->>'whatsapp','') !~ '^(\+92|92|0)3[0-9]{9}$') THEN RAISE EXCEPTION 'WhatsApp consent/number invalid'; END IF;
 IF coalesce(cardinality(image_paths),0) NOT BETWEEN 3 AND 8 OR (SELECT count(DISTINCT x) FROM unnest(image_paths) AS x)<>cardinality(image_paths) THEN RAISE EXCEPTION '3-8 images required'; END IF;
 FOREACH path IN ARRAY image_paths LOOP
  IF split_part(path,'/',1)<>uid::text OR NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='mb-product-images' AND name=path) THEN RAISE EXCEPTION 'Invalid image ownership'; END IF;
 END LOOP;
 -- Whitelist public fields; never publish arbitrary private keys supplied by clients.
 details:=(SELECT coalesce(jsonb_object_agg(key,value),'{}') FROM jsonb_each(details) WHERE key=ANY(ARRAY['name','category','subcategory','otherCategory','brand','condition','description','contents','price','salePrice','stock','unit','sku','size','colour','material','model','capacity','ingredients','expiry','variants','weight','dimensions','dispatch','warranty','whatsapp','enableWhatsapp','whatsappConsent']));
 IF details->>'enableWhatsapp' IS DISTINCT FROM 'true' THEN details:=details-'whatsapp'; END IF;
 IF product_id IS NULL THEN INSERT INTO public.mb_products(shop_id,owner_id,details,images) VALUES(s.id,uid,details,image_paths) RETURNING * INTO p;
 ELSE UPDATE public.mb_products SET details=mb_save_product.details,images=image_paths,status='pending',reason='',updated_at=now() WHERE id=product_id AND owner_id=uid RETURNING * INTO p;IF NOT FOUND THEN RAISE EXCEPTION 'Product unavailable'; END IF;END IF;
 RETURN p;
END $$;
CREATE FUNCTION public.mb_review_product(product_id uuid,decision text,review_reason text) RETURNS public.mb_products LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.mb_products;
BEGIN
 IF NOT public.mb_is_admin() OR decision NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'Permission denied'; END IF;
 IF decision='rejected' AND length(trim(coalesce(review_reason,'')))<5 THEN RAISE EXCEPTION 'Reason required'; END IF;
 UPDATE public.mb_products SET status=decision,reason=left(coalesce(review_reason,''),1000),updated_at=now() WHERE id=product_id RETURNING * INTO p;
 IF NOT FOUND THEN RAISE EXCEPTION 'Product unavailable'; END IF;
 INSERT INTO public.mb_admin_events(actor_id,shop_id,action,reason) VALUES(auth.uid(),p.shop_id,'product_'||decision,product_id::text||' '||coalesce(review_reason,''));
 RETURN p;
END $$;
CREATE FUNCTION public.mb_pause_product(product_id uuid) RETURNS public.mb_products LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.mb_products;
BEGIN
 UPDATE public.mb_products SET status='paused',updated_at=now() WHERE id=product_id AND owner_id=auth.uid() RETURNING * INTO p;
 IF NOT FOUND THEN RAISE EXCEPTION 'Product unavailable'; END IF;RETURN p;
END $$;
REVOKE ALL ON FUNCTION public.mb_save_product(jsonb,text[],uuid),public.mb_review_product(uuid,text,text),public.mb_pause_product(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mb_save_product(jsonb,text[],uuid),public.mb_review_product(uuid,text,text),public.mb_pause_product(uuid) TO authenticated;
-- Storage policy allows owners to create new files only, not overwrite/delete existing listing photos.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES('mb-product-images','mb-product-images',true,5242880,ARRAY['image/webp']);
CREATE POLICY mb_image_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='mb-product-images' AND (storage.foldername(name))[1]=auth.uid()::text AND EXISTS(SELECT 1 FROM public.mb_shops WHERE owner_id=auth.uid() AND status IN ('pending','approved','rejected','needs_information')));
CREATE POLICY mb_image_public_read ON storage.objects FOR SELECT TO anon,authenticated USING(bucket_id='mb-product-images');
CREATE TABLE public.mb_threads(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),shop_id uuid NOT NULL REFERENCES public.mb_shops(id),buyer_id uuid NOT NULL REFERENCES auth.users(id),created_at timestamptz DEFAULT now(),UNIQUE(shop_id,buyer_id));
CREATE TABLE public.mb_messages(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),thread_id uuid NOT NULL REFERENCES public.mb_threads(id),sender_id uuid NOT NULL REFERENCES auth.users(id),body text NOT NULL CHECK(length(trim(body)) BETWEEN 1 AND 2000),created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE public.mb_threads ENABLE ROW LEVEL SECURITY;ALTER TABLE public.mb_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mb_threads,public.mb_messages FROM anon,authenticated;GRANT SELECT ON public.mb_threads,public.mb_messages TO authenticated;
CREATE FUNCTION public.mb_chat_member(tid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$ SELECT EXISTS(SELECT 1 FROM public.mb_threads t JOIN public.mb_shops s ON s.id=t.shop_id WHERE t.id=tid AND s.status='approved' AND (t.buyer_id=auth.uid() OR s.owner_id=auth.uid())) $$;
CREATE POLICY mb_threads_read ON public.mb_threads FOR SELECT TO authenticated USING(public.mb_chat_member(id));
CREATE POLICY mb_messages_read ON public.mb_messages FOR SELECT TO authenticated USING(public.mb_chat_member(thread_id));
CREATE FUNCTION public.mb_open_chat(target_shop uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE tid uuid;
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS(SELECT 1 FROM public.mb_shops WHERE id=target_shop AND status='approved' AND owner_id<>auth.uid()) THEN RAISE EXCEPTION 'Shop unavailable'; END IF;
 INSERT INTO public.mb_threads(shop_id,buyer_id) VALUES(target_shop,auth.uid()) ON CONFLICT(shop_id,buyer_id) DO NOTHING;
 SELECT id INTO tid FROM public.mb_threads WHERE shop_id=target_shop AND buyer_id=auth.uid(); RETURN tid;
END $$;
CREATE FUNCTION public.mb_send_message(target_thread uuid,message_body text) RETURNS public.mb_messages LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE m public.mb_messages;
BEGIN
 IF NOT public.mb_chat_member(target_thread) THEN RAISE EXCEPTION 'Permission denied'; END IF;
 IF length(trim(coalesce(message_body,''))) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Invalid message'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text,1));
 IF (SELECT count(*) FROM public.mb_messages WHERE sender_id=auth.uid() AND created_at>now()-interval '1 minute')>=20 THEN RAISE EXCEPTION 'Message limit reached'; END IF;
 INSERT INTO public.mb_messages(thread_id,sender_id,body) VALUES(target_thread,auth.uid(),trim(message_body)) RETURNING * INTO m;RETURN m;
END $$;
REVOKE ALL ON FUNCTION public.mb_chat_member(uuid),public.mb_open_chat(uuid),public.mb_send_message(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mb_chat_member(uuid),public.mb_open_chat(uuid),public.mb_send_message(uuid,text) TO authenticated;
CREATE INDEX mb_messages_thread_time ON public.mb_messages(thread_id,created_at);
CREATE INDEX mb_products_shop ON public.mb_products(shop_id,status);
ALTER TABLE public.mb_shops ADD COLUMN logo_path text, ADD COLUMN banner_path text;
CREATE OR REPLACE VIEW public.mb_public_shops WITH(security_barrier=true) AS SELECT id,name,slug,category,city,description,verified,created_at,logo_path,banner_path FROM public.mb_shops WHERE status='approved';
CREATE FUNCTION public.mb_set_shop_media(logo_image text,banner_image text) RETURNS public.mb_shops LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE s public.mb_shops; path text;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 IF logo_image IS NULL AND banner_image IS NULL THEN RAISE EXCEPTION 'Select a logo or banner'; END IF;
 FOREACH path IN ARRAY ARRAY[logo_image,banner_image] LOOP
  IF path IS NOT NULL AND (split_part(path,'/',1)<>auth.uid()::text OR NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='mb-product-images' AND name=path)) THEN RAISE EXCEPTION 'Invalid image'; END IF;
 END LOOP;
 UPDATE public.mb_shops SET logo_path=coalesce(logo_image,logo_path),banner_path=coalesce(banner_image,banner_path),status='pending',verified=false,reason='',updated_at=now() WHERE owner_id=auth.uid() AND status<>'suspended' RETURNING * INTO s;
 IF NOT FOUND THEN RAISE EXCEPTION 'Shop unavailable'; END IF;RETURN s;
END $$;
REVOKE ALL ON FUNCTION public.mb_set_shop_media(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mb_set_shop_media(text,text) TO authenticated;
COMMIT;
