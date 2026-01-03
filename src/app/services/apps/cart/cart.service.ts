import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  product: any; // ProductListItem
  quantity: number;
  vendorId?: string;
  vendorName?: string;
  colorName?: string; // nombre del color seleccionado (no hex)
  sizes?: string[]; // talles seleccionados para venta por unidad
  minPurchase?: number; // mínimo de compra aplicado al momento de agregar (solo unidad)
}

export interface CartState {
  items: CartItem[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartSubject = new BehaviorSubject<CartState>({ items: [], total: 0 });
  public cart$ = this.cartSubject.asObservable();
  private storageKey = 'app_cart_single_v1';

  constructor() {
    this.restoreFromStorage();
  }

  getCart(): CartState {
    return this.cartSubject.value;
  }

  addToCart(
    product: any,
    vendorId: string,
    vendorName: string,
    quantity: number = 1,
    colorName?: string,
    sizes?: string[]
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
        item.colorName === colorName &&
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
        minPurchase: computedMin,
      };
      cart.items.push(newItem);
      console.log('Added new item to cart:', newItem);
    }

    this.updateTotal(cart);
    this.cartSubject.next({ ...cart, items: [...cart.items] });
    this.persistToStorage();
    console.log('Updated cart:', this.getCart());
  }

  removeFromCart(productId: number): void {
    const cart = this.getCart();
    cart.items = cart.items.filter((item) => item.product.id !== productId);
    this.updateTotal(cart);
    this.cartSubject.next({ ...cart, items: [...cart.items] });
    this.persistToStorage();
  }

  updateQuantity(productId: number, _vendorId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const cart = this.getCart();
    const item = cart.items.find((i) => i.product.id === productId);
    if (item) {
      const effectiveMin =
        item.product?.salesType === 'unidad'
          ? typeof item.product?.minPurchase === 'number' &&
            item.product.minPurchase > 0
            ? item.product.minPurchase
            : item.minPurchase || 1
          : 1;
      if (quantity < effectiveMin) {
        console.warn(
          '[CartService] Intento de bajar debajo del mínimo. Se fuerza a minPurchase.',
          {
            productId,
            requested: quantity,
            effectiveMin,
          }
        );
        item.quantity = effectiveMin;
      } else {
        item.quantity = quantity;
      }
      this.updateTotal(cart);
      this.cartSubject.next({ ...cart, items: [...cart.items] });
      this.persistToStorage();
    }
  }

  getTotalItems(): number {
    return this.getCart().items.reduce((total, item) => total + item.quantity, 0);
  }

  private updateTotal(cart: CartState): void {
    cart.total = cart.items.reduce((total, item) => {
      const price = item.product.dealPrice || item.product.base_price;
      return total + price * item.quantity;
    }, 0);
  }

  clearCart(): void {
    this.cartSubject.next({ items: [], total: 0 });
    this.persistToStorage();
  }

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
      if (!raw) {
        // Intentar migrar de storage antiguo si existiera
        this.migrateOldStorage();
        return;
      }
      const parsed: CartState = JSON.parse(raw);
      this.updateTotal(parsed);
      this.cartSubject.next(parsed);
      console.log('[CartService] Carrito restaurado desde storage:', parsed);
    } catch (e) {
      console.warn('[CartService] Error al restaurar desde localStorage', e);
    }
  }

  private migrateOldStorage() {
    try {
      const oldRaw = localStorage.getItem('app_vendor_carts_v1');
      if (!oldRaw) return;
      const oldParsed: any[] = JSON.parse(oldRaw);
      const flattened: CartItem[] = [];
      oldParsed.forEach((vc) => {
        (vc.items || []).forEach((it: any) => {
          flattened.push({ ...it, vendorId: vc.vendorId, vendorName: vc.vendorName });
        });
      });
      const migrated: CartState = { items: flattened, total: 0 };
      this.updateTotal(migrated);
      this.cartSubject.next(migrated);
      this.persistToStorage();
      console.log('[CartService] Migración de carrito por vendedor -> único', migrated);
    } catch (e) {
      console.warn('[CartService] Error migrando storage antiguo', e);
    }
  }
}
