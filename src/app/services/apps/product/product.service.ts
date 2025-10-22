import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private product: any = null;
  private readonly productKey = 'selectedProduct';
  private readonly productIdKey = 'selectedProductId';

  private productAdded = new BehaviorSubject<any>(null);
  productAdded$ = this.productAdded.asObservable();

  editProduct = new BehaviorSubject<any>(null);
  editMode = new BehaviorSubject<boolean>(false);
  productUpdated = new Subject<any>();

  setProduct(product: any) {
    this.product = product;
    localStorage.setItem(this.productKey, JSON.stringify(product));
    if (product && product.id) {
      localStorage.setItem(this.productIdKey, product.id.toString());
    }
  }

  getProduct() {
    const productFromLocalStorage = localStorage.getItem(this.productKey);
    return productFromLocalStorage ? JSON.parse(productFromLocalStorage) : null;
  }

  clearProduct() {
    this.product = null;
    localStorage.removeItem(this.productKey);
  localStorage.removeItem(this.productIdKey);
  }
  emitProduct(data: any) {
    this.productAdded.next(data);
  }
  clearEmittedProduct() {
    this.productAdded.next(null);
  }
  updateProduct(data: any) {
    this.productUpdated.next(data);
  }

  setSelectedProductId(id: number){
    localStorage.setItem(this.productIdKey, id.toString());
  }
  getSelectedProductId(): number | null {
    const val = localStorage.getItem(this.productIdKey);
    return val ? +val : null;
  }
}
