import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_BASE_URL, buildQuery } from '../api.config';
import { PaginatedProductsResponse } from '../models/product.model';
import { HttpErrorService } from './http-error.service';

@Injectable({ providedIn: 'root' })
export class ProductCatalogService {
  private baseUrl = `${API_BASE_URL}/product`;

  constructor(
    private http: HttpClient,
    private errorService: HttpErrorService
  ) {}

  getProducts(params: {
    page?: number;
    limit?: number;
    vendorId?: string;
  }): Observable<PaginatedProductsResponse> {
    const { page, limit, vendorId } = params;
    const query = buildQuery({ page, limit, vendorId });
    return this.http
      .get<PaginatedProductsResponse>(`${this.baseUrl}${query}`)
      .pipe(
        catchError((err) => {
          return throwError(() => this.errorService.formatError(err));
        })
      );
  }
}
