import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  product: any; // ProductListItem
  quantity: number;
  vendorId: string;
  colorName?: string; // nombre del color seleccionado (no hex)
  sizes?: string[]; // talles seleccionados para venta por unidad
  minPurchase?: number; // mínimo de compra aplicado al momento de agregar (solo unidad)
}

export interface VendorCart {
  vendorId: string;
  vendorName: string;
  items: CartItem[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartsSubject = new BehaviorSubject<VendorCart[]>([]);
  public carts$ = this.cartsSubject.asObservable();
  private storageKey = 'app_vendor_carts_v1';

  constructor() {
    this.restoreFromStorage();
  }

  getCarts(): VendorCart[] {
    return this.cartsSubject.value;
  }

  getVendorCart(vendorId: string): VendorCart | undefined {
    return this.getCarts().find((cart) => cart.vendorId === vendorId);
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
    const carts = this.getCarts();
    let vendorCart = carts.find((cart) => cart.vendorId === vendorId);

    if (!vendorCart) {
      vendorCart = {
        vendorId,
        vendorName,
        items: [],
        total: 0,
      };
      carts.push(vendorCart);
      console.log('Created new vendor cart:', vendorCart);
    } else {
      console.log('Found existing vendor cart:', vendorCart);
    }

    const existingItem = vendorCart.items.find(
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
        colorName,
        sizes: sizes && sizes.length ? [...sizes] : undefined,
        minPurchase: computedMin,
      };
      vendorCart.items.push(newItem);
      console.log('Added new item to cart:', newItem);
    }

    this.updateTotal(vendorCart);
    this.cartsSubject.next([...carts]);
    this.persistToStorage();
    console.log('Updated carts:', this.getCarts());
  }

  removeFromCart(productId: number, vendorId: string): void {
    const carts = this.getCarts();
    const vendorCart = carts.find((cart) => cart.vendorId === vendorId);
    if (vendorCart) {
      vendorCart.items = vendorCart.items.filter(
        (item) => item.product.id !== productId
      );
      if (vendorCart.items.length === 0) {
        const index = carts.indexOf(vendorCart);
        carts.splice(index, 1);
      } else {
        this.updateTotal(vendorCart);
      }
      this.cartsSubject.next([...carts]);
      this.persistToStorage();
    }
  }

  updateQuantity(productId: number, vendorId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId, vendorId);
      return;
    }

    const carts = this.getCarts();
    const vendorCart = carts.find((cart) => cart.vendorId === vendorId);
    if (vendorCart) {
      const item = vendorCart.items.find(
        (item) => item.product.id === productId
      );
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
              vendorId,
              requested: quantity,
              effectiveMin,
            }
          );
          item.quantity = effectiveMin;
        } else {
          item.quantity = quantity;
        }
        this.updateTotal(vendorCart);
        this.cartsSubject.next([...carts]);
        this.persistToStorage();
      }
    }
  }

  getTotalItems(): number {
    return this.getCarts().reduce(
      (total, cart) => total + cart.items.length,
      0
    );
  }

  getTotalVendors(): number {
    return this.getCarts().length;
  }

  getVendorTotalItems(vendorId: string): number {
    const cart = this.getVendorCart(vendorId);
    return cart
      ? cart.items.reduce((total, item) => total + item.quantity, 0)
      : 0;
  }

  private updateTotal(vendorCart: VendorCart): void {
    vendorCart.total = vendorCart.items.reduce((total, item) => {
      const price = item.product.dealPrice || item.product.base_price;
      return total + price * item.quantity;
    }, 0);
  }

  clearCart(): void {
    this.cartsSubject.next([]);
    this.persistToStorage();
  }

  clearVendorCart(vendorId: string): void {
    const carts = this.getCarts().filter((cart) => cart.vendorId !== vendorId);
    this.cartsSubject.next(carts);
    this.persistToStorage();
  }

  private persistToStorage(): void {
    try {
      const data = JSON.stringify(this.getCarts());
      localStorage.setItem(this.storageKey, data);
    } catch (e) {
      console.warn('[CartService] Error al guardar en localStorage', e);
    }
  }

  private restoreFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      const parsed: VendorCart[] = JSON.parse(raw);
      // Recalcular totales por seguridad (por si cambió lógica de precio)
      parsed.forEach((vc) => this.updateTotal(vc));
      this.cartsSubject.next(parsed);
      console.log('[CartService] Carritos restaurados desde storage:', parsed);
    } catch (e) {
      console.warn('[CartService] Error al restaurar desde localStorage', e);
    }
  }
}
