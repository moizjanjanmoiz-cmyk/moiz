-- =======================================================
-- INSERT ALL 21 MEGAPRODUCTS INTO SUPABASE
-- =======================================================

INSERT INTO products (
  id, name, slug, sku, category, description, short_description, price, original_price, discount_percentage, stock, low_stock_threshold, rating, review_count, is_flash_deal, is_featured, is_trending, status, images, specifications, keywords, meta_title, meta_description, image_alt_text
) VALUES (
  'prod-1790928935778',
  'Men Classic Oxford Leather Shoes',
  'men-classic-oxford-leather-shoes',
  'MB-SHOE-771',
  'Fashion',
  'Premium handcrafted leather shoes designed for all-day comfort and timeless elegance. Suitable for formal events, office meetings, and luxury wear.',
  'Handcrafted genuine leather formal shoes with cushioned insole',
  8900,
  12500,
  29,
  18,
  4,
  5,
  0,
  false,
  true,
  true,
  'active',
  '["/uploads/prod-1790928905195-iq9mpz.webp","https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '{"Material":"100% Full Grain Leather","Sole":"Durable Anti-Slip Rubber","Warranty":"6 Months Warranty","Authenticity":"100% Original"}'::jsonb,
  '["shoes","leather","men","formal"]'::jsonb,
  'Men Classic Oxford Leather Shoes',
  'Handcrafted genuine leather formal shoes with cushioned insole',
  'Men Classic Oxford Leather Shoes'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  images = EXCLUDED.images,
  updated_at = NOW();

INSERT INTO products (
  id, name, slug, sku, category, description, short_description, price, original_price, discount_percentage, stock, low_stock_threshold, rating, review_count, is_flash_deal, is_featured, is_trending, status, images, specifications, keywords, meta_title, meta_description, image_alt_text
) VALUES (
  'prod-1',
  'Mens Air Sneakers Running Shoes',
  'mens-air-sneakers-running-shoes',
  'MB-FASH-001',
  'Fashion',
  'Engineered with ultra-light breathable mesh and air-cushioned soles, these premium sneakers offer all-day athletic support, shock absorption, and unmatched streetwear elegance.',
  'Ultra-cushioned breathable running shoes for daily fitness & street style.',
  14500,
  19500,
  25,
  43,
  10,
  4.8,
  1234,
  false,
  true,
  true,
  'active',
  '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '{"Material":"Breathable flyknit mesh","Sole":"EVA shock-absorption rubber","Closure":"Lace-up","Origin":"Imported"}'::jsonb,
  '["sneakers","running","shoes","fashion","men"]'::jsonb,
  'Mens Air Sneakers Running Shoes',
  'Ultra-cushioned breathable running shoes for daily fitness & street style.',
  'Mens Air Sneakers Running Shoes'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  images = EXCLUDED.images,
  updated_at = NOW();

INSERT INTO products (
  id, name, slug, sku, category, description, short_description, price, original_price, discount_percentage, stock, low_stock_threshold, rating, review_count, is_flash_deal, is_featured, is_trending, status, images, specifications, keywords, meta_title, meta_description, image_alt_text
) VALUES (
  'prod-2',
  'Premium Wireless Earbuds Pro',
  'premium-wireless-earbuds-pro',
  'MB-ELEC-002',
  'Electronics',
  'Featuring Active Noise Cancellation (ANC), Transparency mode, and up to 36 hours of battery life with Qi wireless charging case. IPX5 water resistance for workouts.',
  'Active noise cancellation earbuds with high-fidelity spatial acoustics.',
  16900,
  24900,
  32,
  38,
  8,
  4.9,
  2631,
  false,
  true,
  true,
  'active',
  '["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '{"Bluetooth":"5.3 Ultra-low latency","ANC":"Up to 35dB noise reduction","Battery":"8h buds / 36h with case","Waterproofing":"IPX5 rated"}'::jsonb,
  '["earbuds","wireless","audio","electronics"]'::jsonb,
  'Premium Wireless Earbuds Pro',
  'Active noise cancellation earbuds with high-fidelity spatial acoustics.',
  'Premium Wireless Earbuds Pro'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  images = EXCLUDED.images,
  updated_at = NOW();

INSERT INTO products (
  id, name, slug, sku, category, description, short_description, price, original_price, discount_percentage, stock, low_stock_threshold, rating, review_count, is_flash_deal, is_featured, is_trending, status, images, specifications, keywords, meta_title, meta_description, image_alt_text
) VALUES (
  'prod-3',
  'Smart Watch Pro',
  'smart-watch-pro',
  'MB-ELEC-003',
  'Electronics',
  'The ultimate flagship smartwatch featuring 1.95-inch Always-on AMOLED display, Titanium bezel, SpO2 blood oxygen sensor, heart rate tracking, GPS routing, and 12-day battery lifespan.',
  '⚡ Limited Time Flash Deal! Premium AMOLED Titanium Smartwatch.',
  42000,
  70000,
  40,
  21,
  5,
  4.9,
  3840,
  true,
  true,
  true,
  'active',
  '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '{"Display":"1.95\" AMOLED 410x502 Retina","Body":"Aviation titanium alloy","Sensors":"SpO2, ECG, Heart Rate, Compass","Battery":"12 days typical use"}'::jsonb,
  '["smartwatch","flashdeal","wearables","electronics"]'::jsonb,
  'Smart Watch Pro',
  '⚡ Limited Time Flash Deal! Premium AMOLED Titanium Smartwatch.',
  'Smart Watch Pro'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  images = EXCLUDED.images,
  updated_at = NOW();

INSERT INTO products (
  id, name, slug, sku, category, description, short_description, price, original_price, discount_percentage, stock, low_stock_threshold, rating, review_count, is_flash_deal, is_featured, is_trending, status, images, specifications, keywords, meta_title, meta_description, image_alt_text
) VALUES (
  'prod-4',
  'Premium Backpack',
  'premium-backpack',
  'MB-ACC-004',
  'Accessories',
  'Waterproof Oxford fabric backpack with anti-theft hidden zippers, dedicated padded 16-inch laptop compartment, and USB charging pass-through port.',
  'Anti-theft waterproof travel and business commuter laptop backpack.',
  8500,
  12000,
  29,
  50,
  12,
  4.7,
  914,
  false,
  true,
  false,
  'active',
  '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '{"Capacity":"28 Litres","LaptopFit":"Up to 16.5 inches","Material":"1680D Water-resistant ballistic nylon","Weight":"850 grams"}'::jsonb,
  '["backpack","accessories","laptop","travel"]'::jsonb,
  'Premium Backpack',
  'Anti-theft waterproof travel and business commuter laptop backpack.',
  'Premium Backpack'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  images = EXCLUDED.images,
  updated_at = NOW();

INSERT INTO products (
  id, name, slug, sku, category, description, short_description, price, original_price, discount_percentage, stock, low_stock_threshold, rating, review_count, is_flash_deal, is_featured, is_trending, status, images, specifications, keywords, meta_title, meta_description, image_alt_text
) VALUES (
  'prod-5',
  'Wireless Headphones',
  'wireless-headphones',
  'MB-ELEC-005',
  'Electronics',
  'Studio-grade over-ear wireless headphones with custom 40mm titanium drivers, plush memory foam ear cushions, and 45-hour playback time.',
  'Over-ear Hi-Res studio headphones with deep bass and plush earcups.',
  22000,
  29900,
  26,
  28,
  6,
  4.8,
  1420,
  false,
  true,
  false,
  'active',
  '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '{"Drivers":"40mm Neodymium Titanium","Battery":"45 hours with fast charge","Codec":"LDAC, AAC, SBC","Weight":"240g"}'::jsonb,
  '["headphones","wireless","music","electronics"]'::jsonb,
  'Wireless Headphones',
  'Over-ear Hi-Res studio headphones with deep bass and plush earcups.',
  'Wireless Headphones'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  images = EXCLUDED.images,
  updated_at = NOW();

INSERT INTO products (
  id, name, slug, sku, category, description, short_description, price, original_price, discount_percentage, stock, low_stock_threshold, rating, review_count, is_flash_deal, is_featured, is_trending, status, images, specifications, keywords, meta_title, meta_description, image_alt_text
) VALUES (
  'prod-6',
  'Smartphone Pro Max',
  'smartphone-pro-max',
  'MB-ELEC-006',
  'Electronics',
  'Flagship 5G smartphone with 6.7-inch Super AMOLED 120Hz display, 200MP Quad camera system, 5000mAh battery, and 120W HyperCharge capability.',
  'Next-generation 5G flagship phone with 200MP pro-grade camera.',
  345000,
  399000,
  14,
  15,
  4,
  4.9,
  1200,
  false,
  true,
  true,
  'active',
  '["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '{"Display":"6.7\" Dynamic AMOLED 2X 120Hz","Camera":"200MP + 50MP + 12MP Periscope","Storage":"256GB / 12GB RAM","Processor":"Octa-Core 4nm"}'::jsonb,
  '["smartphone","mobile","flagship","electronics"]'::jsonb,
  'Smartphone Pro Max',
  'Next-generation 5G flagship phone with 200MP pro-grade camera.',
  'Smartphone Pro Max'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  images = EXCLUDED.images,
  updated_at = NOW();

INSERT INTO products (
  id, name, slug, sku, category, description, short_description, price, original_price, discount_percentage, stock, low_stock_threshold, rating, review_count, is_flash_deal, is_featured, is_trending, status, images, specifications, keywords, meta_title, meta_description, image_alt_text
) VALUES (
  'prod-7',
  'MacBook Air M2',
  'macbook-air-m2',
  'MB-ELEC-007',
  'Electronics',
  'Incredibly thin design in all-aluminum unibody. Powered by the M2 chip with 8-core CPU, 10-core GPU, Liquid Retina display, 1080p FaceTime HD camera, and MagSafe 3 charging.',
  'Strikingly thin, fast, and silent powerhouse with M2 silicon.',
  315000,
  360000,
  12,
  12,
  3,
  4.9,
  1200,
  false,
  true,
  true,
  'active',
  '["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '{"Chip":"Apple M2 8-core CPU / 10-core GPU","Display":"13.6-inch Liquid Retina with True Tone","Memory":"16GB Unified RAM / 512GB SSD","Battery":"Up to 18 hours"}'::jsonb,
  '["laptop","macbook","apple","electronics"]'::jsonb,
  'MacBook Air M2',
  'Strikingly thin, fast, and silent powerhouse with M2 silicon.',
  'MacBook Air M2'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  images = EXCLUDED.images,
  updated_at = NOW();

INSERT INTO products (
  id, name, slug, sku, category, description, short_description, price, original_price, discount_percentage, stock, low_stock_threshold, rating, review_count, is_flash_deal, is_featured, is_trending, status, images, specifications, keywords, meta_title, meta_description, image_alt_text
) VALUES (
  'prod-8',
  'Air Fryer 4.5L',
  'air-fryer-4-5l',
  'MB-HOME-008',
  'Home & Living',
  'Cook crispy, healthy meals with 85% less oil! Rapid 360° air circulation, intuitive digital LED touch panel with 8 one-touch preset cooking modes, and non-stick dishwasher-safe basket.',
  'Digital touch air fryer with 8 one-touch cooking presets.',
  18500,
  24500,
  24,
  30,
  8,
  4.8,
  862,
  false,
  true,
  true,
  'active',
  '["https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '{"Capacity":"4.5 Litres","Power":"1500 Watts","Temperature":"80°C - 200°C","Timer":"60 minutes auto shut-off"}'::jsonb,
  '["kitchen","airfryer","home","appliances"]'::jsonb,
  'Air Fryer 4.5L',
  'Digital touch air fryer with 8 one-touch cooking presets.',
  'Air Fryer 4.5L'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  images = EXCLUDED.images,
  updated_at = NOW();

INSERT INTO products (
  id, name, slug, sku, category, description, short_description, price, original_price, discount_percentage, stock, low_stock_threshold, rating, review_count, is_flash_deal, is_featured, is_trending, status, images, specifications, keywords, meta_title, meta_description, image_alt_text
) VALUES (
  'prod-9',
  'Modern 3-Seater Fabric Sofa',
  'modern-3-seater-fabric-sofa',
  'MB-HOME-009',
  'Home & Living',
  'Upholstered in stain-resistant high-density woven fabric over a solid kiln-dried hardwood frame. High-resilience foam core seating ensures plush relaxation for years.',
  'Scandinavian minimalist 3-seater luxury lounge sofa with solid wood legs.',
  85000,
  110000,
  22,
  8,
  2,
  4.7,
  542,
  false,
  true,
  true,
  'active',
  '["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '{"Dimensions":"210cm W x 88cm D x 84cm H","Upholstery":"Premium breathable textured linen","Frame":"Solid oak and kiln-dried beech","WeightCapacity":"350 kg"}'::jsonb,
  '["sofa","furniture","livingroom","home"]'::jsonb,
  'Modern 3-Seater Fabric Sofa',
  'Scandinavian minimalist 3-seater luxury lounge sofa with solid wood legs.',
  'Modern 3-Seater Fabric Sofa'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  images = EXCLUDED.images,
  updated_at = NOW();

INSERT INTO products (
  id, name, slug, sku, category, description, short_description, price, original_price, discount_percentage, stock, low_stock_threshold, rating, review_count, is_flash_deal, is_featured, is_trending, status, images, specifications, keywords, meta_title, meta_description, image_alt_text
) VALUES (
  'prod-10',
  'Smart LED TV',
  'smart-led-tv',
  'MB-ELEC-010',
  'Electronics',
  '55-inch 4K Ultra HD Frameless Smart LED TV with Dolby Vision, Dolby Atmos stereo audio, Google TV OS with hands-free voice search, and Dual-Band Wi-Fi.',
  '55" 4K UHD Frameless Android Smart TV with Dolby Audio & HDR10+.',
  125000,
  155000,
  19,
  13,
  4,
  4.8,
  940,
  false,
  true,
  true,
  'active',
  '["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '{"ScreenSize":"55 Inch (140 cm)","Resolution":"3840 x 2160 Pixels (4K)","Sound":"24W Box Speakers with Dolby Atmos","Connectivity":"3x HDMI 2.1, 2x USB, Bluetooth 5.0"}'::jsonb,
  '["tv","smarttv","4k","electronics"]'::jsonb,
  'Smart LED TV',
  '55" 4K UHD Frameless Android Smart TV with Dolby Audio & HDR10+.',
  'Smart LED TV'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  images = EXCLUDED.images,
  updated_at = NOW();

INSERT INTO products (
  id, name, slug, sku, category, description, short_description, price, original_price, discount_percentage, stock, low_stock_threshold, rating, review_count, is_flash_deal, is_featured, is_trending, status, images, specifications, keywords, meta_title, meta_description, image_alt_text
) VALUES (
  'prod-11',
  'Gaming Laptop',
  'gaming-laptop',
  'MB-ELEC-011',
  'Electronics',
  'Dominate any competitive match with Intel Core i7 13th Gen, NVIDIA GeForce RTX 4060 8GB GDDR6, 165Hz QHD display, and dual-fan liquid cooling heatsink.',
  'RTX 4060 powered powerhouse gaming rig with 165Hz QHD IPS screen.',
  295000,
  340000,
  13,
  10,
  3,
  4.9,
  450,
  false,
  true,
  true,
  'active',
  '["https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '{"Processor":"Intel Core i7-13700H (14-Core)","GPU":"NVIDIA GeForce RTX 4060 (8GB)","RAM":"32GB DDR5 5200MHz","Storage":"1TB NVMe PCIe 4.0 SSD"}'::jsonb,
  '["gaming","laptop","rtx","electronics"]'::jsonb,
  'Gaming Laptop',
  'RTX 4060 powered powerhouse gaming rig with 165Hz QHD IPS screen.',
  'Gaming Laptop'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  images = EXCLUDED.images,
  updated_at = NOW();

INSERT INTO products (
  id, name, slug, sku, category, description, short_description, price, original_price, discount_percentage, stock, low_stock_threshold, rating, review_count, is_flash_deal, is_featured, is_trending, status, images, specifications, keywords, meta_title, meta_description, image_alt_text
) VALUES (
  'prod-12',
  'Leather Handbag',
  'leather-handbag',
  'MB-FASH-012',
  'Fashion',
  'Handcrafted from 100% genuine top-grain pebble leather. Features polished gold-tone hardware, protective bottom studs, interior divider, and removable cross-body strap.',
  'Top-grain luxury pebble leather tote bag with gold-tone hardware.',
  11500,
  16000,
  28,
  25,
  6,
  4.7,
  310,
  false,
  false,
  false,
  'active',
  '["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '{"Material":"100% Genuine Pebble Leather","Hardware":"Polished anti-tarnish gold brass","Dimensions":"32cm x 24cm x 13cm","StrapDrop":"Adjustable 45cm - 58cm"}'::jsonb,
  '["handbag","leather","fashion","women"]'::jsonb,
  'Leather Handbag',
  'Top-grain luxury pebble leather tote bag with gold-tone hardware.',
  'Leather Handbag'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  images = EXCLUDED.images,
  updated_at = NOW();

INSERT INTO products (
  id, name, slug, sku, category, description, short_description, price, original_price, discount_percentage, stock, low_stock_threshold, rating, review_count, is_flash_deal, is_featured, is_trending, status, images, specifications, keywords, meta_title, meta_description, image_alt_text
) VALUES (
  'prod-13',
  'Face Serum',
  'face-serum',
  'MB-BEAU-013',
  'Beauty',
  'Formulated with 10% Pure Vitamin C, Hyaluronic Acid, and Niacinamide to restore skin radiance, diminish fine lines, and deeply hydrate skin cells.',
  'Advanced brightening Vitamin C & Hyaluronic anti-aging serum.',
  4200,
  5800,
  27,
  60,
  15,
  4.8,
  880,
  false,
  false,
  false,
  'active',
  '["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1608248597359-0091811a43a8?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '{"Volume":"30ml / 1.0 fl. oz.","SkinType":"All skin types, dermatologist tested","ActiveIngredients":"10% Ascorbic Acid, 2% Hyaluronic Acid","CrueltyFree":"Yes, vegan formula"}'::jsonb,
  '["skincare","serum","beauty","glow"]'::jsonb,
  'Face Serum',
  'Advanced brightening Vitamin C & Hyaluronic anti-aging serum.',
  'Face Serum'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  images = EXCLUDED.images,
  updated_at = NOW();

INSERT INTO products (
  id, name, slug, sku, category, description, short_description, price, original_price, discount_percentage, stock, low_stock_threshold, rating, review_count, is_flash_deal, is_featured, is_trending, status, images, specifications, keywords, meta_title, meta_description, image_alt_text
) VALUES (
  'prod-14',
  'Perfume',
  'perfume',
  'MB-BEAU-014',
  'Beauty',
  'An intoxicating oriental woody fragrance blending velvety Damascus rose, smoky agarwood (oud), and warm vanilla amber. Long-lasting sillage exceeding 14 hours.',
  'Luxury Eau De Parfum with rich notes of Arabian Oud and Royal Amber.',
  9500,
  13500,
  29,
  35,
  8,
  4.9,
  620,
  false,
  false,
  false,
  'active',
  '["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '{"Concentration":"Eau De Parfum (EDP)","Volume":"100ml / 3.4 fl. oz.","TopNotes":"Bergamot, Saffron, Pink Pepper","HeartNotes":"Damascus Rose, Agarwood","BaseNotes":"Amber, Cedarwood, Musk"}'::jsonb,
  '["perfume","fragrance","oud","beauty"]'::jsonb,
  'Perfume',
  'Luxury Eau De Parfum with rich notes of Arabian Oud and Royal Amber.',
  'Perfume'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  images = EXCLUDED.images,
  updated_at = NOW();

INSERT INTO products (
  id, name, slug, sku, category, description, short_description, price, original_price, discount_percentage, stock, low_stock_threshold, rating, review_count, is_flash_deal, is_featured, is_trending, status, images, specifications, keywords, meta_title, meta_description, image_alt_text
) VALUES (
  'prod-15',
  'Sports Dumbbells',
  'sports-dumbbells',
  'MB-SPRT-015',
  'Sports',
  'Cast iron hex dumbbells with non-slip knurled chrome handles and durable odorless rubber coating to protect home flooring and prevent rolling.',
  'Pair of rubber-encased hex dumbbells with ergonomic knurled grips.',
  7800,
  10500,
  25,
  24,
  5,
  4.8,
  420,
  false,
  false,
  false,
  'active',
  '["https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '{"Weight":"10kg Pair (5kg each)","Material":"Cast iron core with virgin rubber casing","Grip":"Ergonomic non-slip diamond knurling","Shape":"Anti-roll hex design"}'::jsonb,
  '["dumbbells","fitness","workout","sports"]'::jsonb,
  'Sports Dumbbells',
  'Pair of rubber-encased hex dumbbells with ergonomic knurled grips.',
  'Sports Dumbbells'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  images = EXCLUDED.images,
  updated_at = NOW();

INSERT INTO products (
  id, name, slug, sku, category, description, short_description, price, original_price, discount_percentage, stock, low_stock_threshold, rating, review_count, is_flash_deal, is_featured, is_trending, status, images, specifications, keywords, meta_title, meta_description, image_alt_text
) VALUES (
  'prod-16',
  'Coffee Maker',
  'coffee-maker',
  'MB-HOME-016',
  'Home & Living',
  '15-Bar Italian high-pressure pump espresso and cappuccino maker with high-power milk frothing steam wand, 1.5L removable water reservoir, and dual cup portafilter.',
  '15-Bar authentic Italian pump espresso maker with microfoam steam wand.',
  21500,
  28000,
  23,
  18,
  5,
  4.7,
  390,
  false,
  false,
  false,
  'active',
  '["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '{"PumpPressure":"15 Bar Italian ULKA pump","WaterTank":"1.5 Litre transparent removable","Boiler":"Fast-heating Die-cast aluminum alloy","Power":"1050 Watts"}'::jsonb,
  '["coffee","espresso","kitchen","home"]'::jsonb,
  'Coffee Maker',
  '15-Bar authentic Italian pump espresso maker with microfoam steam wand.',
  'Coffee Maker'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  images = EXCLUDED.images,
  updated_at = NOW();

INSERT INTO products (
  id, name, slug, sku, category, description, short_description, price, original_price, discount_percentage, stock, low_stock_threshold, rating, review_count, is_flash_deal, is_featured, is_trending, status, images, specifications, keywords, meta_title, meta_description, image_alt_text
) VALUES (
  'prod-17',
  'Office Chair',
  'office-chair',
  'MB-HOME-017',
  'Home & Living',
  'Full ergonomic mesh high-back executive desk chair with adjustable lumbar support, 3D armrests, 135° recline with lock, and Class-4 heavy-duty gas cylinder.',
  'Breathable high-back ergonomic mesh office chair with adaptive lumbar.',
  26000,
  34000,
  23,
  16,
  4,
  4.8,
  512,
  false,
  false,
  false,
  'active',
  '["https://images.unsplash.com/photo-1580481077195-c22ae425712e?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '{"Material":"High elasticity Korean breathable mesh","Base":"Reinforced 5-star aluminum alloy","WeightCapacity":"160 kg","Certification":"BIFMA and SGS certified"}'::jsonb,
  '["chair","ergonomic","office","furniture"]'::jsonb,
  'Office Chair',
  'Breathable high-back ergonomic mesh office chair with adaptive lumbar.',
  'Office Chair'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  images = EXCLUDED.images,
  updated_at = NOW();

INSERT INTO products (
  id, name, slug, sku, category, description, short_description, price, original_price, discount_percentage, stock, low_stock_threshold, rating, review_count, is_flash_deal, is_featured, is_trending, status, images, specifications, keywords, meta_title, meta_description, image_alt_text
) VALUES (
  'prod-18',
  'Smartphone Case',
  'smartphone-case',
  'MB-ACC-018',
  'Accessories',
  'Military-grade 10-foot drop-tested hybrid phone case with magnetic ring for MagSafe wireless charging, raised camera lip, and anti-yellowing German TPU.',
  'Shockproof magnetic clear case with military drop protection.',
  1800,
  2800,
  35,
  120,
  20,
  4.6,
  290,
  false,
  false,
  false,
  'active',
  '["https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '{"DropProtection":"10ft / 3m Military Standard 810G","MagnetStrength":"N52 Neodymium array","Compatibility":"All modern flagships"}'::jsonb,
  '["case","smartphone","magsafe","accessories"]'::jsonb,
  'Smartphone Case',
  'Shockproof magnetic clear case with military drop protection.',
  'Smartphone Case'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  images = EXCLUDED.images,
  updated_at = NOW();

INSERT INTO products (
  id, name, slug, sku, category, description, short_description, price, original_price, discount_percentage, stock, low_stock_threshold, rating, review_count, is_flash_deal, is_featured, is_trending, status, images, specifications, keywords, meta_title, meta_description, image_alt_text
) VALUES (
  'prod-19',
  'Running Shoes',
  'running-shoes',
  'MB-FASH-019',
  'Fashion',
  'Lightweight marathon-ready running sneakers equipped with energy-returning carbon-infused plate and high-traction Continental rubber tread for all weather.',
  'Carbon-plate enhanced lightweight running shoes for speed & endurance.',
  12500,
  17000,
  26,
  32,
  8,
  4.7,
  680,
  false,
  false,
  false,
  'active',
  '["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '{"Weight":"215 grams","Drop":"8mm heel-to-toe drop","Upper":"Single-layer engineered jacquard mesh","Outsole":"High-abrasion Continental rubber"}'::jsonb,
  '["shoes","running","marathon","fashion"]'::jsonb,
  'Running Shoes',
  'Carbon-plate enhanced lightweight running shoes for speed & endurance.',
  'Running Shoes'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  images = EXCLUDED.images,
  updated_at = NOW();

INSERT INTO products (
  id, name, slug, sku, category, description, short_description, price, original_price, discount_percentage, stock, low_stock_threshold, rating, review_count, is_flash_deal, is_featured, is_trending, status, images, specifications, keywords, meta_title, meta_description, image_alt_text
) VALUES (
  'prod-20',
  'Kitchen Organizer',
  'kitchen-organizer',
  'MB-HOME-020',
  'Home & Living',
  'Expandable heavy-duty carbon steel dish drying rack and utensil holder with 360° automatic drainage spout, rust-proof matte black powder coating, and knife block.',
  'Rust-proof expandable 2-tier dish drying rack and countertop organizer.',
  5400,
  7500,
  28,
  42,
  10,
  4.8,
  340,
  false,
  false,
  false,
  'active',
  '["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80"]'::jsonb,
  '{"Material":"Anti-rust coated carbon steel","Drainage":"360-degree swivel spout","Dimensions":"42cm x 30cm x 15cm","WeightCapacity":"25 kg"}'::jsonb,
  '["kitchen","organizer","storage","home"]'::jsonb,
  'Kitchen Organizer',
  'Rust-proof expandable 2-tier dish drying rack and countertop organizer.',
  'Kitchen Organizer'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  images = EXCLUDED.images,
  updated_at = NOW();

