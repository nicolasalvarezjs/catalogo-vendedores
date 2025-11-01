import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { API_BASE_URL, buildQuery } from '../api.config';
import { PaginatedVendorsResponse } from '../models/vendor.model';
import { HttpErrorService } from './http-error.service';

@Injectable({ providedIn: 'root' })
export class VendorService {
  private baseUrl = `${API_BASE_URL}/vendor`;

  constructor(
    private http: HttpClient,
    private errorService: HttpErrorService
  ) {}

  getVendors(
    page?: number,
    limit?: number
  ): Observable<PaginatedVendorsResponse> {
    const query = buildQuery({ page, limit });
    return this.http
      .get<PaginatedVendorsResponse>(`${this.baseUrl}${query}`)
      .pipe(
        catchError((err) => {
          return throwError(() => this.errorService.formatError(err));
        })
      );
  }
}
