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
}

export interface PaginatedVendorsResponse {
  vendors: Vendor[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
