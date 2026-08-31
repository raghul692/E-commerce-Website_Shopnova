export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN' | 'SUPER_ADMIN';
  phone?: string;
  avatar?: string;
  sellerProfileId?: string;
}

export interface SellerProfile {
  id: string;
  companyName: string;
  storeName: string;
  storeLogo?: string;
  rating: number;
  isApproved: boolean;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  children?: Category[];
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
}

export interface ProductSpecification {
  id: string;
  specKey: string;
  specValue: string;
  groupName?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  title: string;
  price: number;
  originalPrice: number;
  stock: number;
  attributesJson: string;
  image?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  description: string;
  categoryId: string;
  brandId?: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  taxRate: number;
  stockCount: number;
  isFeatured: boolean;
  isTrending: boolean;
  rating: number;
  reviewCount: number;
  category?: Category;
  brand?: Brand;
  seller?: SellerProfile;
  images: ProductImage[];
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
  reviews?: Review[];
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: Product;
  variant?: ProductVariant;
}

export interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  totalAmount: number;
  product?: Product;
}

export interface ShipmentTracking {
  carrier: string;
  trackingNumber: string;
  status: string;
  currentCity: string;
  timelineJson: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  couponCode?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED' | 'RETURNED' | 'REFUNDED';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentMethod: string;
  deliveryTrackingNumber?: string;
  estimatedDeliveryDate: string;
  shippingAddressJson: string;
  createdAt: string;
  items: OrderItem[];
  shipmentTracking?: ShipmentTracking[];
}

export interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  user?: { name: string; avatar?: string };
}

export interface Coupon {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  validUntil: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
}
