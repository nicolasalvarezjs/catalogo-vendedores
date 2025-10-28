export interface Vendor {
  id: string; // identificador único del vendedor
  name: string; // nombre visible
  logoPath?: string; // opcional: logo del vendedor
  rating?: number; // rating agregado del vendedor
  description?: string; // descripción del vendedor
  categories?: string[]; // categorías que vende
  address?: string; // dirección
  salesType?: 'mayor' | 'menor' | 'ambos'; // tipo de venta
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
  gender?: string; // legacy single gender
  generos?: string[]; // nuevo: múltiple (Hombre,Mujer,Niño)
  titulo?: string; // nombre de prenda mostrado en panel
  talles?: string; // S-M-L-XL etc
  precio?: string; // texto precio original para panel
  tela?: string; // tipo de tela
  images?: string[]; // múltiples imágenes
  categoria?: string; // categoría única principal
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
    logoPath: 'assets/images/products/vendedor1.jpg',
    rating: 4.6,
    description: 'Distribuidora especializada en productos textiles y de hogar. Ofrecemos calidad y precios competitivos.',
    categories: ['Ropa', 'Hogar', 'Textiles', 'Juguetes'],
    address: 'Av. Corrientes 1234, CABA',
    salesType: 'ambos',
    socials: {
      whatsapp: '5491160012233',
      web: 'https://alfa.example.com',
      facebook: 'https://facebook.com/alfa',
    },
  },
  {
    id: 'v-bravo',
    name: 'Bravo Retail',
    logoPath: 'assets/images/products/vendedor2.jpeg',
    rating: 4.3,
    description: 'Tienda especializada en electrónica y accesorios tecnológicos. Los mejores productos al mejor precio.',
    categories: ['Electrónica', 'Accesorios', 'Tecnología'],
    address: 'Florida 567, CABA',
    salesType: 'menor',
    socials: {
      web: 'https://bravo.example.com',
    },
  },
  {
    id: 'v-charlie',
    name: 'Charlie Imports',
    logoPath: 'assets/images/products/vendedor3.jpeg',
    rating: 4.8,
    description: 'Importadora directa de productos internacionales. Especialistas en libros y artículos culturales.',
    categories: ['Libros', 'Importados', 'Cultural', 'Educativos'],
    address: 'Santa Fe 890, CABA',
    salesType: 'mayor',
    socials: {
      whatsapp: '5491155599911',
      facebook: 'https://facebook.com/charlieimports',
    },
  },
];

