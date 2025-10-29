export interface Vendor {
  id: string; // identificador único del vendedor
  name: string; // nombre visible
  logoPath?: string; // opcional: logo del vendedor
  images?: string[]; // opcional: array de imágenes para carrousel
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
    images: ['assets/images/products/vendedor1.jpg', 'assets/images/ropa/IMG-20240927-WA0087.jpg', 'assets/images/ropa/IMG-20240927-WA0088.jpg'],
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
    images: ['assets/images/products/vendedor2.jpeg', 'assets/images/ropa/IMG-20240927-WA0040.jpg', 'assets/images/ropa/IMG-20240927-WA0042.jpg'],
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
    images: ['assets/images/products/vendedor3.jpeg', 'assets/images/ropa/IMG-20240927-WA0090.jpg', 'assets/images/ropa/IMG-20240927-WA0090.jpg'],
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
  {
    id: 'v-delta',
    name: 'Delta Fashion',
    logoPath: 'assets/images/logos/DW.jpg',
    rating: 4.7,
    description: 'Especialistas en moda urbana y casual. Ropa de calidad con diseños exclusivos para todas las edades.',
    categories: ['Ropa', 'Moda', 'Casual', 'Urbana'],
    address: 'Av. Pueyrredón 1456, CABA',
    salesType: 'ambos',
    socials: {
      whatsapp: '5491177788899',
      web: 'https://deltafashion.example.com',
      facebook: 'https://facebook.com/deltafashion',
    },
  },
  {
    id: 'v-echo',
    name: 'Echo Sportswear',
    logoPath: 'assets/images/logos/DW.jpg',
    images: ['assets/images/logos/DW.jpg', 'assets/images/ropa/IMG-20240927-WA0025.jpg', 'assets/images/ropa/IMG-20240927-WA0090.jpg'],
    rating: 4.5,
    description: 'Ropa deportiva y fitness de alta calidad. Especialistas en indumentaria para actividades físicas.',
    categories: ['Deportivo', 'Fitness', 'Running', 'Gimnasio'],
    address: 'Cabildo 2345, CABA',
    salesType: 'menor',
    socials: {
      whatsapp: '5491144455566',
      web: 'https://echosportswear.example.com',
    },
  },
  {
    id: 'v-foxtrot',
    name: 'Foxtrot Kids',
    logoPath: 'assets/images/logos/DW.jpg',
    images: ['assets/images/logos/DW.jpg', 'assets/images/ropa/IMG-20240927-WA0017.jpg', 'assets/images/ropa/IMG-20240927-WA0040.jpg'],
    rating: 4.9,
    description: 'Ropa infantil de calidad premium. Diseños cómodos y duraderos para los más pequeños.',
    categories: ['Infantil', 'Niños', 'Bebés', 'Escolar'],
    address: 'Juramento 3456, CABA',
    salesType: 'ambos',
    socials: {
      whatsapp: '5491166677788',
      facebook: 'https://facebook.com/foxtrotkids',
    },
  },
  {
    id: 'v-golf',
    name: 'Golf Denim',
    logoPath: 'assets/images/logos/DW.jpg',
    images: ['assets/images/logos/DW.jpg', 'assets/images/ropa/IMG-20240927-WA0087.jpg', 'assets/images/ropa/IMG-20241112-WA0011.jpg'],
    rating: 4.4,
    description: 'Especialistas en jeans y prendas de denim. Calidad premium con cortes modernos.',
    categories: ['Jeans', 'Denim', 'Vaqueros', 'Casual'],
    address: 'Scalabrini Ortiz 4567, CABA',
    salesType: 'mayor',
    socials: {
      web: 'https://golfdenim.example.com',
      facebook: 'https://facebook.com/golfdenim',
    },
  },
];

