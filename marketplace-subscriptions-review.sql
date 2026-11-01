-- OWNER APPROVAL REQUIRED. Apply after the other two marketplace setup files.
-- Manual payment tracking only. No gateway, money movement or automatic charges.
BEGIN;
ALTER TABLE public.mb_plans ADD COLUMN duration_days integer CHECK(duration_days BETWEEN 1 AND 3660);
CREATE POLICY mb_plans_owner_update ON public.mb_plans FOR UPDATE TO authenticated USING(public.mb_is_admin()) WITH CHECK(public.mb_is_admin());
GRANT UPDATE(price_pkr,enabled,billing_period,product_limit,duration_days) ON public.mb_plans TO authenticated;
CREATE TABLE public.mb_billing_settings(id integer PRIMARY KEY CHECK(id=1),collection_enabled boolean NOT NULL DEFAULT false,free_until timestamptz,updated_at timestamptz NOT NULL DEFAULT now());
INSERT INTO public.mb_billing_settings(id,collection_enabled) VALUES(1,false);
ALTER TABLE public.mb_billing_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mb_billing_settings FROM anon,authenticated;
GRANT SELECT,UPDATE ON public.mb_billing_settings TO authenticated;
CREATE POLICY mb_billing_read ON public.mb_billing_settings FOR SELECT TO authenticated USING(true);
CREATE POLICY mb_billing_owner_update ON public.mb_billing_settings FOR UPDATE TO authenticated USING(public.mb_is_admin()) WITH CHECK(public.mb_is_admin());
CREATE TABLE public.mb_payment_accounts(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),method text UNIQUE NOT NULL CHECK(method IN ('easypaisa','jazzcash','bank')),account_title text NOT NULL CHECK(length(account_title) BETWEEN 2 AND 150),account_number text NOT NULL CHECK(length(account_number) BETWEEN 3 AND 100),instructions text NOT NULL DEFAULT '' CHECK(length(instructions)<=1000),active boolean NOT NULL DEFAULT false);
ALTER TABLE public.mb_payment_accounts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mb_payment_accounts FROM anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON public.mb_payment_accounts TO authenticated;
CREATE POLICY mb_payment_accounts_read ON public.mb_payment_accounts FOR SELECT TO authenticated USING(active OR public.mb_is_admin());
CREATE POLICY mb_payment_accounts_insert ON public.mb_payment_accounts FOR INSERT TO authenticated WITH CHECK(public.mb_is_admin());
CREATE POLICY mb_payment_accounts_update ON public.mb_payment_accounts FOR UPDATE TO authenticated USING(public.mb_is_admin()) WITH CHECK(public.mb_is_admin());
CREATE TABLE public.mb_payment_requests(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),shop_id uuid NOT NULL REFERENCES public.mb_shops(id),owner_id uuid NOT NULL REFERENCES auth.users(id),plan_code text NOT NULL REFERENCES public.mb_plans(code),amount_pkr numeric NOT NULL CHECK(amount_pkr>0),duration_days integer NOT NULL CHECK(duration_days BETWEEN 1 AND 3660),account_id uuid NOT NULL REFERENCES public.mb_payment_accounts(id),method text NOT NULL,transaction_id text NOT NULL CHECK(length(transaction_id) BETWEEN 6 AND 100),transaction_normalized text NOT NULL UNIQUE,sender_name text NOT NULL CHECK(length(sender_name) BETWEEN 2 AND 150),paid_at timestamptz NOT NULL,receipt_path text NOT NULL,status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),reason text NOT NULL DEFAULT '',created_at timestamptz NOT NULL DEFAULT now(),reviewed_at timestamptz,reviewed_by uuid REFERENCES auth.users(id));
CREATE UNIQUE INDEX mb_one_pending_payment ON public.mb_payment_requests(shop_id) WHERE status='pending';
CREATE INDEX mb_payment_owner_created ON public.mb_payment_requests(owner_id,created_at);
ALTER TABLE public.mb_payment_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mb_payment_requests FROM anon,authenticated;
GRANT SELECT ON public.mb_payment_requests TO authenticated;
CREATE POLICY mb_payment_requests_read ON public.mb_payment_requests FOR SELECT TO authenticated USING(owner_id=auth.uid() OR public.mb_is_admin());
CREATE TABLE public.mb_subscriptions(shop_id uuid PRIMARY KEY REFERENCES public.mb_shops(id),owner_id uuid NOT NULL REFERENCES auth.users(id),plan_code text NOT NULL REFERENCES public.mb_plans(code),starts_at timestamptz NOT NULL,expires_at timestamptz NOT NULL,last_payment_id uuid UNIQUE NOT NULL REFERENCES public.mb_payment_requests(id),CHECK(expires_at>starts_at));
ALTER TABLE public.mb_subscriptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mb_subscriptions FROM anon,authenticated;
GRANT SELECT ON public.mb_subscriptions TO authenticated;
CREATE POLICY mb_subscriptions_read ON public.mb_subscriptions FOR SELECT TO authenticated USING(owner_id=auth.uid() OR public.mb_is_admin());
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES('mb-payment-receipts','mb-payment-receipts',false,5242880,ARRAY['image/webp']);
CREATE POLICY mb_receipt_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='mb-payment-receipts' AND (storage.foldername(name))[1]=auth.uid()::text AND EXISTS(SELECT 1 FROM public.mb_shops WHERE owner_id=auth.uid() AND status='approved'));
CREATE POLICY mb_receipt_private_read ON storage.objects FOR SELECT TO authenticated USING(bucket_id='mb-payment-receipts' AND ((storage.foldername(name))[1]=auth.uid()::text OR public.mb_is_admin()));
CREATE FUNCTION public.mb_submit_payment(requested_plan text,payment_account uuid,txn text,sender text,payment_date timestamptz,receipt text) RETURNS public.mb_payment_requests LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE s public.mb_shops;p public.mb_plans;a public.mb_payment_accounts;cfg public.mb_billing_settings;r public.mb_payment_requests;reference text;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text,3));
 SELECT * INTO s FROM public.mb_shops WHERE owner_id=auth.uid() AND status='approved' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Approved shop required'; END IF;
 SELECT * INTO cfg FROM public.mb_billing_settings WHERE id=1;
 IF NOT FOUND OR NOT cfg.collection_enabled OR cfg.free_until>now() THEN RAISE EXCEPTION 'Paid subscriptions are not open'; END IF;
 SELECT * INTO p FROM public.mb_plans WHERE code=requested_plan AND enabled AND price_pkr>0 AND duration_days IS NOT NULL;
 IF NOT FOUND THEN RAISE EXCEPTION 'Plan is not available'; END IF;
 SELECT * INTO a FROM public.mb_payment_accounts WHERE id=payment_account AND active;
 IF NOT FOUND THEN RAISE EXCEPTION 'Payment account is unavailable'; END IF;
 reference:=upper(regexp_replace(coalesce(txn,''),'[^a-zA-Z0-9]','','g'));
 IF length(reference) NOT BETWEEN 6 AND 100 OR length(trim(coalesce(sender,''))) NOT BETWEEN 2 AND 150 OR payment_date IS NULL OR payment_date>now()+interval '1 day' OR payment_date<now()-interval '90 days' THEN RAISE EXCEPTION 'Invalid payment details'; END IF;
 IF split_part(receipt,'/',1) IS DISTINCT FROM auth.uid()::text OR NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='mb-payment-receipts' AND name=receipt) THEN RAISE EXCEPTION 'Invalid receipt ownership'; END IF;
 IF EXISTS(SELECT 1 FROM public.mb_payment_requests WHERE shop_id=s.id AND status='pending') THEN RAISE EXCEPTION 'A payment is already awaiting review'; END IF;
 IF (SELECT count(*) FROM public.mb_payment_requests WHERE owner_id=auth.uid() AND created_at>now()-interval '1 day')>=5 THEN RAISE EXCEPTION 'Payment request limit reached'; END IF;
 INSERT INTO public.mb_payment_requests(shop_id,owner_id,plan_code,amount_pkr,duration_days,account_id,method,transaction_id,transaction_normalized,sender_name,paid_at,receipt_path) VALUES(s.id,auth.uid(),p.code,p.price_pkr,p.duration_days,a.id,a.method,left(trim(txn),100),reference,trim(sender),payment_date,receipt) RETURNING * INTO r;
 RETURN r;
