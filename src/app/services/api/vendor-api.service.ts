import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, buildQuery } from '../../api.config';

export interface BackendVendor {
  _id: string;
  userId: string;
  name: string;
  logoPath?: string;
  images?: string[];
  rating?: number;
  description?: string;
  categories?: string[];
  address?: string;
  salesType?: string;
  socials?: Record<string, string>;
  startSell?: boolean;
  // Nuevos campos backend
  doesShipping?: boolean;
  shippingDetail?: string;
  productDescription?: string;
}

export interface BackendVendorPageResponse {
  vendors: BackendVendor[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

@Injectable({ providedIn: 'root' })
export class VendorApiService {
  private baseUrl = `${API_BASE_URL}/vendor`;
  constructor(private http: HttpClient) {}

  getVendors(
    page?: number,
    limit?: number
  ): Observable<BackendVendorPageResponse> {
    return this.http.get<BackendVendorPageResponse>(
      `${this.baseUrl}${buildQuery({ page, limit })}`
    );
  }
}