// Precios ajustados a rango mayorista alto (+ multiplicador) asegurando base_price >= 5000
const BASE_PRODUCTS: Element[] = [
  { id: 1, vendorId: 'v-alfa', imagePath: 'assets/images/ropa/IMG-20240927-WA0087.jpg', product_name: 'Cute Soft Teddybear', titulo: 'Osito de Peluche Suave', talles: 'Único', precio: '14250', tela: 'Plush', images: ['assets/images/ropa/IMG-20240927-WA0087.jpg','assets/images/ropa/IMG-20240927-WA0090.jpg','assets/images/ropa/IMG-20240927-WA0087.jpg'], categories: ['toys','women','men'], categoria: 'toys', date: 'Fri, Jan 11 2025', status: false, base_price: 14250, dealPrice: 17315, discountPercent: 18, rating: 4.5, gender: 'women', generos: ['Mujer','Hombre'], description: 'Peluche suave y tierno ideal para regalo.' },
  { id: 2, vendorId: 'v-alfa', imagePath: 'assets/images/ropa/IMG-20240927-WA0095.jpg', product_name: 'MacBook Air Pro', titulo: 'MacBook Air Pro', talles: '-', precio: '32500', tela: '-', images: ['assets/images/ropa/IMG-20240927-WA0095.jpg','assets/images/ropa/IMG-20240927-WA0088.jpg'], categories: ['fashionelectronics','women','men','fashion','electronics'], categoria: 'electronics', date: 'Thu, Jan 16 2025', status: true, base_price: 32500, dealPrice: 44200, discountPercent: 36, rating: 4.3, gender: 'kids', generos: ['Niño'], description: 'Portátil de alto rendimiento y bajo peso.' },
  { id: 3, vendorId: 'v-bravo', imagePath: 'assets/images/ropa/IMG-20240927-WA0096.jpg', product_name: 'Gaming Console', titulo: 'Consola Gaming', talles: '-', precio: '1250', tela: '-', images: ['assets/images/ropa/IMG-20240927-WA0096.jpg'], categories: ['electronics','wireless'], categoria: 'electronics', date: 'Wed, Feb 9 2025', status: true, base_price: 1250, dealPrice: 1688, discountPercent: 35, rating: 4.0, gender: 'men', generos: ['Hombre'], description: 'Consola de juegos para entretenimiento familiar.' },
  { id: 4, vendorId: 'v-bravo', imagePath: 'assets/images/ropa/IMG-20240927-WA0090.jpg', product_name: 'Boat Headphone', titulo: 'Auriculares Boat', talles: '-', precio: '2500', tela: '-', images: ['assets/images/ropa/IMG-20240927-WA0090.jpg','assets/images/ropa/IMG-20240927-WA0038.jpg'], categories: ['electronics','accessories','laptop accessories','bags'], categoria: 'electronics', date: 'Wed, Feb 16 2025', status: false, base_price: 2500, dealPrice: 3825, discountPercent: 53, rating: 4.2, gender: 'women', generos: ['Mujer'], description: 'Auriculares con sonido envolvente alta fidelidad.' },
  { id: 5, vendorId: 'v-charlie', imagePath: 'assets/images/ropa/IMG-20240927-WA0040.jpg', product_name: 'Toy Dino for Fun', titulo: 'Dinosaurio de Juguete', talles: 'Único', precio: '10500', tela: 'Plástico', images: ['assets/images/ropa/IMG-20240927-WA0040.jpg','assets/images/ropa/IMG-20240927-WA0087.jpg'], categories: ['toys','accessories','wallets'], categoria: 'toys', date: 'Wed, Feb 20 2025', status: false, base_price: 10500, dealPrice: 12705, discountPercent: 21, rating: 3.0, gender: 'kids', generos: ['Niño'], description: 'Juguete resistente y colorido para niños.' },
  { id: 6, vendorId: 'v-charlie', imagePath: 'assets/images/ropa/IMG-20241112-WA0011.jpg', product_name: 'Red Valvet Dress', titulo: 'Vestido Rojo Terciopelo', talles: 'S-M-L', precio: '7500', tela: 'Terciopelo', images: ['assets/images/ropa/IMG-20240927-WA0086.jpg','assets/images/ropa/IMG-20240927-WA0091.jpg','assets/images/ropa/IMG-20240927-WA0088.jpg'], categories: ['fashion'], categoria: 'fashion', date: 'Wed, Mar 9 2025', status: true, base_price: 7500, dealPrice: 11100, discountPercent: 48, rating: 4.7, gender: 'men', generos: ['Mujer'], description: 'Vestido elegante para ocasiones especiales.' },
  { id: 7, vendorId: 'v-alfa', imagePath: 'assets/images/ropa/IMG-20240927-WA0040.jpg', product_name: 'Shoes for Girls', titulo: 'Zapatos para Niñas', talles: '28-32', precio: '15000', tela: 'Cuero Sintético', images: ['assets/images/ropa/IMG-20240927-WA0091.jpg','assets/images/ropa/IMG-20240927-WA0088.jpg','assets/images/ropa/IMG-20240927-WA0089.jpg'], categories: ['fashion'], categoria: 'fashion', date: 'Fri, Mar 11 2025', status: false, base_price: 15000, dealPrice: 22200, discountPercent: 48, rating: 4.7, gender: 'women', generos: ['Niño'], description: 'Calzado cómodo y resistente para uso diario.' },
  { id: 8, vendorId: 'v-bravo', imagePath: 'assets/images/ropa/IMG-20240927-WA0088.jpg', product_name: 'Short & Sweet Purse', titulo: 'Cartera Compacta', talles: '-', precio: '8750', tela: 'Cuero', images: ['assets/images/ropa/IMG-20240927-WA0088.jpg','assets/images/ropa/IMG-20240927-WA0089.jpg'], categories: ['fashion','accessories'], categoria: 'accessories', date: 'Wed, Mar 19 2025', status: false, base_price: 8750, dealPrice: 12950, discountPercent: 48, rating: 4.7, gender: 'kids', generos: ['Mujer'], description: 'Cartera elegante y práctica para uso diario.' },
  { id: 9, vendorId: 'v-charlie', imagePath: 'assets/images/ropa/IMG-20240927-WA0089.jpg', product_name: 'The Psychology of Money', titulo: 'Libro Psicología del Dinero', talles: '-', precio: '6250', tela: 'Papel', images: ['assets/images/ropa/IMG-20240927-WA0089.jpg','assets/images/ropa/IMG-20240927-WA0088.jpg'], categories: ['accessories','mouse','Logitech','fashion','books'], categoria: 'books', date: 'Wed, Mar 22 2025', status: true, base_price: 6250, dealPrice: 9200, discountPercent: 48, rating: 4.7, gender: 'men', generos: ['Hombre'], description: 'Explora decisiones financieras y conducta humana.' },
  { id: 10, vendorId: 'v-alfa', imagePath: 'assets/images/ropa/IMG-20240927-WA0087.jpg', product_name: 'How Innovation Works', titulo: 'Libro Innovación', talles: '-', precio: '13750', tela: 'Papel', images: ['assets/images/ropa/IMG-20240927-WA0087.jpg'], categories: ['gaming','console','Nintendo','books'], categoria: 'books', date: 'Wed, Mar 28 2025', status: false, base_price: 13750, dealPrice: 20360, discountPercent: 48, rating: 4.7, gender: 'women', generos: ['Hombre','Mujer'], description: 'Historia y mecanismos de la innovación.' },
  { id: 11, vendorId: 'v-bravo', imagePath: 'assets/images/ropa/IMG-20240927-WA0087.jpg', product_name: 'Little Angel Toy', titulo: 'Juguete Ángel Pequeño', talles: 'Único', precio: '500', tela: 'Plástico', images: ['assets/images/ropa/IMG-20240927-WA0085.jpg'], categories: ['beauty','makeup','foundation','Maybelline','toys'], categoria: 'toys', date: 'Thu, Apr 1 2025', status: false, base_price: 500, dealPrice: 740, discountPercent: 48, rating: 4.7, gender: 'kids', generos: ['Niño'], description: 'Pequeño juguete coleccionable.' },
  { id: 12, vendorId: 'v-charlie', imagePath: 'assets/images/ropa/IMG-20240927-WA0088.jpg', product_name: 'Psalms Book for Growth', titulo: 'Libro Salmos para Crecer', talles: '-', precio: '4450', tela: 'Papel', images: ['assets/images/ropa/IMG-20240927-WA0088.jpg'], categories: ['watch','Fossil','wearables','books'], categoria: 'books', date: 'Fri, Apr 7 2025', status: true, base_price: 4450, dealPrice: 6586, discountPercent: 48, rating: 4.7, gender: 'men', generos: ['Hombre'], description: 'Reflexiones y enseñanzas espirituales.' },
  // Nuevos productos de ropa usando imágenes de la carpeta ropa
  { id: 13, vendorId: 'v-delta', imagePath: 'assets/images/ropa/IMG-20240927-WA0017.jpg', product_name: 'Urban Style T-Shirt', titulo: 'Remera Estilo Urbano', talles: 'S-M-L-XL', precio: '8500', tela: 'Algodón', images: ['assets/images/ropa/IMG-20240927-WA0017.jpg'], categories: ['fashion','casual','urban'], categoria: 'fashion', date: 'Mon, Oct 14 2025', status: true, base_price: 8500, dealPrice: 11900, discountPercent: 40, rating: 4.6, gender: 'men', generos: ['Hombre'], description: 'Remera urbana con diseño moderno y cómodo algodón.' },
  { id: 14, vendorId: 'v-delta', imagePath: 'assets/images/ropa/IMG-20240927-WA0018.jpg', product_name: 'Casual Denim Jacket', titulo: 'Campera Jeans Casual', talles: 'M-L-XL', precio: '18500', tela: 'Denim', images: ['assets/images/ropa/IMG-20240927-WA0018.jpg'], categories: ['fashion','denim','casual'], categoria: 'fashion', date: 'Tue, Oct 15 2025', status: true, base_price: 18500, dealPrice: 24050, discountPercent: 30, rating: 4.8, gender: 'women', generos: ['Mujer'], description: 'Campera de jeans clásica para looks casuales.' },
  { id: 15, vendorId: 'v-delta', imagePath: 'assets/images/ropa/IMG-20240927-WA0019.jpg', product_name: 'Streetwear Hoodie', titulo: 'Buzo Streetwear', talles: 'S-M-L-XL-XXL', precio: '12500', tela: 'Algodón Fleece', images: ['assets/images/ropa/IMG-20240927-WA0019.jpg'], categories: ['fashion','streetwear','urban'], categoria: 'fashion', date: 'Wed, Oct 16 2025', status: false, base_price: 12500, dealPrice: 16250, discountPercent: 30, rating: 4.5, gender: 'men', generos: ['Hombre','Mujer'], description: 'Buzo oversized con capucha para estilo urbano.' },
  { id: 16, vendorId: 'v-delta', imagePath: 'assets/images/ropa/IMG-20240927-WA0020.jpg', product_name: 'Vintage Style Pants', titulo: 'Pantalón Estilo Vintage', talles: '30-32-34-36', precio: '15200', tela: 'Mezcla Algodón', images: ['assets/images/ropa/IMG-20240927-WA0020.jpg'], categories: ['fashion','vintage','casual'], categoria: 'fashion', date: 'Thu, Oct 17 2025', status: true, base_price: 15200, dealPrice: 19760, discountPercent: 30, rating: 4.7, gender: 'men', generos: ['Hombre'], description: 'Pantalón de estilo retro con tela cómoda.' },
  { id: 17, vendorId: 'v-echo', imagePath: 'assets/images/ropa/IMG-20240927-WA0021.jpg', product_name: 'Running Shorts', titulo: 'Shorts Running', talles: 'S-M-L-XL', precio: '7200', tela: 'Poliéster Transpirable', images: ['assets/images/ropa/IMG-20240927-WA0021.jpg'], categories: ['sports','running','fitness'], categoria: 'deportivo', date: 'Fri, Oct 18 2025', status: true, base_price: 7200, dealPrice: 9360, discountPercent: 30, rating: 4.4, gender: 'men', generos: ['Hombre','Mujer'], description: 'Shorts ligeros y transpirables para running.' },
  { id: 18, vendorId: 'v-echo', imagePath: 'assets/images/ropa/IMG-20240927-WA0025.jpg', product_name: 'Gym Tank Top', titulo: 'Musculosa Gym', talles: 'M-L-XL', precio: '5800', tela: 'Poliéster Dry-Fit', images: ['assets/images/ropa/IMG-20240927-WA0025.jpg'], categories: ['sports','gym','fitness'], categoria: 'deportivo', date: 'Sat, Oct 19 2025', status: false, base_price: 5800, dealPrice: 7540, discountPercent: 30, rating: 4.3, gender: 'men', generos: ['Hombre'], description: 'Musculosa técnica para entrenamientos intensos.' },
  { id: 19, vendorId: 'v-echo', imagePath: 'assets/images/ropa/IMG-20240927-WA0027.jpg', product_name: 'Yoga Leggings', titulo: 'Leggings Yoga', talles: 'XS-S-M-L', precio: '9800', tela: 'Licra Alta Compresión', images: ['assets/images/ropa/IMG-20240927-WA0027.jpg'], categories: ['sports','yoga','fitness'], categoria: 'deportivo', date: 'Sun, Oct 20 2025', status: true, base_price: 9800, dealPrice: 12740, discountPercent: 30, rating: 4.6, gender: 'women', generos: ['Mujer'], description: 'Leggings de alta compresión para yoga y pilates.' },
  { id: 20, vendorId: 'v-foxtrot', imagePath: 'assets/images/ropa/IMG-20240927-WA0035.jpg', product_name: 'Kids Summer Dress', titulo: 'Vestido Verano Niños', talles: '2-4-6-8', precio: '6500', tela: 'Algodón Orgánico', images: ['assets/images/ropa/IMG-20240927-WA0035.jpg'], categories: ['kids','summer','casual'], categoria: 'infantil', date: 'Mon, Oct 21 2025', status: true, base_price: 6500, dealPrice: 8450, discountPercent: 30, rating: 4.8, gender: 'kids', generos: ['Niño'], description: 'Vestido fresco y cómodo para niñas en verano.' },
  { id: 21, vendorId: 'v-foxtrot', imagePath: 'assets/images/ropa/IMG-20240927-WA0036.jpg', product_name: 'Boys Casual Shirt', titulo: 'Camisa Casual Niños', talles: '4-6-8-10', precio: '5200', tela: 'Algodón', images: ['assets/images/ropa/IMG-20240927-WA0036.jpg'], categories: ['kids','casual','school'], categoria: 'infantil', date: 'Tue, Oct 22 2025', status: false, base_price: 5200, dealPrice: 6760, discountPercent: 30, rating: 4.5, gender: 'kids', generos: ['Niño'], description: 'Camisa cómoda perfecta para uso diario escolar.' },
  { id: 22, vendorId: 'v-foxtrot', imagePath: 'assets/images/ropa/IMG-20240927-WA0037.jpg', product_name: 'Baby Onesie Set', titulo: 'Body Bebé Pack', talles: '0-3-6-9', precio: '7800', tela: 'Algodón Suave', images: ['assets/images/ropa/IMG-20240927-WA0037.jpg'], categories: ['kids','baby','comfort'], categoria: 'infantil', date: 'Wed, Oct 23 2025', status: true, base_price: 7800, dealPrice: 10140, discountPercent: 30, rating: 4.9, gender: 'kids', generos: ['Niño'], description: 'Pack de bodies suaves para bebés cómodos.' },
  { id: 23, vendorId: 'v-golf', imagePath: 'assets/images/ropa/IMG-20240927-WA0038.jpg', product_name: 'Classic Blue Jeans', titulo: 'Jeans Clásicos Azules', talles: '28-30-32-34-36', precio: '16800', tela: 'Denim Premium', images: ['assets/images/ropa/IMG-20240927-WA0038.jpg'], categories: ['denim','classic','casual'], categoria: 'denim', date: 'Thu, Oct 24 2025', status: true, base_price: 16800, dealPrice: 21840, discountPercent: 30, rating: 4.6, gender: 'men', generos: ['Hombre','Mujer'], description: 'Jeans clásicos azules de alta calidad y durabilidad.' },
  { id: 24, vendorId: 'v-golf', imagePath: 'assets/images/ropa/IMG-20240927-WA0040.jpg', product_name: 'Slim Fit Jeans', titulo: 'Jeans Slim Fit', talles: '29-31-33-35', precio: '18200', tela: 'Denim Elástico', images: ['assets/images/ropa/IMG-20240927-WA0040.jpg'], categories: ['denim','slim','modern'], categoria: 'denim', date: 'Fri, Oct 25 2025', status: false, base_price: 18200, dealPrice: 23660, discountPercent: 30, rating: 4.4, gender: 'men', generos: ['Hombre'], description: 'Jeans slim fit modernos con tela elástica cómoda.' },
];

const MULTIPLIED_TIMES = 10; // factor de multiplicación
export const PRODUCT_DATA: Element[] = Array.from({ length: MULTIPLIED_TIMES }, (_, i) =>
  BASE_PRODUCTS.map(p => ({
    ...p,
    id: p.id + i * BASE_PRODUCTS.length
  }))
).flat();

export const productcards: productcards[] = [
  { id: 1, imgSrc: 'assets/images/ropa/IMG-20240927-WA0090.jpg', title: 'Boat Headphone', price: '2500', rprice: '3825', date: 'Tue, Apr 03, 2025' },
  { id: 2, imgSrc: 'assets/images/ropa/IMG-20240927-WA0095.jpg', title: 'MacBook Air Pro', price: '32500', rprice: '44200', date: 'Tue, Apr 10, 2025' },
  { id: 3, imgSrc: 'assets/images/ropa/IMG-20240927-WA0038.jpg', title: 'Red Velvet Dress', price: '7500', rprice: '11100', date: 'Tue, Apr 15, 2025' },
  { id: 4, imgSrc: 'assets/images/ropa/IMG-20240927-WA0087.jpg', title: 'Soft Plush Teddy', price: '14250', rprice: '17315', date: 'Tue, Apr 12, 2025' },
];