END $$;
CREATE FUNCTION public.mb_review_payment(payment_id uuid,decision text,review_reason text,received_confirmed boolean DEFAULT false) RETURNS public.mb_payment_requests LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE r public.mb_payment_requests;sub public.mb_subscriptions;base_date timestamptz;start_date timestamptz;
BEGIN
 IF NOT public.mb_is_admin() OR decision NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'Owner access required'; END IF;
 SELECT * INTO r FROM public.mb_payment_requests WHERE id=payment_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Payment unavailable'; END IF;
 IF r.status=decision THEN RETURN r; END IF;
 IF r.status<>'pending' THEN RAISE EXCEPTION 'Payment already reviewed'; END IF;
 IF decision='approved' THEN
  IF NOT received_confirmed THEN RAISE EXCEPTION 'Confirm received funds in your account first'; END IF;
  PERFORM 1 FROM public.mb_shops WHERE id=r.shop_id AND status='approved' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Approve the shop before activating a plan'; END IF;
  SELECT * INTO sub FROM public.mb_subscriptions WHERE shop_id=r.shop_id FOR UPDATE;
  base_date:=now();start_date:=now();
  IF FOUND AND sub.plan_code=r.plan_code AND sub.expires_at>now() THEN base_date:=sub.expires_at;start_date:=sub.starts_at;END IF;
  INSERT INTO public.mb_subscriptions(shop_id,owner_id,plan_code,starts_at,expires_at,last_payment_id) VALUES(r.shop_id,r.owner_id,r.plan_code,start_date,base_date+make_interval(days=>r.duration_days),r.id) ON CONFLICT(shop_id) DO UPDATE SET plan_code=excluded.plan_code,starts_at=excluded.starts_at,expires_at=excluded.expires_at,last_payment_id=excluded.last_payment_id;
  UPDATE public.mb_shops SET plan=r.plan_code,updated_at=now() WHERE id=r.shop_id;
 ELSE
  IF length(trim(coalesce(review_reason,'')))<5 THEN RAISE EXCEPTION 'Rejection reason required';END IF;
 END IF;
 UPDATE public.mb_payment_requests SET status=decision,reason=left(coalesce(review_reason,''),1000),reviewed_at=now(),reviewed_by=auth.uid() WHERE id=r.id RETURNING * INTO r;
 INSERT INTO public.mb_admin_events(actor_id,shop_id,action,reason) VALUES(auth.uid(),r.shop_id,'subscription_'||decision,r.id::text||' '||left(coalesce(review_reason,''),800));
 RETURN r;
END $$;
REVOKE ALL ON FUNCTION public.mb_submit_payment(text,uuid,text,text,timestamptz,text),public.mb_review_payment(uuid,text,text,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mb_submit_payment(text,uuid,text,text,timestamptz,text),public.mb_review_payment(uuid,text,text,boolean) TO authenticated;
COMMIT;
