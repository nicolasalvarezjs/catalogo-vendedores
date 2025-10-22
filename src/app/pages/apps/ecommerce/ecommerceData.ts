export interface Vendor {
  id: string; // identificador único del vendedor
  name: string; // nombre visible
  logoPath?: string; // opcional: logo del vendedor
  rating?: number; // rating agregado del vendedor
  socials?: {
    whatsapp?: string; // número en formato internacional sin '+' ej: 5491122334455
    web?: string; // URL del sitio
    facebook?: string; // URL de la página de Facebook
  };
}

export interface Element {
  id: number;
  vendorId: string; // referencia al vendedor
  imagePath: string;
  product_name: string;
  categories: string[];
  date: string;
  status: boolean;
  base_price: number;
  dealPrice: number;
  description: string;
  media?: any;
  discountPercent?: number;
  gender?: string;
  rating?: number;
}

interface productcards {
  id: number;
  imgSrc: string;
  title: string;
  price: string;
  rprice: string;
  date: string;
}

export const VENDORS: Vendor[] = [
  {
    id: 'v-alfa',
    name: 'Alfa Distribuciones',
    rating: 4.6,
    socials: {
      whatsapp: '5491160012233',
      web: 'https://alfa.example.com',
      facebook: 'https://facebook.com/alfa',
    },
  },
  {
    id: 'v-bravo',
    name: 'Bravo Retail',
    rating: 4.3,
    socials: {
      web: 'https://bravo.example.com',
    },
  },
  {
    id: 'v-charlie',
    name: 'Charlie Imports',
    rating: 4.8,
    socials: {
      whatsapp: '5491155599911',
      facebook: 'https://facebook.com/charlieimports',
    },
  },
];

