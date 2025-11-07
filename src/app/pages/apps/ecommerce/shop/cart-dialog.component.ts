import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { IconModule } from 'src/app/icon/icon.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  CartService,
  VendorCart,
  CartItem,
} from 'src/app/services/apps/cart/cart.service';
import { MonedaArsPipe } from 'src/app/pipe/moneda-ars.pipe';

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
        <h2 class="dialog-title">
          {{
            data.mode === 'general'
              ? 'Carrito de Compras'
              : 'Carrito del Vendedor'
          }}
        </h2>
        <button mat-icon-button (click)="close()" aria-label="Cerrar">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="cart-content">
        @if(data.mode === 'general'){ @if(carts.length > 0){
        <div class="expansion-panels-container">
          @for(cart of carts; track cart.vendorId) {
          <mat-expansion-panel class="vendor-expansion-panel">
            <mat-expansion-panel-header>
              <mat-panel-title>{{ cart.vendorName }}</mat-panel-title>
              <mat-panel-description
                >{{ cart.items.length }} productos -
                {{ cart.total | monedaARS }}</mat-panel-description
              >
            </mat-expansion-panel-header>
            <div class="cart-items">
              @for(item of cart.items; track item.product.id) {
              <div class="cart-item">
                <div class="item-top-row">
                  <img
                    [src]="item.product.imagePath"
                    alt="product"
                    class="item-image"
                  />
                  <div class="item-details">
                    <h4>{{ item.product.product_name }}</h4>
                    <p>
                      {{ item.product.base_price | monedaARS }} x
                      {{ item.quantity }}
                    </p>
                    <p class="item-subtotal">
                      <strong
                        >Subtotal:
                        {{
                          item.product.base_price * item.quantity | monedaARS
                        }}</strong
                      >
                    </p>
                  </div>
                </div>
                <div class="quantity-controls">
                  <button
                    mat-icon-button
                    (click)="
                      updateQuantity(
                        item.product.id,
                        cart.vendorId,
                        item.quantity - 1
                      )
                    "
                  >
                    <mat-icon>remove</mat-icon>
                  </button>
                  <span>{{ item.quantity }}</span>
                  <button
                    mat-icon-button
                    (click)="
                      updateQuantity(
                        item.product.id,
                        cart.vendorId,
                        item.quantity + 1
                      )
                    "
                  >
                    <mat-icon>add</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    color="warn"
                    (click)="removeItem(item.product.id, cart.vendorId)"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
              }
            </div>
            <div class="cart-summary">
              <div class="cart-total">
                <strong>Total: {{ cart.total | monedaARS }}</strong>
              </div>
              <button
                mat-flat-button
                color="primary"
                class="checkout-btn"
                (click)="checkoutViaWhatsApp(cart)"
              >
                <mat-icon>whatsapp</mat-icon>
                <span>Finalizar compra</span>
              </button>
            </div>
          </mat-expansion-panel>
          }
        </div>
        } @else {
        <div class="empty-cart">
          <mat-icon class="empty-icon">shopping_cart</mat-icon>
          <h3>Carrito vacío</h3>
          <p>No hay productos en el carrito</p>
        </div>
        } } @else { @if(selectedCart && selectedCart.items.length > 0){
        <div class="cart-items">
          @for(item of selectedCart.items; track item.product.id) {
          <div class="cart-item">
            <div class="item-top-row">
              <img
                [src]="item.product.imagePath"
                alt="product"
                class="item-image"
              />
              <div class="item-details">
                <h4>{{ item.product.product_name }}</h4>
                <p>
                  {{ item.product.base_price | monedaARS }} x
                  {{ item.quantity }}
                </p>
                <p class="item-subtotal">
                  <strong
                    >Subtotal:
                    {{
                      item.product.base_price * item.quantity | monedaARS
                    }}</strong
                  >
                </p>
              </div>
            </div>
            <div class="quantity-controls">
              <button
                mat-icon-button
                (click)="
                  updateQuantity(
                    item.product.id,
                    selectedCart.vendorId,
                    item.quantity - 1
                  )
                "
              >
                <mat-icon>remove</mat-icon>
              </button>
              <span>{{ item.quantity }}</span>
              <button
                mat-icon-button
                (click)="
                  updateQuantity(
                    item.product.id,
                    selectedCart.vendorId,
                    item.quantity + 1
                  )
                "
              >
                <mat-icon>add</mat-icon>
              </button>
              <button
                mat-icon-button
                color="warn"
                (click)="removeItem(item.product.id, selectedCart.vendorId)"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
          }
        </div>
        <div class="cart-summary">
          <div class="cart-total">
            <strong>Total: {{ selectedCart.total | monedaARS }}</strong>
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
        } @else {
        <div class="empty-cart">
          <mat-icon class="empty-icon">shopping_cart</mat-icon>
          <h3>Carrito vacío</h3>
          <p>No hay productos en el carrito de este vendedor</p>
        </div>
        } }
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
      .item-subtotal {
        color: #333;
        margin-top: 0.5rem;
      }
      .quantity-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        background: #f5f5f5;
        border-radius: 4px;
        padding: 0.25rem;
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
  carts: VendorCart[] = [];
  selectedCart: VendorCart | null = null;

  constructor(
    private cartService: CartService,
    private dialogRef: MatDialogRef<CartDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CartDialogData
  ) {
    console.log('CartDialogComponent opened with data:', data);
    this.cartService.carts$.subscribe((carts) => {
      this.carts = carts;
      if (data.mode === 'vendor' && data.vendorId) {
        this.selectedCart =
          carts.find((cart) => cart.vendorId === data.vendorId) || null;
        console.log('Selected vendor cart:', this.selectedCart);
      }
    });
  }

  updateQuantity(productId: number, vendorId: string, quantity: number): void {
    this.cartService.updateQuantity(productId, vendorId, quantity);
  }

  removeItem(productId: number, vendorId: string): void {
    this.cartService.removeFromCart(productId, vendorId);
  }

  close(): void {
    this.dialogRef.close();
  }

  checkoutViaWhatsApp(cart?: VendorCart): void {
    const targetCart = cart || this.selectedCart;
    if (!targetCart || targetCart.items.length === 0) {
      console.log('No hay productos en el carrito para hacer checkout');
      return;
    }

    console.log('Haciendo checkout por WhatsApp con carrito:', targetCart);

    let message = `Hola, quiero finalizar mi compra con ${targetCart.vendorName}:\n\n`;

    targetCart.items.forEach((item: CartItem) => {
      const price = item.product.dealPrice || item.product.base_price;
      const colorPart = item.colorName ? ` - color: ${item.colorName} ` : '';
      message += `• ${item.product.product_name}${colorPart}- Cantidad: ${item.quantity} - Precio: $${price * item.quantity}\n`;
    });

    message += `\nTotal: $${targetCart.total}\n\n`;
    message += `Vendedor: ${targetCart.vendorName}\n`;
    message += `ID del vendedor: ${targetCart.vendorId}`;

    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);

    // Tomar número del vendor si se pasó
    const rawNumber: string | undefined = this.data.vendor?.socials?.whatsapp;
    const cleaned = rawNumber ? rawNumber.replace(/[^0-9]/g, '') : '';
    const sanitizedNumber = cleaned.startsWith('54')
      ? cleaned
      : cleaned
      ? '54' + cleaned
      : '';
    const whatsappUrl = sanitizedNumber
      ? `https://wa.me/${sanitizedNumber}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;
    console.log('[CartDialog checkoutViaWhatsApp] URL generada:', whatsappUrl, {
      rawNumber,
      cleaned,
      sanitizedNumber,
      vendorId: this.data.vendorId,
      vendorObject: this.data.vendor,
      items: targetCart.items.map((i) => ({
        product: i.product.product_name,
        color: i.colorName,
        qty: i.quantity,
        lineaTotal: (i.product.dealPrice || i.product.base_price) * i.quantity,
      })),
      total: targetCart.total,
    });
    window.open(whatsappUrl, '_blank');
  }
}
