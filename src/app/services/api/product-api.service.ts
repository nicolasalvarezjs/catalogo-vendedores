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
  images?: string[];
  active?: boolean;
  rating?: number;
  categories?: string[];
  date?: string;
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
  }): Observable<BackendProductPageResponse> {
    return this.http.get<BackendProductPageResponse>(
      `${this.baseUrl}${buildQuery(params)}`
    );
  }
}
