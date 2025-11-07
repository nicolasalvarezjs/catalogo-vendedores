export interface Product {
  _id: string;
  vendorId: string | { _id?: string; name?: string }; // populated vendor name may come
  titulo: string; // assuming from backend filter usage
  description?: string;
  categoria?: string;
  precio?: number;
  images?: string[];
  date?: string;
  active?: boolean;
  // Colores disponibles para el producto (array de pares nombre/hex)
  colors?: { name: string; hex: string }[];
  // Add other backend fields as needed
}

export interface PaginatedProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
