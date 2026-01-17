import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { IconModule } from 'src/app/icon/icon.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CartService, CartItem } from 'src/app/services/apps/cart/cart.service';
import { MonedaArsPipe } from 'src/app/pipe/moneda-ars.pipe';
import { OrderService } from 'src/app/services/order.service';
import { Order } from 'src/app/models/order.model';

interface CartDialogData {
  mode: 'general' | 'vendor';
  vendorId?: string;
  vendor?: any; // vendor object para obtener whatsapp
}

@Component({
  selector: 'app-cart-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule, IconModule, MonedaArsPipe],
  template: `
    <div class="cart-dialog-fullscreen">
      <div class="dialog-header">
        <h2 class="dialog-title">Carrito de Compras</h2>
        <button mat-icon-button (click)="close()" aria-label="Cerrar">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="cart-content">
        <ng-container *ngIf="cartItems.length > 0; else emptyCart">
          <div class="cart-items">
            <div
              class="cart-item"
              *ngFor="let item of cartItems; trackBy: trackByProductId"
            >
              <div class="item-top-row">
                <img
                  [src]="item.product.imagePath"
                  alt="product"
                  class="item-image"
                />
                <div class="item-details">
                  <h4>{{ item.product.product_name }}</h4>
                  <p class="item-price">
                    <strong>
                      {{
                        (item.product.dealPrice || item.product.base_price)
                          | monedaARS
                      }}
                    </strong>
                  </p>
                </div>
              </div>
              <div class="item-actions">
                <button
                  mat-icon-button
                  color="warn"
                  (click)="removeItem(item.product.id)"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>
          <div class="cart-summary">
            <div class="cart-total">
              <strong>Total: {{ total | monedaARS }}</strong>
            </div>
            <button
              mat-flat-button
              color="primary"
              class="checkout-btn"
              (click)="checkoutViaWhatsApp()"
            >
              <mat-icon>whatsapp</mat-icon>
              <span>Finalizar compra</span>
            </button>
          </div>
        </ng-container>
        <ng-template #emptyCart>
          <div class="empty-cart">
            <mat-icon class="empty-icon">shopping_cart</mat-icon>
            <h3>Carrito vacío</h3>
            <p>No hay productos en el carrito</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [
    `
      .cart-dialog-fullscreen {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100vw;
        max-height: 100vh;
        max-width: 100vw;
      }
      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #e0e0e0;
        background: #fff;
        position: sticky;
        top: 0;
        z-index: 10;
      }
      .dialog-title {
        margin: 0;
        font-weight: 600;
        font-size: 1.5rem;
      }
      .cart-content {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
      }
      .expansion-panels-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .vendor-expansion-panel {
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border: 1px solid #e0e0e0;
      }
      .vendor-expansion-panel .mat-expansion-panel-header {
        background: #f8f9fa;
        border-bottom: 1px solid #e0e0e0;
        padding: 16px 24px;
      }
      .vendor-expansion-panel .mat-expansion-panel-header:hover {
        background: #f1f3f4;
      }
      .vendor-expansion-panel .mat-expansion-panel-body {
        padding: 16px 24px;
        background: #fff;
      }
      .cart-items {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
      }
      .cart-summary {
        border-top: 1px solid #e0e0e0;
        padding-top: 1rem;
        margin-top: 1rem;
      }
      .cart-total {
        text-align: center;
        font-size: 1.2rem;
        margin-bottom: 1rem;
        color: #333;
      }
      .cart-item {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background: #fff;
      }
      .item-top-row {
        display: flex;
        align-items: center;
        gap: 1rem;
        width: 100%;
      }
      .item-image {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 4px;
        flex-shrink: 0;
      }
      .item-details {
        flex: 1;
      }
      .item-details h4 {
        margin: 0 0 0.5rem 0;
        font-size: 1.1rem;
      }
      .item-details p {
        margin: 0.25rem 0;
        color: #666;
      }
      .item-price {
        margin: 0.5rem 0 0 0;
        color: #5F2BAD;
      }
      .item-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.5rem;
        background: #f5f5f5;
        border-radius: 4px;
        padding: 0.5rem 0.75rem;
        align-self: center;
      }
      .cart-summary {
        position: sticky;
        bottom: 0;
        background: #fff;
        border-top: 1px solid #e0e0e0;
        padding: 1rem 0;
        margin-top: 2rem;
      }
      .cart-total {
        text-align: center;
        font-size: 1.4rem;
        margin-bottom: 1rem;
        color: #333;
      }
      .checkout-btn {
        width: 100%;
        height: 48px;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }
      .checkout-btn mat-icon {
        color: #25d366;
      }
      .empty-cart {
        text-align: center;
        padding: 3rem 1rem;
        color: #666;
      }
      .empty-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
        margin-bottom: 1rem;
        opacity: 0.5;
      }
      .empty-cart h3 {
        margin: 1rem 0 0.5rem 0;
        color: #333;
      }
      .empty-cart p {
        margin: 0;
      }
    `,
  ],
})
export class CartDialogComponent {
  cartItems: CartItem[] = [];
  total: number = 0;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private dialogRef: MatDialogRef<CartDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CartDialogData
  ) {
    this.cartService.cart$.subscribe((cart) => {
      this.cartItems = cart.items;
      this.total = cart.total;
    });
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  close(): void {
    this.dialogRef.close();
  }

  trackByProductId(index: number, item: CartItem) {
    return item.product.id;
  }

  async createOrderFromCart(items: CartItem[]): Promise<Order | null> {
    if (!items || !items.length) return null;
    const productos = items.map((item) => {
      const price = item.product?.dealPrice ?? item.product?.base_price ?? 0;
      const productSnapshot = {
        id: item.product?.id,
        name: item.product?.product_name || item.product?.name,
        sku: item.product?.sku,
        brand: item.product?.brand,
        price,
      };
      return {
        productoId: String(item.product.id),
        vendedorId: String(item.vendorId),
        cantidad: item.quantity,
        seleccion: {
          color: item.colorName || null,
          sizes: item.sizes || [],
          genero: (item as any).genero || null,
        },
        productSnapshot,
        priceAtPurchase: price,
      };
    });
    try {
      const order = await this.orderService.create({ productos }).toPromise();
      return order ?? null;
    } catch (err) {
      console.error('[OrderService] Error al crear pedido:', err);
      return null;
    }
  }

  async checkoutViaWhatsApp(): Promise<void> {
    if (!this.cartItems || this.cartItems.length === 0) {
      return;
    }
    // Mensaje fijo para número 1151030450
    let message = 'Quiero realizar la compra de:\n\n';
    this.cartItems.forEach((ci) => {
      const productName = ci.product?.product_name || ci.product?.name || 'Producto sin nombre';
      message += `- ${productName}\n`;
    });
    const encodedMessage = encodeURIComponent(message);
    const targetNumber = '541151030450'; // Argentina +54 prefijo
    const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }

}
