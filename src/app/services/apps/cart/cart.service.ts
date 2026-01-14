import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  product: any; // ProductListItem
  quantity: number;
  vendorId: string;
  vendorName?: string;
  colorName?: string;
  sizes?: string[];
  genero?: string;
  minPurchase?: number;
}

export interface GlobalCart {
  items: CartItem[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartSubject = new BehaviorSubject<GlobalCart>({
    items: [],
    total: 0,
  });
  public cart$ = this.cartSubject.asObservable();
  private storageKey = 'app_global_cart_v1';

  constructor() {
    this.restoreFromStorage();
  }

  getCart(): GlobalCart {
    return this.cartSubject.value;
  }

  addToCart(
    product: any,
    vendorId: string,
    vendorName: string,
    quantity: number = 1,
    colorName?: string,
    sizes?: string[],
    genero?: string
  ): void {
    console.log('CartService.addToCart called with:', {
      product,
      vendorId,
      vendorName,
      quantity,
      colorName,
      sizes,
    });
    const cart = this.getCart();
    const existingItem = cart.items.find(
      (item) => item.product.id === product.id && item.vendorId === vendorId
    );
    const normalizedSizes = sizes && sizes.length ? [...sizes] : undefined;
    const computedMin =
      product?.salesType === 'unidad' &&
      typeof product?.minPurchase === 'number' &&
      product.minPurchase > 0
        ? product.minPurchase
        : 1;

    if (existingItem) {
      existingItem.product = product;
      existingItem.quantity = 1;
      existingItem.vendorName = vendorName;
      existingItem.colorName = colorName;
      existingItem.sizes = normalizedSizes;
      existingItem.genero = genero;
      existingItem.minPurchase = computedMin;
      console.log('Updated existing cart item with single quantity:', existingItem);
    } else {
      const newItem: CartItem = {
        product,
        quantity: 1,
        vendorId,
        vendorName,
        colorName,
        sizes: normalizedSizes,
        genero,
        minPurchase: computedMin,
      };
      cart.items.push(newItem);
      console.log('Added new single-quantity item to cart:', newItem);
    }
    this.updateTotal(cart);
    this.cartSubject.next({ ...cart });
    this.persistToStorage();
    console.log('Updated cart:', this.getCart());
  }

  removeFromCart(productId: number): void {
    const cart = this.getCart();
    cart.items = cart.items.filter((item) => item.product.id !== productId);
    this.updateTotal(cart);
    this.cartSubject.next({ ...cart });
    this.persistToStorage();
  }

  getTotalItems(): number {
    return this.getCart().items.length;
  }

  private updateTotal(cart: GlobalCart): void {
    cart.total = cart.items.reduce((total, item) => {
      const price = item.product.dealPrice || item.product.base_price || 0;
      const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
      return total + price * qty;
    }, 0);
  }

  clearCart(): void {
    this.cartSubject.next({ items: [], total: 0 });
    this.persistToStorage();
  }

  // clearVendorCart eliminado (no aplica en carrito global)

  private persistToStorage(): void {
    try {
      const data = JSON.stringify(this.getCart());
      localStorage.setItem(this.storageKey, data);
    } catch (e) {
      console.warn('[CartService] Error al guardar en localStorage', e);
    }
  }

  private restoreFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      const parsed: GlobalCart = JSON.parse(raw);
      this.normalizeQuantities(parsed);
      this.updateTotal(parsed);
      this.cartSubject.next(parsed);
      console.log('[CartService] Carrito restaurado desde storage:', parsed);
    } catch (e) {
      console.warn('[CartService] Error al restaurar desde localStorage', e);
    }
  }

  private normalizeQuantities(cart: GlobalCart): void {
    cart.items.forEach((item) => {
      item.quantity = 1;
    });
  }

  private migrateOldStorage() {
    try {
      const oldRaw = localStorage.getItem('app_vendor_carts_v1');
      if (!oldRaw) return;
      const oldParsed: any[] = JSON.parse(oldRaw);
      const flattened: CartItem[] = [];
      oldParsed.forEach((vc) => {
        (vc.items || []).forEach((it: any) => {
          flattened.push({
            ...it,
            vendorId: vc.vendorId,
            vendorName: vc.vendorName,
          });
        });
      });
      const migrated: GlobalCart = { items: flattened, total: 0 };
      this.updateTotal(migrated);
      this.cartSubject.next(migrated);
      this.persistToStorage();
      console.log(
        '[CartService] Migración de carrito por vendedor -> único',
        migrated
      );
    } catch (e) {
      console.warn('[CartService] Error migrando storage antiguo', e);
    }
  }
}
