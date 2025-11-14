export interface Vendor {
  _id: string;
  userId: string;
  name: string;
  logoPath?: string;
  images?: string[];
  rating?: number;
  description?: string;
  categories?: string[];
  address?: string;
  salesType?: string; // 'ambos' | other values
  socials?: Record<string, string>;
  startSell?: boolean;
  // Nuevos campos provenientes del backend (información global aplicada a todos sus productos)
  doesShipping?: boolean; // indica si realiza envíos
  shippingDetail?: string; // detalle del envío ("envío a todo el país", etc.)
  productDescription?: string; // descripción extra que el vendedor quiere agregar a todos sus productos
}

export interface PaginatedVendorsResponse {
  vendors: Vendor[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