// Precios ajustados a rango mayorista alto (+ multiplicador) asegurando base_price >= 5000
const BASE_PRODUCTS: Element[] = [
  { id: 1, vendorId: 'v-alfa', imagePath: 'assets/images/products/s11.jpg', product_name: 'Cute Soft Teddybear', titulo: 'Osito de Peluche Suave', talles: 'Único', precio: '14250', tela: 'Plush', images: ['assets/images/products/s11.jpg','assets/images/products/s4.jpg','assets/images/products/s1.jpg'], categories: ['toys','women','men'], categoria: 'toys', date: 'Fri, Jan 11 2025', status: false, base_price: 14250, dealPrice: 17315, discountPercent: 18, rating: 4.5, gender: 'women', generos: ['Mujer','Hombre'], description: 'Peluche suave y tierno ideal para regalo.' },
  { id: 2, vendorId: 'v-alfa', imagePath: 'assets/images/products/s5.jpg', product_name: 'MacBook Air Pro', titulo: 'MacBook Air Pro', talles: '-', precio: '32500', tela: '-', images: ['assets/images/products/s5.jpg','assets/images/products/s2.jpg'], categories: ['fashionelectronics','women','men','fashion','electronics'], categoria: 'electronics', date: 'Thu, Jan 16 2025', status: true, base_price: 32500, dealPrice: 44200, discountPercent: 36, rating: 4.3, gender: 'kids', generos: ['Niño'], description: 'Portátil de alto rendimiento y bajo peso.' },
  { id: 3, vendorId: 'v-bravo', imagePath: 'assets/images/products/s6.jpg', product_name: 'Gaming Console', titulo: 'Consola Gaming', talles: '-', precio: '1250', tela: '-', images: ['assets/images/products/s6.jpg'], categories: ['electronics','wireless'], categoria: 'electronics', date: 'Wed, Feb 9 2025', status: true, base_price: 1250, dealPrice: 1688, discountPercent: 35, rating: 4.0, gender: 'men', generos: ['Hombre'], description: 'Consola de juegos para entretenimiento familiar.' },
  { id: 4, vendorId: 'v-bravo', imagePath: 'assets/images/products/s4.jpg', product_name: 'Boat Headphone', titulo: 'Auriculares Boat', talles: '-', precio: '2500', tela: '-', images: ['assets/images/products/s4.jpg','assets/images/products/s7.jpg'], categories: ['electronics','accessories','laptop accessories','bags'], categoria: 'electronics', date: 'Wed, Feb 16 2025', status: false, base_price: 2500, dealPrice: 3825, discountPercent: 53, rating: 4.2, gender: 'women', generos: ['Mujer'], description: 'Auriculares con sonido envolvente alta fidelidad.' },
  { id: 5, vendorId: 'v-charlie', imagePath: 'assets/images/products/s10.jpg', product_name: 'Toy Dino for Fun', titulo: 'Dinosaurio de Juguete', talles: 'Único', precio: '10500', tela: 'Plástico', images: ['assets/images/products/s10.jpg','assets/images/products/s11.jpg'], categories: ['toys','accessories','wallets'], categoria: 'toys', date: 'Wed, Feb 20 2025', status: false, base_price: 10500, dealPrice: 12705, discountPercent: 21, rating: 3.0, gender: 'kids', generos: ['Niño'], description: 'Juguete resistente y colorido para niños.' },
  { id: 6, vendorId: 'v-charlie', imagePath: 'assets/images/products/1.jpg', product_name: 'Red Valvet Dress', titulo: 'Vestido Rojo Terciopelo', talles: 'S-M-L', precio: '7500', tela: 'Terciopelo', images: ['assets/images/products/1.jpg','assets/images/products/2.jpg','assets/images/products/3.jpg'], categories: ['fashion'], categoria: 'fashion', date: 'Wed, Mar 9 2025', status: true, base_price: 7500, dealPrice: 11100, discountPercent: 48, rating: 4.7, gender: 'men', generos: ['Mujer'], description: 'Vestido elegante para ocasiones especiales.' },
  { id: 7, vendorId: 'v-alfa', imagePath: 'assets/images/products/2.jpg', product_name: 'Shoes for Girls', titulo: 'Zapatos para Niñas', talles: '28-32', precio: '15000', tela: 'Cuero Sintético', images: ['assets/images/products/2.jpg','assets/images/products/3.jpg','assets/images/products/4.jpg'], categories: ['fashion'], categoria: 'fashion', date: 'Fri, Mar 11 2025', status: false, base_price: 15000, dealPrice: 22200, discountPercent: 48, rating: 4.7, gender: 'women', generos: ['Niño'], description: 'Calzado cómodo y resistente para uso diario.' },
  { id: 8, vendorId: 'v-bravo', imagePath: 'assets/images/products/3.jpg', product_name: 'Short & Sweet Purse', titulo: 'Cartera Compacta', talles: '-', precio: '8750', tela: 'Cuero', images: ['assets/images/products/3.jpg','assets/images/products/4.jpg'], categories: ['fashion','accessories'], categoria: 'accessories', date: 'Wed, Mar 19 2025', status: false, base_price: 8750, dealPrice: 12950, discountPercent: 48, rating: 4.7, gender: 'kids', generos: ['Mujer'], description: 'Cartera elegante y práctica para uso diario.' },
  { id: 9, vendorId: 'v-charlie', imagePath: 'assets/images/products/s3.jpg', product_name: 'The Psychology of Money', titulo: 'Libro Psicología del Dinero', talles: '-', precio: '6250', tela: 'Papel', images: ['assets/images/products/s3.jpg','assets/images/products/s2.jpg'], categories: ['accessories','mouse','Logitech','fashion','books'], categoria: 'books', date: 'Wed, Mar 22 2025', status: true, base_price: 6250, dealPrice: 9200, discountPercent: 48, rating: 4.7, gender: 'men', generos: ['Hombre'], description: 'Explora decisiones financieras y conducta humana.' },
  { id: 10, vendorId: 'v-alfa', imagePath: 'assets/images/products/s1.jpg', product_name: 'How Innovation Works', titulo: 'Libro Innovación', talles: '-', precio: '13750', tela: 'Papel', images: ['assets/images/products/s1.jpg'], categories: ['gaming','console','Nintendo','books'], categoria: 'books', date: 'Wed, Mar 28 2025', status: false, base_price: 13750, dealPrice: 20360, discountPercent: 48, rating: 4.7, gender: 'women', generos: ['Hombre','Mujer'], description: 'Historia y mecanismos de la innovación.' },
  { id: 11, vendorId: 'v-bravo', imagePath: 'assets/images/products/s12.jpg', product_name: 'Little Angel Toy', titulo: 'Juguete Ángel Pequeño', talles: 'Único', precio: '500', tela: 'Plástico', images: ['assets/images/products/s12.jpg'], categories: ['beauty','makeup','foundation','Maybelline','toys'], categoria: 'toys', date: 'Thu, Apr 1 2025', status: false, base_price: 500, dealPrice: 740, discountPercent: 48, rating: 4.7, gender: 'kids', generos: ['Niño'], description: 'Pequeño juguete coleccionable.' },
  { id: 12, vendorId: 'v-charlie', imagePath: 'assets/images/products/s2.jpg', product_name: 'Psalms Book for Growth', titulo: 'Libro Salmos para Crecer', talles: '-', precio: '4450', tela: 'Papel', images: ['assets/images/products/s2.jpg'], categories: ['watch','Fossil','wearables','books'], categoria: 'books', date: 'Fri, Apr 7 2025', status: true, base_price: 4450, dealPrice: 6586, discountPercent: 48, rating: 4.7, gender: 'men', generos: ['Hombre'], description: 'Reflexiones y enseñanzas espirituales.' },
];

const MULTIPLIED_TIMES = 10; // factor de multiplicación
export const PRODUCT_DATA: Element[] = Array.from({ length: MULTIPLIED_TIMES }, (_, i) =>
  BASE_PRODUCTS.map(p => ({
    ...p,
    id: p.id + i * BASE_PRODUCTS.length
  }))
).flat();

export const productcards: productcards[] = [
  { id: 1, imgSrc: 'assets/images/products/s4.jpg', title: 'Boat Headphone', price: '2500', rprice: '3825', date: 'Tue, Apr 03, 2025' },
  { id: 2, imgSrc: 'assets/images/products/s5.jpg', title: 'MacBook Air Pro', price: '32500', rprice: '44200', date: 'Tue, Apr 10, 2025' },
  { id: 3, imgSrc: 'assets/images/products/s7.jpg', title: 'Red Velvet Dress', price: '7500', rprice: '11100', date: 'Tue, Apr 15, 2025' },
  { id: 4, imgSrc: 'assets/images/products/s11.jpg', title: 'Soft Plush Teddy', price: '14250', rprice: '17315', date: 'Tue, Apr 12, 2025' },
];
