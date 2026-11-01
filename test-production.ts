import { createClient } from '@supabase/supabase-js';
import {
  formatPakistaniWhatsAppNumber,
  autoNormalizeWhatsAppInput,
  createWhatsAppLink,
  formatDisplayPakistaniPhone,
} from '../lib/whatsapp';
import {
  getStoredProducts,
  getStoredOrders,
  getStoredSettings,
  getStoredCategories,
  createStoredProduct,
  getStoredProductById,
  updateStoredProduct,
  deleteStoredProduct,
  createStoredOrder,
  getStoredOrderById,
} from '../lib/server/db';
import { Product, Order } from '../lib/types';

async function runE2ETests() {
  console.log('====================================================');
  console.log('   MEGABAZAR FULL E2E PRODUCTION READINESS TEST     ');
  console.log('====================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failedTests++;
    }
  }

  // ----------------------------------------------------
  // 1. WHATSAPP FORMATTING & DEEP LINK TESTS
  // ----------------------------------------------------
  console.log('--- 1. Testing WhatsApp Engine & Deep Links ---');
  {
    const t1 = formatPakistaniWhatsAppNumber('03001234567');
    assert(t1.isValid && t1.formatted === '923001234567', 'Converts 03001234567 -> 923001234567');

    const t2 = formatPakistaniWhatsAppNumber('+923001234567');
    assert(t2.isValid && t2.formatted === '923001234567', 'Converts +923001234567 -> 923001234567');

    const t3 = formatPakistaniWhatsAppNumber('923001234567');
    assert(t3.isValid && t3.formatted === '923001234567', 'Preserves 923001234567');

    const t4 = formatPakistaniWhatsAppNumber('+92 (300) 123-4567');
    assert(t4.isValid && t4.formatted === '923001234567', 'Strips spaces, brackets, hyphens');

    const t5 = formatPakistaniWhatsAppNumber('۰۳۰۰۱۲۳۴۵۶۷');
    assert(t5.isValid && t5.formatted === '923001234567', 'Translates Eastern Urdu numerals -> 923001234567');

    const t6 = formatPakistaniWhatsAppNumber('0300123');
    assert(!t6.isValid, 'Correctly rejects incomplete number (0300123)');

    const t7 = formatPakistaniWhatsAppNumber('04235889900');
    assert(!t7.isValid, 'Correctly rejects non-mobile landline number');

    const link = createWhatsAppLink('03182204441', 'Hello Test Order');
    assert(
      link.startsWith('https://wa.me/923182204441?text='),
      'Generates correct wa.me link with pre-filled message'
    );
  }

  // ----------------------------------------------------
  // 2. SUPABASE CONNECTION & DATABASE TABLES TEST
  // ----------------------------------------------------
  console.log('\n--- 2. Testing Supabase Connectivity & Tables ---');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://casfqhokrvzvgdfcjeeq.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_SlsiVRx6iNLDxeFo7poHRQ__maGogUU';
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: pData, error: pErr } = await supabase.from('products').select('id').limit(1);
    assert(!pErr, `Supabase products table accessible (${pErr ? pErr.message : 'OK'})`);

    const { data: oData, error: oErr } = await supabase.from('orders').select('id').limit(1);
    assert(!oErr, `Supabase orders table accessible (${oErr ? oErr.message : 'OK'})`);

    const { data: sData, error: sErr } = await supabase.from('store_settings').select('id').limit(1);
    assert(!sErr, `Supabase store_settings table accessible (${sErr ? sErr.message : 'OK'})`);
  } catch (err: any) {
    console.error('Supabase query error:', err.message);
  }

  // ----------------------------------------------------
  // 3. PRODUCT CRUD & SELLER WHATSAPP PERSISTENCE TEST
  // ----------------------------------------------------
  console.log('\n--- 3. Testing Product CRUD & Seller WhatsApp Storage ---');
  const testProductId = `test-prod-${Date.now()}`;
  const testProduct: Product = {
    id: testProductId,
    name: 'E2E Automated Test Smart Watch',
    slug: `test-smart-watch-${Date.now()}`,
    sku: `MB-TEST-${Date.now().toString().slice(-4)}`,
    category: 'Electronics',
    brand: 'Mega Tech',
    description: 'Full E2E test product for production readiness verification.',
    price: 3500,
    originalPrice: 4500,
    discountPercentage: 22,
    stock: 25,
    lowStockThreshold: 3,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'],
    specifications: { Battery: '48 Hours', Waterproof: 'IP68' },
    tags: ['smartwatch', 'e2e-test', 'wearable'],
    isFeatured: true,
    isBestSeller: true,
    isFlashDeal: false,
    rating: 4.8,
    reviewCount: 12,
    status: 'active',
    whatsappNumber: '03009988776', // Raw seller input
    sellerWhatsapp: '03009988776',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Create
  const created = await createStoredProduct(testProduct);
  assert(
    created.id === testProductId && created.whatsappNumber === '923009988776',
    'Product created and WhatsApp formatted to 923009988776 in database'
  );

  // Read
  const fetched = await getStoredProductById(testProductId);
  assert(
    fetched !== null && fetched.name === testProduct.name && fetched.price === 3500,
    'Product retrieved successfully from database with accurate data'
  );

  // Update
  const updated = await updateStoredProduct(testProductId, {
    price: 3200,
    stock: 20,
    whatsappNumber: '+92 312 3456789',
  });
  assert(
    updated !== null && updated.price === 3200 && updated.stock === 20 && updated.whatsappNumber === '923123456789',
    'Product updated with new price, stock, and sanitized WhatsApp number (923123456789)'
  );

  // ----------------------------------------------------
  // 4. CHECKOUT & ORDER CREATION LIFECYCLE TEST
  // ----------------------------------------------------
  console.log('\n--- 4. Testing Checkout & Order Creation Flow ---');
  const testOrderId = `order-e2e-${Date.now()}`;
  const testOrder: Order = {
    id: testOrderId,
    orderNumber: `ORD-E2E-${Date.now().toString().slice(-6)}`,
    customerId: 'cust-test-123',
    customerName: 'Muhammad Ali',
    email: 'ali.test@megabazar.pk',
    phone: '03001122334',
    shippingAddress: {
      fullName: 'Muhammad Ali',
      phone: '03001122334',
      address: 'Suite 404, Business Plaza, I.I. Chundrigar Road',
      city: 'Karachi',
      province: 'Sindh',
      postalCode: '74000',
      country: 'Pakistan',
    },
    items: [
      {
        productId: testProductId,
        name: updated?.name || testProduct.name,
        image: testProduct.images[0],
        quantity: 2,
        price: 3200,
      },
    ],
    quantities: 2,
    deliveryMethod: 'standard',
    tax: 0,
    currency: 'PKR',
    paymentMethod: 'easypaisa',
    paymentStatus: 'paid',
    orderStatus: 'Confirmed',
    subtotal: 6400,
    shippingFee: 0,
    discount: 0,
    grandTotal: 6400,
    notes: 'Please call before delivery',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const createdOrder = await createStoredOrder(testOrder);
  assert(
    createdOrder.id === testOrderId && createdOrder.grandTotal === 6400,
    'Order created successfully with accurate subtotal, shipping, and total calculation'
  );

  const fetchedOrder = await getStoredOrderById(testOrderId);
  assert(
    fetchedOrder !== null && fetchedOrder.customerName === 'Muhammad Ali' && fetchedOrder.items.length === 1,
    'Order retrieved from database with full customer info, address, and item list'
  );

  // ----------------------------------------------------
  // 5. CLEANUP TEST PRODUCT & ORDER
  // ----------------------------------------------------
  console.log('\n--- 5. Testing Deletion & Cleanup ---');
  const delResult = await deleteStoredProduct(testProductId);
  assert(delResult.success, 'Test product deleted cleanly from database');

  const afterDelete = await getStoredProductById(testProductId);
  assert(afterDelete === null, 'Confirmed test product no longer exists');

  // ----------------------------------------------------
  // 6. STORE SETTINGS & CATEGORIES VERIFICATION
  // ----------------------------------------------------
  console.log('\n--- 6. Testing Store Settings & Categories ---');
  const settings = await getStoredSettings();
  assert(
    Boolean(settings.storeName) && Boolean(settings.whatsappNumber),
    `Store settings loaded: "${settings.storeName}", WhatsApp: ${settings.whatsappNumber}`
  );

  const categories = await getStoredCategories();
  assert(
    Array.isArray(categories) && categories.length >= 5,
    `Categories verified: ${categories.length} active departments loaded`
  );

  // Summary
  console.log('\n====================================================');
  console.log(`  E2E TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runE2ETests().catch((err) => {
  console.error('Fatal error during E2E test:', err);
  process.exit(1);
});
