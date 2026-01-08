import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
      (item) =>
        item.product.id === product.id &&
        item.vendorId === vendorId &&
        item.colorName === colorName &&
        item.genero === genero &&
        JSON.stringify(item.sizes || []) === JSON.stringify(sizes || [])
    );
    if (existingItem) {
      existingItem.quantity += quantity;
      console.log('Increased quantity for existing item:', existingItem);
    } else {
      const computedMin =
        product?.salesType === 'unidad' &&
        typeof product?.minPurchase === 'number' &&
        product.minPurchase > 0
          ? product.minPurchase
          : 1;
      const newItem: CartItem = {
        product,
        quantity: quantity,
        vendorId,
        vendorName,
        colorName,
        sizes: sizes && sizes.length ? [...sizes] : undefined,
        genero,
        minPurchase: computedMin,
      };
      cart.items.push(newItem);
      console.log('Added new item to cart:', newItem);
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

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    const cart = this.getCart();
    const item = cart.items.find((item) => item.product.id === productId);
    if (item) {
      const effectiveMin =
        item.product?.salesType === 'unidad'
          ? typeof item.product?.minPurchase === 'number' &&
            item.product.minPurchase > 0
            ? item.product.minPurchase
            : item.minPurchase || 1
          : 1;
      if (quantity < effectiveMin) {
        item.quantity = effectiveMin;
      } else {
        item.quantity = quantity;
      }
      this.updateTotal(cart);
      this.cartSubject.next({ ...cart });
      this.persistToStorage();
    }
  }

  getTotalItems(): number {
    return this.getCart().items.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }

  private updateTotal(cart: GlobalCart): void {
    cart.total = cart.items.reduce((total, item) => {
      const price = item.product.dealPrice || item.product.base_price;
      return total + price * item.quantity;
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
      this.updateTotal(parsed);
      this.cartSubject.next(parsed);
      console.log('[CartService] Carrito restaurado desde storage:', parsed);
    } catch (e) {
      console.warn('[CartService] Error al restaurar desde localStorage', e);
    }
  }
}
