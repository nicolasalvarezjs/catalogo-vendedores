import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PRODUCT_DATA, VENDORS, Element, Vendor } from 'src/app/pages/apps/ecommerce/ecommerceData';

// Datos mínimos para listado (slim)
export interface ProductListItem {
  id: number;
  vendorId: string;
  product_name: string;
  imagePath: string;
  base_price: number;
  dealPrice: number;
  rating?: number;
  categories: string[];
  gender?: string;
  date: string;
}

export interface ProductDetail extends Element {
  vendor?: Vendor;
  vendorProducts?: Element[]; // otros productos del mismo vendedor
}

@Injectable({ providedIn: 'root' })
export class MockProductApiService {
  private artificialDelay = 200; // ms
  // Cache en memoria
  private pageCache = new Map<string, { items: ProductListItem[]; total: number; page: number; pageSize: number; hasMore: boolean; }>();
  private productCache = new Map<number, ProductDetail | null>();

  getProducts(): Observable<ProductListItem[]> {
  const slim: ProductListItem[] = PRODUCT_DATA.map(p => ({
      id: p.id,
      vendorId: p.vendorId,
      product_name: p.product_name,
      imagePath: p.imagePath,
      base_price: p.base_price,
      dealPrice: p.dealPrice,
      rating: p.rating,
      categories: p.categories,
      gender: p.gender,
      date: p.date
    }));
    return of(slim).pipe(delay(this.artificialDelay));
  }

  getProductById(id: number): Observable<ProductDetail | null> {
    if (this.productCache.has(id)) {
      return of(this.productCache.get(id) as ProductDetail | null);
    }
    const found = PRODUCT_DATA.find(p => p.id === id) || null;
    if (!found) {
      this.productCache.set(id, null);
      return of(null).pipe(delay(this.artificialDelay));
    }
    const vendor = VENDORS.find(v => v.id === found.vendorId);
    const vendorProducts = PRODUCT_DATA.filter(p => p.vendorId === found.vendorId && p.id !== found.id);
    const detail: ProductDetail = { ...found, vendor, vendorProducts };
    this.productCache.set(id, detail);
    return of(detail).pipe(delay(this.artificialDelay));
  }

  getProductsPage(page: number, pageSize: number): Observable<{ items: ProductListItem[]; total: number; page: number; pageSize: number; hasMore: boolean; }> {
    const key = `${page}-${pageSize}`;
    if (this.pageCache.has(key)) {
      return of(this.pageCache.get(key)!);
    }
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const total = PRODUCT_DATA.length;
    const slice = PRODUCT_DATA.slice(start, end).map(p => ({
      id: p.id,
      vendorId: p.vendorId,
      product_name: p.product_name,
      imagePath: p.imagePath,
      base_price: p.base_price,
      dealPrice: p.dealPrice,
      rating: p.rating,
      categories: p.categories,
      gender: p.gender,
      date: p.date
    }));
    const hasMore = end < total;
    const payload = { items: slice, total, page, pageSize, hasMore };
    this.pageCache.set(key, payload);
    return of(payload).pipe(delay(this.artificialDelay));
  }

  // Utilidad opcional para limpiar caches (por ejemplo si se actualiza dataset)
  clearCaches(){
    this.pageCache.clear();
    this.productCache.clear();
  }
}
