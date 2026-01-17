import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PaginatedVendorsResponse } from '../models/vendor.model';

@Injectable({ providedIn: 'root' })
export class VendorService {
  // Vendors are disabled in the backend (single-vendor mode)
  getVendors(
    _page?: number,
    _limit?: number
  ): Observable<PaginatedVendorsResponse> {
    return of({ vendors: [], total: 0, page: 1, limit: 0, totalPages: 1 });
  }
}
