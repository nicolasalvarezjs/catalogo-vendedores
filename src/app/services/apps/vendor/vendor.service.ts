import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { VENDORS, PRODUCT_DATA, Vendor as EcommerceVendor } from 'src/app/pages/apps/ecommerce/ecommerceData';

export interface Vendor extends EcommerceVendor {
  // Extender con campos adicionales si es necesario
}

export interface VendorsPageResponse {
  items: Vendor[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private vendorsSubject = new BehaviorSubject<Vendor[]>([]);
  public vendors$ = this.vendorsSubject.asObservable();

  private vendors: Vendor[] = VENDORS;
  private artificialDelay = 300; // ms para simular API

  // Cache para paginación
  private vendorsPageCache = new Map<string, VendorsPageResponse>();

  constructor() {
    this.vendorsSubject.next(this.vendors);
  }

  // Método existente para compatibilidad
  getVendors(): Vendor[] {
    return this.vendors;
  }

  // Nuevo método paginado para simular API
  getVendorsPage(page: number = 1, pageSize: number = 10): Observable<VendorsPageResponse> {
    const key = `${page}-${pageSize}`;

    if (this.vendorsPageCache.has(key)) {
      return of(this.vendorsPageCache.get(key)!).pipe(delay(this.artificialDelay));
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const total = this.vendors.length;
    const items = this.vendors.slice(start, end);
    const hasMore = end < total;

    const response: VendorsPageResponse = {
      items,
      total,
      page,
      pageSize,
      hasMore
    };

    this.vendorsPageCache.set(key, response);
    return of(response).pipe(delay(this.artificialDelay));
  }

  getVendorById(id: string): Vendor | undefined {
    return this.vendors.find(v => v.id === id);
  }

  getProductsByVendor(vendorId: string): any[] {
    return PRODUCT_DATA.filter(product => product.vendorId === vendorId);
  }

  // Método para limpiar cache si es necesario
  clearVendorsCache() {
    this.vendorsPageCache.clear();
  }
}