const BASE_PRODUCTS: Element[] = [
  { id: 1, vendorId: 'v-alfa', imagePath: 'assets/images/products/s11.jpg', product_name: 'Cute Soft Teddybear', categories: ['toys','women','men'], date: 'Fri, Jan 11 2025', status: false, base_price: 285, dealPrice: 345, discountPercent: 18, rating: 4.5, gender: 'women', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ex arcu, tincidunt bibendum felis' },
  { id: 2, vendorId: 'v-alfa', imagePath: 'assets/images/products/s5.jpg', product_name: 'MacBook Air Pro', categories: ['fashionelectronics','women','men','fashion','electronics'], date: 'Thu, Jan 16 2025', status: true, base_price: 650, dealPrice: 900, discountPercent: 36, rating: 4.3, gender: 'kids', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ex arcu, tincidunt bibendum felis' },
  { id: 3, vendorId: 'v-bravo', imagePath: 'assets/images/products/s6.jpg', product_name: 'Gaming Console', categories: ['electronics','wireless'], date: 'Wed, Feb 9 2025', status: true, base_price: 25, dealPrice: 31, discountPercent: 35, rating: 4.0, gender: 'men', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ex arcu, tincidunt bibendum felis' },
  { id: 4, vendorId: 'v-bravo', imagePath: 'assets/images/products/s4.jpg', product_name: 'Boat Headphone', categories: ['electronics','accessories','laptop accessories','bags'], date: 'Wed, Feb 16 2025', status: false, base_price: 50, dealPrice: 65, discountPercent: 53, rating: 4.2, gender: 'women', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ex arcu, tincidunt bibendum felis' },
  { id: 5, vendorId: 'v-charlie', imagePath: 'assets/images/products/s10.jpg', product_name: 'Toy Dino for Fun', categories: ['toys','accessories','wallets'], date: 'Wed, Feb 20 2025', status: false, base_price: 210, dealPrice: 250, discountPercent: 21, rating: 3.0, gender: 'kids', description: 'A sleek and elegant leather wallet with a minimalist design, perfect for everyday use.' },
  { id: 6, vendorId: 'v-charlie', imagePath: 'assets/images/products/s7.jpg', product_name: 'Red Valvet Dress', categories: ['headphones','audio','Apple','fashion'], date: 'Wed, Mar 9 2025', status: true, base_price: 150, dealPrice: 200, discountPercent: 48, rating: 4.7, gender: 'men', description: 'The Apple AirPods Max offers high-fidelity audio, active noise cancellation, and spatial audio with dynamic head tracking.' },
  { id: 7, vendorId: 'v-alfa', imagePath: 'assets/images/products/s8.jpg', product_name: 'Shoes for Girls', categories: ['headphones','audio','Apple','fashion','toys'], date: 'Fri, Mar 11 2025', status: false, base_price: 300, dealPrice: 380, discountPercent: 48, rating: 4.7, gender: 'women', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ex arcu, tincidunt bibendum felis' },
  { id: 8, vendorId: 'v-bravo', imagePath: 'assets/images/products/s9.jpg', product_name: 'Short & Sweet Purse', categories: ['smartphone','Samsung','Android','fashion'], date: 'Wed, Mar 19 2025', status: false, base_price: 175, dealPrice: 200, discountPercent: 48, rating: 4.7, gender: 'kids', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ex arcu, tincidunt bibendum felis' },
  { id: 9, vendorId: 'v-charlie', imagePath: 'assets/images/products/s3.jpg', product_name: 'The Psychology of Money', categories: ['accessories','mouse','Logitech','fashion','books'], date: 'Wed, Mar 22 2025', status: true, base_price: 125, dealPrice: 137, discountPercent: 48, rating: 4.7, gender: 'men', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ex arcu, tincidunt bibendum felis' },
  { id: 10, vendorId: 'v-alfa', imagePath: 'assets/images/products/s1.jpg', product_name: 'How Innovation Works', categories: ['gaming','console','Nintendo','books'], date: 'Wed, Mar 28 2025', status: false, base_price: 275, dealPrice: 350, discountPercent: 48, rating: 4.7, gender: 'women', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ex arcu, tincidunt bibendum felis' },
  { id: 11, vendorId: 'v-bravo', imagePath: 'assets/images/products/s12.jpg', product_name: 'Little Angel Toy', categories: ['beauty','makeup','foundation','Maybelline','toys'], date: 'Thu, Apr 1 2025', status: false, base_price: 5, dealPrice: 10, discountPercent: 48, rating: 4.7, gender: 'kids', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ex arcu, tincidunt bibendum felis' },
  { id: 12, vendorId: 'v-charlie', imagePath: 'assets/images/products/s2.jpg', product_name: 'Psalms Book for Growth', categories: ['watch','Fossil','wearables','books'], date: 'Fri, Apr 7 2025', status: true, base_price: 89, dealPrice: 99, discountPercent: 48, rating: 4.7, gender: 'men', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ex arcu, tincidunt bibendum felis' },
];

const MULTIPLIED_TIMES = 10; // factor de multiplicación
export const PRODUCT_DATA: Element[] = Array.from({ length: MULTIPLIED_TIMES }, (_, i) =>
  BASE_PRODUCTS.map(p => ({
    ...p,
    id: p.id + i * BASE_PRODUCTS.length,
    product_name: `${p.product_name} #${i + 1}`
  }))
).flat();

export const productcards: productcards[] = [
  { id: 1, imgSrc: 'assets/images/products/s4.jpg', title: 'Boat Headphone', price: '285', rprice: '375', date: 'Tue, Apr 03, 2025' },
  { id: 2, imgSrc: 'assets/images/products/s5.jpg', title: 'MacBook Air Pro', price: '285', rprice: '375', date: 'Tue, Apr 10, 2025' },
  { id: 3, imgSrc: 'assets/images/products/s7.jpg', title: 'Red Velvet Dress', price: '285', rprice: '375', date: 'Tue, Apr 15, 2025' },
  { id: 4, imgSrc: 'assets/images/products/s11.jpg', title: 'Soft Plush Teddy', price: '285', rprice: '375', date: 'Tue, Apr 12, 2025' },
];
