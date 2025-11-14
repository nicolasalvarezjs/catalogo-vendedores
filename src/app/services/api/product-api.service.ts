import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, buildQuery } from '../../api.config';

export interface BackendProduct {
  _id: string;
  vendorId: string | { _id?: string; name?: string };
  product_name: string;
  categoria?: string;
  generos?: string[];
  talles?: string;
  base_price?: number;
  description?: string;
  tela?: string;
  salesType?: string;
  minPurchase?: number; // mínimo de compra cuando salesType === 'unidad'
  images?: string[];
  active?: boolean;
  rating?: number;
  categories?: string[];
  date?: string;
  // Colores disponibles: arreglo de objetos { name, hex }
  colors?: { name: string; hex: string }[];
  // Color legado único (productos antiguos)
  color?: string;
}

export interface BackendProductPageResponse {
  products: BackendProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private baseUrl = `${API_BASE_URL}/product`;
  constructor(private http: HttpClient) {}

  getProducts(params: {
    page?: number;
    limit?: number;
    vendorId?: string;
    categories?: string[]; // filtro multi-categoría
  }): Observable<BackendProductPageResponse> {
    return this.http.get<BackendProductPageResponse>(
      `${this.baseUrl}${buildQuery(params)}`
    );
  }
}
