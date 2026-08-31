import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SHOPNOVA Database Seeding...');

  // Clean existing database
  await prisma.walletTransaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.recentlyViewed.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.review.deleteMany();
  await prisma.shipmentTracking.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Core Users
  console.log('👤 Creating Users...');
  const customer = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      passwordHash,
      name: 'Alex Johnson',
      role: 'CUSTOMER',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
      wallet: {
        create: {
          balance: 1500.0,
          currency: 'INR',
          transactions: {
            create: [
              { amount: 1500.0, type: 'CREDIT', description: 'Welcome Bonus Credit' }
            ]
          }
        }
      },
      addresses: {
        create: [
          {
            label: 'Home',
            fullName: 'Alex Johnson',
            phone: '+91 98765 43210',
            streetAddress: '42 Tech Park Avenue, HSR Layout, Sector 2',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560102',
            country: 'India',
            isDefault: true
          },
          {
            label: 'Office',
            fullName: 'Alex Johnson',
            phone: '+91 98765 43210',
            streetAddress: 'Level 8, Innovation Tower, Cyber City',
            city: 'Gurugram',
            state: 'Haryana',
            postalCode: '122002',
            country: 'India',
            isDefault: false
          }
        ]
      }
    }
  });

  const sellerUser = await prisma.user.create({
    data: {
      email: 'seller@example.com',
      passwordHash,
      name: 'Sarah Miller',
      role: 'SELLER',
      phone: '+91 98123 45678',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      isVerified: true,
      sellerProfile: {
        create: {
          companyName: 'Apex Electronics & Tech Solutions Pvt Ltd',
          storeName: 'Apex Tech Official',
          storeLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
          bio: 'Authorized seller of flagship smartphones, premium audio gear, and cutting-edge tech accessories.',
          taxId: '29ABCDE1234F1Z5',
          businessAddress: '108 Industrial Hub, Electronic City Phase 1, Bengaluru 560100',
          bankAccount: 'HDFC Bank - AC: ********4920',
          rating: 4.8,
          isApproved: true
        }
      }
    },
    include: { sellerProfile: true }
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash,
      name: 'Platform Administrator',
      role: 'ADMIN',
      phone: '+91 99000 11223',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      isVerified: true
    }
  });

  const sellerProfileId = sellerUser.sellerProfile!.id;

  // 2. Create Categories
  console.log('📁 Creating Categories...');
  const categoryData = [
    { name: 'Smartphones & Mobile', slug: 'smartphones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80' },
    { name: 'Laptops & Computers', slug: 'laptops', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80' },
    { name: 'Audio & Headphones', slug: 'audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' },
    { name: 'Wearables & Smartwatches', slug: 'wearables', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80' },
    { name: 'Gaming & Consoles', slug: 'gaming', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80' },
    { name: 'Cameras & Photography', slug: 'cameras', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80' },
    { name: 'Smart Home & Appliances', slug: 'smart-home', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80' },
    { name: 'Fashion & Apparel', slug: 'fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80' },
    { name: 'Home & Kitchen', slug: 'home-kitchen', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80' },
    { name: 'Books & Media', slug: 'books', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80' }
  ];

  const categoriesMap: Record<string, string> = {};
  for (const cat of categoryData) {
    const created = await prisma.category.create({ data: cat });
    categoriesMap[cat.slug] = created.id;
  }

  // 3. Create Brands
  console.log('🏷️ Creating Brands...');
  const brandData = [
    { name: 'Apple', slug: 'apple', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=200&q=80' },
    { name: 'Samsung', slug: 'samsung', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=200&q=80' },
    { name: 'Sony', slug: 'sony', logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=200&q=80' },
    { name: 'Bose', slug: 'bose', logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80' },
    { name: 'Dell', slug: 'dell', logo: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=200&q=80' },
    { name: 'Nike', slug: 'nike', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80' },
    { name: 'Adidas', slug: 'adidas', logo: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=200&q=80' },
    { name: 'Asus ROG', slug: 'asus', logo: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=200&q=80' },
    { name: 'Logitech', slug: 'logitech', logo: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=200&q=80' },
    { name: 'Dyson', slug: 'dyson', logo: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=200&q=80' }
  ];

  const brandsMap: Record<string, string> = {};
  for (const b of brandData) {
    const created = await prisma.brand.create({ data: b });
    brandsMap[b.slug] = created.id;
  }

  // Helper for generating products
  const productCatalogTemplates = [
    // Smartphones
    {
      title: 'Apple iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max',
      category: 'smartphones',
      brand: 'apple',
      price: 134900,
      originalPrice: 149900,
      description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',
      isFeatured: true,
      isTrending: true,
      rating: 4.9,
      reviewCount: 342,
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1695048133021-3965b6f3c1db?auto=format&fit=crop&w=800&q=80'
      ],
      specs: [
        { key: 'Display', value: '6.7-inch Super Retina XDR OLED, 120Hz ProMotion' },
        { key: 'Chipset', value: 'Apple A17 Pro (3nm)' },
        { key: 'Camera', value: '48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto' }
      ]
    },
    {
      title: 'Samsung Galaxy S24 Ultra 5G',
      slug: 'samsung-s24-ultra',
      category: 'smartphones',
      brand: 'samsung',
      price: 129999,
      originalPrice: 139999,
      description: 'Welcome to the era of mobile AI. With Galaxy AI in your hands, unlock whole new levels of creativity, productivity, and possibility starting with your S24 Ultra.',
      isFeatured: true,
      isTrending: true,
      rating: 4.8,
      reviewCount: 289,
      images: [
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80'
      ],
      specs: [
        { key: 'Display', value: '6.8-inch Dynamic AMOLED 2X, 2600 nits Peak Brightness' },
        { key: 'Processor', value: 'Snapdragon 8 Gen 3 for Galaxy' },
        { key: 'Camera', value: '200MP Quad Telephoto System with Galaxy AI' }
      ]
    },
    // Laptops
    {
      title: 'Apple MacBook Pro 16" M3 Max',
      slug: 'macbook-pro-16-m3-max',
      category: 'laptops',
      brand: 'apple',
      price: 349900,
      originalPrice: 399900,
      description: 'Mind-blowing performance. Liquid Retina XDR display. Up to 22 hours of battery life. MacBook Pro is the ultimate pro laptop.',
      isFeatured: true,
      isTrending: true,
      rating: 4.95,
      reviewCount: 156,
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80'
      ],
      specs: [
        { key: 'Processor', value: 'Apple M3 Max 16-Core CPU, 40-Core GPU' },
        { key: 'Memory', value: '48GB Unified Memory' },
        { key: 'Storage', value: '1TB Superfast SSD' }
      ]
    },
    {
      title: 'Dell XPS 15 OLED Touch Laptop',
      slug: 'dell-xps-15-oled',
      category: 'laptops',
      brand: 'dell',
      price: 189990,
      originalPrice: 219990,
      description: 'Stunning 3.5K OLED touch display powered by 13th Gen Intel Core i9 processor and NVIDIA GeForce RTX 4070 graphics.',
      isFeatured: true,
      isTrending: false,
      rating: 4.7,
      reviewCount: 94,
      images: [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'
      ],
      specs: [
        { key: 'CPU', value: 'Intel Core i9-13900H' },
        { key: 'GPU', value: 'NVIDIA RTX 4070 8GB' },
        { key: 'Display', value: '15.6" 3.5K (3456 x 2160) OLED Touch' }
      ]
    },
    {
      title: 'ASUS ROG Zephyrus G16 Gaming Laptop',
      slug: 'asus-rog-zephyrus-g16',
      category: 'gaming',
      brand: 'asus',
      price: 214990,
      originalPrice: 239990,
      description: 'Ultra-thin ROG Nebula OLED 240Hz display, Intel Core Ultra 9 processor, and RTX 4080 graphics in a sleek aluminum chassis.',
      isFeatured: true,
      isTrending: true,
      rating: 4.85,
      reviewCount: 112,
      images: [
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80'
      ],
      specs: [
        { key: 'Screen', value: '16" 2.5K 240Hz OLED' },
        { key: 'Graphics', value: 'NVIDIA GeForce RTX 4080 12GB' },
        { key: 'Cooling', value: 'Tri-Fan Technology with Liquid Metal' }
      ]
    },
    // Audio
    {
      title: 'Sony WH-1000XM5 Wireless Headphones',
      slug: 'sony-wh1000xm5',
      category: 'audio',
      brand: 'sony',
      price: 29990,
      originalPrice: 34990,
      description: 'Industry-leading noise canceling with 8 microphones and Auto NC Optimizer. Crystal clear hands-free calling with 4 beamforming microphones.',
      isFeatured: true,
      isTrending: true,
      rating: 4.8,
      reviewCount: 412,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
      ],
      specs: [
        { key: 'Battery', value: 'Up to 30 hours with fast charging' },
        { key: 'ANC', value: 'Integrated Processor V1 & Auto NC Optimizer' },
        { key: 'Codecs', value: 'LDAC, AAC, SBC' }
      ]
    },
    {
      title: 'Bose QuietComfort Ultra Earbuds',
      slug: 'bose-quietcomfort-ultra',
      category: 'audio',
      brand: 'bose',
      price: 24900,
      originalPrice: 28900,
      description: 'Breakthrough spatialized audio for more immersive listening that makes your music feel realer than ever before, plus world-class noise cancellation.',
      isFeatured: false,
      isTrending: true,
      rating: 4.75,
      reviewCount: 178,
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'
      ],
      specs: [
        { key: 'Audio', value: 'Bose Immersive Spatial Audio' },
        { key: 'Microphones', value: '9 total microphones for clear voice pickup' }
      ]
    },
    // Wearables
    {
      title: 'Apple Watch Ultra 2 GPS + Cellular',
      slug: 'apple-watch-ultra-2',
      category: 'wearables',
      brand: 'apple',
      price: 89900,
      originalPrice: 89900,
      description: 'The ultimate sports and adventure watch features a lightweight titanium case, extra-long battery life, and the brightest Apple display ever.',
      isFeatured: true,
      isTrending: true,
      rating: 4.9,
      reviewCount: 203,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
      ],
      specs: [
        { key: 'Case', value: '49mm Titanium Case, Sapphire Front Crystal' },
        { key: 'Brightness', value: '3000 nits Peak Always-On Display' },
        { key: 'Water Resistance', value: '100m Water Resistant, High-Altitude Diving' }
      ]
    },
    // Fashion
    {
      title: 'Nike Air Jordan 1 Retro High OG',
      slug: 'nike-air-jordan-1-retro',
      category: 'fashion',
      brand: 'nike',
      price: 16995,
      originalPrice: 18995,
      description: 'The sneaker that started it all. Premium leather construction, classic Jordan color blocking, and Air-Sole cushioning.',
      isFeatured: true,
      isTrending: true,
      rating: 4.9,
      reviewCount: 520,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
      ],
      specs: [
        { key: 'Material', value: 'Full-Grain Premium Leather' },
        { key: 'Cushioning', value: 'Encapsulated Nike Air-Sole Unit' }
      ]
    },
    {
      title: 'Adidas Ultraboost Light Running Shoes',
      slug: 'adidas-ultraboost-light',
      category: 'fashion',
      brand: 'adidas',
      price: 14999,
      originalPrice: 17999,
      description: 'Experience epic energy with the lightest Ultraboost ever. Made with 30% lighter Light BOOST material for supreme responsiveness.',
      isFeatured: false,
      isTrending: false,
      rating: 4.7,
      reviewCount: 310,
      images: [
        'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=800&q=80'
      ],
      specs: [
        { key: 'Midsole', value: 'Light BOOST Cushioning' },
        { key: 'Outsole', value: 'Continental™ Better Rubber Outsole' }
      ]
    },
    // Smart Home
    {
      title: 'Dyson V15 Detect Cordless Vacuum',
      slug: 'dyson-v15-detect',
      category: 'smart-home',
      brand: 'dyson',
      price: 65900,
      originalPrice: 69900,
      description: 'Dyson’s most intelligent cordless vacuum. Laser reveals microscopic dust. Intelligently optimizes suction and run time.',
      isFeatured: true,
      isTrending: false,
      rating: 4.85,
      reviewCount: 142,
      images: [
        'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80'
      ],
      specs: [
        { key: 'Suction Power', value: '230 Air Watts' },
        { key: 'Run Time', value: 'Up to 60 Minutes' }
      ]
    }
  ];

  // Expand catalog with variations to reach 100+ items
  console.log('🛍️ Generating 100+ Catalog Products...');
  let productCount = 0;

  for (let i = 0; i < 10; i++) {
    for (const tpl of productCatalogTemplates) {
      const suffix = i === 0 ? '' : ` (Batch ${i + 1})`;
      const slugSuffix = i === 0 ? '' : `-${i + 1}`;
      const sku = `SKU-${tpl.category.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const discount = Math.round(((tpl.originalPrice - tpl.price) / tpl.originalPrice) * 100);

      const p = await prisma.product.create({
        data: {
          title: tpl.title + suffix,
          slug: tpl.slug + slugSuffix,
          sku,
          description: tpl.description,
          categoryId: categoriesMap[tpl.category] || Object.values(categoriesMap)[0],
          brandId: brandsMap[tpl.brand] || Object.values(brandsMap)[0],
          sellerId: sellerProfileId,
          price: tpl.price,
          originalPrice: tpl.originalPrice,
          discountPercentage: Math.max(0, discount),
          taxRate: 18.0,
          stockCount: 50 + (i * 10),
          isFeatured: tpl.isFeatured && i === 0,
          isTrending: tpl.isTrending && i === 0,
          status: 'APPROVED',
          rating: tpl.rating,
          reviewCount: tpl.reviewCount + (i * 5),
          images: {
            create: tpl.images.map((url, idx) => ({
              url,
              isPrimary: idx === 0,
              sortOrder: idx
            }))
          },
          specifications: {
            create: tpl.specs.map(s => ({
              specKey: s.key,
              specValue: s.value,
              groupName: 'General'
            }))
          },
          variants: {
            create: [
              {
                sku: `${sku}-V1`,
                title: 'Default Edition',
                price: tpl.price,
                originalPrice: tpl.originalPrice,
                stock: 30,
                attributesJson: JSON.stringify({ Color: 'Standard', Capacity: 'Base' }),
                image: tpl.images[0]
              },
              {
                sku: `${sku}-V2`,
                title: 'Pro Edition',
                price: tpl.price * 1.15,
                originalPrice: tpl.originalPrice * 1.15,
                stock: 20,
                attributesJson: JSON.stringify({ Color: 'Pro Black', Capacity: 'Plus' }),
                image: tpl.images[1] || tpl.images[0]
              }
            ]
          },
          inventory: {
            create: {
              sellerId: sellerProfileId,
              warehouseLocation: 'Bengaluru Central Hub',
              totalQuantity: 100,
              reservedQuantity: 5
            }
          }
        }
      });
      productCount++;
    }
  }

  console.log(`✅ Created ${productCount} Products.`);

  // 4. Create Coupons
  console.log('🎟️ Creating Promotional Coupons...');
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME50',
        description: '50% Flat Discount on your first order up to ₹1,000',
        discountType: 'PERCENTAGE',
        discountValue: 50,
        minOrderValue: 999,
        maxDiscountAmount: 1000,
        usageLimit: 5000,
        perUserLimit: 1,
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      },
      {
        code: 'FESTIVE20',
        description: '20% Off on Electronics & Smartphones',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderValue: 2999,
        maxDiscountAmount: 3000,
        usageLimit: 1000,
        perUserLimit: 2,
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      },
      {
        code: 'SAVE1000',
        description: 'Flat ₹1,000 Off on orders above ₹10,000',
        discountType: 'FIXED',
        discountValue: 1000,
        minOrderValue: 10000,
        usageLimit: 2000,
        perUserLimit: 1,
        validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      }
    ]
  });

  // 5. Create Promotional Banners
  console.log('🖼️ Creating Hero Banners...');
  await prisma.banner.createMany({
    data: [
      {
        title: 'The Great Indian Tech Sale',
        subtitle: 'Up to 50% Off Flagship Smartphones & M3 MacBooks',
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80',
        linkUrl: '/products?category=smartphones',
        position: 'HERO',
        isActive: true
      },
      {
        title: 'Unleash Next-Gen Gaming',
        subtitle: 'ASUS ROG & PlayStation 5 Bundles with No-Cost EMI',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80',
        linkUrl: '/products?category=gaming',
        position: 'HERO',
        isActive: true
      }
    ]
  });

  // 6. Create Sample Orders for Customer
  console.log('📦 Creating Sample Customer Orders...');
  const sampleProduct = await prisma.product.findFirst({ where: { slug: 'iphone-15-pro-max' } });
  if (sampleProduct) {
    const order = await prisma.order.create({
      data: {
        orderNumber: 'ORD-2026-89412',
        userId: customer.id,
        subtotal: 134900,
        taxAmount: 24282,
        shippingAmount: 0,
        discountAmount: 1000,
        totalAmount: 158182,
        couponCode: 'SAVE1000',
        status: 'SHIPPED',
        paymentStatus: 'COMPLETED',
        paymentMethod: 'CARD',
        deliveryTrackingNumber: 'SN-EXP-99210482',
        estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        shippingAddressJson: JSON.stringify({
          fullName: 'Alex Johnson',
          phone: '+91 98765 43210',
          streetAddress: '42 Tech Park Avenue, HSR Layout, Sector 2',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560102'
        }),
        items: {
          create: [
            {
              productId: sampleProduct.id,
              title: sampleProduct.title,
              price: sampleProduct.price,
              quantity: 1,
              taxAmount: 24282,
              discountAmount: 1000,
              totalAmount: 158182
            }
          ]
        },
        shipmentTracking: {
          create: {
            carrier: 'SHOPNOVA Priority Express',
            trackingNumber: 'SN-EXP-99210482',
            status: 'SHIPPED',
            currentCity: 'Bengaluru Sort Facility',
            timelineJson: JSON.stringify([
              { status: 'CONFIRMED', location: 'SHOPNOVA Merchant Center', timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), note: 'Order verified & payment processed' },
              { status: 'PACKED', location: 'Apex Tech Warehouse', timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), note: 'Item packaged in protective security box' },
              { status: 'SHIPPED', location: 'Bengaluru Logistics Hub', timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(), note: 'In transit to local delivery hub' }
            ])
          }
        },
        payments: {
          create: {
            userId: customer.id,
            paymentGateway: 'STRIPE',
            transactionId: 'txn_stripe_sample_9812491',
            amount: 158182,
            currency: 'INR',
            status: 'SUCCESS'
          }
        }
      }
    });

    // Sample Review
    await prisma.review.create({
      data: {
        productId: sampleProduct.id,
        userId: customer.id,
        rating: 5,
        title: 'Outstanding Build Quality & Camera Performance',
        comment: 'Upgraded from iPhone 12 Pro. The titanium frame feels featherlight and the 5x optical zoom camera is mindblowing!',
        isVerifiedPurchase: true,
        helpfulCount: 42
      }
    });
  }

  console.log('✅ Seeding Complete! Demo Accounts Ready:');
  console.log(' 🔹 CUSTOMER : customer@example.com / Password123!');
  console.log(' 🔹 SELLER   : seller@example.com / Password123!');
  console.log(' 🔹 ADMIN    : admin@example.com / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
