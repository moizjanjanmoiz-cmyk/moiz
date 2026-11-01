async function testHttpEndpoints() {
  const baseUrl = 'http://127.0.0.1:3000';
  console.log('====================================================');
  console.log('   MEGABAZAR HTTP API & ROUTE AVAILABILITY TEST     ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. API Routes Tests
  console.log('--- 1. Testing REST API Endpoints ---');

  // GET /api/products
  try {
    const res = await fetch(`${baseUrl}/api/products`);
    const data = await res.json();
    assert(
      res.status === 200 && data.success && Array.isArray(data.products),
      `GET /api/products returned ${data.products?.length} products`
    );
  } catch (err: any) {
    assert(false, `GET /api/products failed: ${err.message}`);
  }

  // GET /api/categories
  try {
    const res = await fetch(`${baseUrl}/api/categories`);
    const data = await res.json();
    assert(
      res.status === 200 && data.success && Array.isArray(data.categories),
      `GET /api/categories returned ${data.categories?.length} categories`
    );
  } catch (err: any) {
    assert(false, `GET /api/categories failed: ${err.message}`);
  }

  // GET /api/settings
  try {
    const res = await fetch(`${baseUrl}/api/settings`);
    const data = await res.json();
    assert(
      res.status === 200 && data.success && data.settings?.storeName,
      `GET /api/settings returned storeName "${data.settings?.storeName}"`
    );
  } catch (err: any) {
    assert(false, `GET /api/settings failed: ${err.message}`);
  }

  // POST /api/products (Create test product with raw WhatsApp input)
  const testId = `http-test-${Date.now()}`;
  try {
    const res = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: testId,
        name: 'HTTP Test Wireless Headphones',
        slug: `http-test-wireless-headphones-${Date.now()}`,
        sku: 'MB-HTTP-001',
        category: 'Electronics',
        price: 4999,
        stock: 50,
        whatsappNumber: '03182204441',
      }),
    });
    const data = await res.json();
    assert(
      res.status === 201 && data.success && data.product?.whatsappNumber === '923182204441',
      `POST /api/products created product with sanitized WhatsApp: ${data.product?.whatsappNumber}`
    );
  } catch (err: any) {
    assert(false, `POST /api/products failed: ${err.message}`);
  }

  // GET /api/products/[id]
  try {
    const res = await fetch(`${baseUrl}/api/products/${testId}`);
    const data = await res.json();
    assert(
      res.status === 200 && data.success && data.product?.id === testId,
      `GET /api/products/${testId} retrieved newly created product`
    );
  } catch (err: any) {
    assert(false, `GET /api/products/[id] failed: ${err.message}`);
  }

  // PUT /api/products/[id] (With admin header)
  try {
    const res = await fetch(`${baseUrl}/api/products/${testId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-auth': 'true',
      },
      body: JSON.stringify({
        price: 4500,
        stock: 45,
      }),
    });
    const data = await res.json();
    assert(
      res.status === 200 && data.success && data.product?.price === 4500,
      'PUT /api/products/[id] updated price and stock with admin auth'
    );
  } catch (err: any) {
    assert(false, `PUT /api/products/[id] failed: ${err.message}`);
  }

  // POST /api/orders (Create test order)
  const testOrderId = `order-http-${Date.now()}`;
  try {
    const res = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: testOrderId,
        orderNumber: `ORD-HTTP-${Date.now().toString().slice(-6)}`,
        customerId: 'guest',
        customerName: 'Fatima Zahra',
        email: 'fatima@test.com',
        phone: '03211234567',
        shippingAddress: {
          fullName: 'Fatima Zahra',
          phone: '03211234567',
          address: 'Gulberg III, Lahore',
          city: 'Lahore',
          province: 'Punjab',
          postalCode: '54000',
          country: 'Pakistan',
        },
        items: [
          {
            productId: testId,
            name: 'HTTP Test Wireless Headphones',
            image: '',
            price: 4500,
            quantity: 1,
          },
        ],
        quantities: 1,
        paymentMethod: 'jazzcash',
        paymentStatus: 'paid',
        orderStatus: 'Confirmed',
        subtotal: 4500,
        shippingFee: 0,
        grandTotal: 4500,
      }),
    });
    const data = await res.json();
    assert(
      (res.status === 200 || res.status === 201) && data.success,
      'POST /api/orders created test order successfully'
    );
  } catch (err: any) {
    assert(false, `POST /api/orders failed: ${err.message}`);
  }

  // DELETE /api/products/[id] (With admin header)
  try {
    const res = await fetch(`${baseUrl}/api/products/${testId}`, {
      method: 'DELETE',
      headers: {
        'x-admin-auth': 'true',
      },
    });
    const data = await res.json();
    assert(
      res.status === 200 && data.success,
      'DELETE /api/products/[id] deleted product with admin security gate'
    );
  } catch (err: any) {
    assert(false, `DELETE /api/products/[id] failed: ${err.message}`);
  }

  // 2. Key Pages Status Tests
  console.log('\n--- 2. Testing Key Frontend Route HTML Status ---');
  const pagesToTest = [
    '/',
    '/products',
    '/product/prod-1',
    '/category/electronics',
    '/deals',
    '/cart',
    '/checkout',
    '/login',
    '/register',
    '/about',
    '/contact',
    '/admin/login',
  ];

  for (const page of pagesToTest) {
    try {
      const res = await fetch(`${baseUrl}${page}`);
      assert(res.status === 200, `Page "${page}" responded with status ${res.status}`);
    } catch (err: any) {
      assert(false, `Page "${page}" failed: ${err.message}`);
    }
  }

  console.log('\n====================================================');
  console.log(`  HTTP API & ROUTE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

testHttpEndpoints();
