import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconModule } from 'src/app/icon/icon.module';
import { MaterialModule } from 'src/app/material.module';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProductDetailsComponent } from '../product-details/product-details.component';
import { MonedaArsPipe } from 'src/app/pipe/moneda-ars.pipe';
import { VendorService, Vendor } from 'src/app/services/apps/vendor/vendor.service';
import { CartService } from 'src/app/services/apps/cart/cart.service';
import { ConfirmDialogComponent } from '../product-details/confirm-dialog.component';
import { CartDialogComponent } from './cart-dialog.component';

// Unificar interfaz con panel (name/icon)
export interface Section { name: string; icon: string; }

interface VendorProductsDialogData {
  vendor: Vendor;
}

@Component({
  selector: 'app-vendor-products-dialog',
  standalone: true,
  imports: [
    MaterialModule,
    IconModule,
    CommonModule,
    FormsModule,
    NgScrollbarModule,
    MonedaArsPipe,
  ],
  template: `
    <div class="vendor-products-modal fullscreen-modal product-details-dialog">
      <div class="modal-header">
        <h2 class="modal-title">{{ data.vendor.name }}</h2>
        <div class="header-actions">
          <button mat-icon-button (click)="close()" aria-label="Cerrar">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <div class="modal-navbar d-flex align-items-center justify-content-between p-y-12 p-x-16">
        <button mat-icon-button class="bg-primary text-white" (click)="sidenav.toggle()" aria-label="Abrir filtros">
          <mat-icon>menu</mat-icon>
        </button>
        <div class="navbar-center">
          <mat-form-field class="hide-hint search-field" appearance="outline">
            <mat-icon matPrefix>search</mat-icon>
            <input matInput placeholder="Buscar producto" [(ngModel)]="searchText" (ngModelChange)="filterCards()" />
            @if(searchText){
              <button matSuffix mat-icon-button (click)="getProductList()" aria-label="Limpiar búsqueda"><mat-icon>close</mat-icon></button>
            }
          </mat-form-field>
        </div>
        <button mat-icon-button class="cart-button" (click)="openCart()" aria-label="Carrito">
          <mat-icon>shopping_cart</mat-icon>
          @if(getCartItemCount() > 0){
            <span class="cart-badge">{{ getCartItemCount() }}</span>
          }
        </button>
      </div>

      <mat-sidenav-container class="modal-content fullscreen-container">
        <mat-sidenav #sidenav mode="over" class="modal-sidebar" [style.width.px]="mobileSidenavWidth">
          <div class="mobile-filters-header d-flex align-items-center justify-content-between">
            <h6 class="m-0 f-s-14 f-w-600">Filtros</h6>
            <button mat-icon-button (click)="sidenav.close()" aria-label="Cerrar filtros">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <ng-scrollbar class="position-relative mobile-filters-scroll" style="height: 100%">
            <div class="p-16">
              <h5 class="m-0 p-t-16 p-x-32 f-s-14 f-w-600">Filtrar por categoría</h5>
              <div class="p-16">
                <mat-nav-list>
                  @for(folder of folders; track folder){
                  <mat-list-item role="listitem" class="m-b-2 gap-10 active-primary" [ngClass]="{'bg-primary': selectedCategory === folder.name}" (click)="getCategory(folder.name)">
                    <span matListItemIcon class="m-r-0"><i-tabler name="{{ folder.icon }}" class="icon-18"></i-tabler></span>
                    <span matListItemTitle class="f-w-400 f-s-14">{{ folder.name | titlecase }}</span>
                  </mat-list-item>
                  }
                </mat-nav-list>
              </div>
              <h5 class="m-0 p-t-16 p-x-32 f-s-14 f-w-600 b-t-1">Ordenar por</h5>
              <div class="p-16">
                <mat-nav-list>
                  @for (note of notes; track note) {
                  <mat-list-item role="listitem" class="m-b-2 gap-10 active-primary" [ngClass]="{ 'bg-primary': selectedSortBy === note.name }" (click)="getSorted(note.name)">
                    <span matListItemIcon class="m-r-0"><i-tabler name="{{ note.icon }}" class="icon-18"></i-tabler></span>
                    <span matListItemTitle class="f-w-400 f-s-14">{{ note.name | titlecase }}</span>
                  </mat-list-item>
                  }
                </mat-nav-list>
              </div>
              <h5 class="m-0 p-t-16 p-x-32 f-s-14 f-w-600 b-t-1">Por género</h5>
              <div class="p-16 pricing-section">
                <mat-radio-group [(ngModel)]="selectedGender" class="m-b-20">
                  @for (price of genderOptions; track price.value) {
                  <mat-radio-button class="custom-radio" [value]="price.value" (click)="getGender(price.value)">{{ price.label | titlecase }}</mat-radio-button>
                  }
                </mat-radio-group>
              </div>
              <h5 class="m-0 p-t-16 p-x-32 f-s-14 f-w-600 b-t-1">Por precio</h5>
              <div class="p-16 pricing-section">
                <mat-radio-group [(ngModel)]="selectedPrice" class="m-b-20">
                  @for (price of priceOptions; track price.value) {
                  <mat-radio-button class="custom-radio" [value]="price.value" (click)="getPricing(price.value)">{{ price.label | titlecase }}</mat-radio-button>
                  }
                </mat-radio-group>
              </div>
              <div class="sidebar-reset-wrapper b-t-1 p-16">
                <button mat-flat-button class="w-100" (click)="getRestFilter()">Restablecer filtros</button>
              </div>
            </div>
          </ng-scrollbar>
        </mat-sidenav>

        <mat-sidenav-content class="fullscreen-content">
          <div class="row">
            @if(loading){
              @for(s of [1,2,3,4,5,6]; track s){
                <div class="col-6 p-x-4 p-sm-0 m-b-24 shop-skeleton-wrapper">
                  <div class="skeleton-card">
                    <div class="skeleton-img"></div>
                    <div class="skeleton-footer">
                      <div class="skeleton-bar long"></div>
                      <div class="skeleton-bar short"></div>
                    </div>
                  </div>
                </div>
              }
            } @else {
              @for(productcard of filteredCards; track productcard.product_name) {
                <div class="col-6 p-x-4 p-sm-0">
                  <mat-card class="cardWithShadow productcard overflow-hidden b-1 cursor-pointer" (click)="getviewDetails(productcard)">
                    <div class="img-wrapper position-relative">
                      <img [src]="productcard.imagePath" alt="imgSrc" class="w-100" mat-card-image />
                    </div>
                    <mat-card-content class="p-10 position-relative" style="padding: 10px !important;"> 
                      <mat-card-title class="mat-headline-2 f-s-16 m-b-4 product-title text-ellipsis">{{ productcard.product_name }}</mat-card-title>
                      <div class="product-meta-line d-flex align-items-center justify-content-between">
                        <div class="price-line d-flex align-items-center">
                          @if(productcard.dealPrice && productcard.dealPrice < productcard.base_price){
                            <span class="price-old f-s-14 f-w-500 m-r-6" aria-label="Precio anterior">{{ productcard.base_price | monedaARS }}</span>
                            <h6 class="price-current f-s-16 f-w-600 m-0 text-primary" aria-label="Precio con descuento">{{ productcard.dealPrice | monedaARS }}</h6>
                          } @else {
                            <h6 class="price-current f-s-16 f-w-600 m-0" aria-label="Precio">{{ productcard.base_price | monedaARS }}</h6>
                          }
                        </div>
                        <div class="stars-line d-flex align-items-center gap-1">
                          @if(productcard.rating !== undefined){
                            @for (star of [1,2,3,4,5]; track star){<i-tabler name="star" class="icon-17 text-warning" [ngClass]="getStarClass(star, productcard.rating )"></i-tabler>}
                          }
                        </div>
                      </div>
                      <div class="wholesale-lines f-s-12 m-t-8">
                        @if(productcard.talles){<div class="line"><strong>Talles:</strong> {{ productcard.talles }}</div>}
                        @if(productcard.tela){<div class="line"><strong>Tela:</strong> {{ productcard.tela }}</div>}
                        @if(productcard.generos && productcard.generos.length){<div class="line"><strong>Género:</strong> {{ productcard.generos.join(', ') }}</div>}
                        @if(productcard.categoria){<div class="line"><strong>Categoría:</strong> {{ productcard.categoria }}</div>}
                      </div>
                    </mat-card-content>
                  </mat-card>
                </div>
              }@empty {
                <div class="col-12 text-center p-4 m-t-30">
                  <img src="assets/images/products/empty-shopping-cart.svg" width="200" height="200" />
                  <div class="f-s-48 f-w-600">No hay productos</div>
                  <div class="f-s-14 f-w-500">El producto que buscas no está disponible.</div>
                  <button mat-flat-button (click)="getProductList()" class="m-t-10">Intentar nuevamente</button>
                </div>
              }
            }
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .vendor-products-modal.fullscreen-modal.product-details-dialog {
      display: flex;
      flex-direction: column;
      height: 100vh !important;
      width: 100vw !important;
      max-height: 100vh !important;
      max-width: 100vw !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow-x: hidden;
    }
    .modal-header {
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
    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .modal-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }
    .modal-navbar {
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;
      background: #fff;
    }
    .navbar-center {
      flex: 1;
      display: flex;
      justify-content: center;
    }
    mat-sidenav-container {
      width: 100% !important;
      height: 100% !important;
    }
    .fullscreen-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100% !important;
      padding: 16px;
      overflow-y: auto;
      overflow-x: hidden;
      box-sizing: border-box;
    }
    .search-field {
      width: 100%;
      max-width: 300px;
      
      @media (max-width: 767px) {
        max-width: 280px;
      }
    }
    .cart-button {
      position: relative;
      margin-left: 8px;
    }
    .cart-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #f44336;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
    }
    .mobile-filters-header {
      position: sticky;
      top: 0;
      background: #fff;
      z-index: 5;
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;
    }
    .mobile-filters-scroll {
      height: calc(100% - 60px);
    }
    .sidebar-reset-wrapper {
      position: sticky;
      bottom: 0;
      background: #fff;
      box-shadow: 0 -2px 4px rgba(0,0,0,0.05);
    }
    .pricing-section mat-radio-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .custom-radio {
      font-size: 14px;
      color: #2c2c2c;
      &.mat-radio-checked .mat-radio-outer-circle {
        border-color: var(--mat-sys-primary);
      }
    }
    .active-primary.bg-primary i-tabler,
    .active-primary.bg-primary .mdc-list-item__primary-text {
      color: white;
    }
    .row {
      margin-left: 0 !important;
      margin-right: 0 !important;
      padding-left: 2px;
      padding-right: 2px;
    }
    .col-6 {
      padding-left: 4px !important;
      padding-right: 4px !important;
    }
    mat-card-content {
      padding: 10px !important;
    }
    .shop-skeleton-wrapper .skeleton-card {
      position: relative;
      overflow: hidden;
      background: linear-gradient(90deg, #f0f0f0 25%, #fafafa 37%, #f0f0f0 63%);
      background-size: 400% 100%;
      animation: shimmer 1.3s ease-in-out infinite;
      border-radius: 12px;
      padding: 0;
      height: 300px;
      display: flex;
      flex-direction: column;
    }
    .skeleton-img {
      flex: 1 1 auto;
      border-radius: 12px 12px 0 0;
    }
    .skeleton-footer {
      margin-top: auto;
      padding: 8px 16px 16px;
    }
    .skeleton-bar {
      height: 14px;
      margin: 8px 0;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.08);
    }
    .skeleton-bar.long { width: 70%; }
    .skeleton-bar.short { width: 40%; }
    @keyframes shimmer {
      0% { background-position: 100% 0; }
      100% { background-position: 0 0; }
    }
  `]
})
export class VendorProductsDialogComponent implements OnInit {
  @ViewChild('infiniteAnchor', { static: false }) infiniteAnchor!: ElementRef;

  searchText: string = '';
  allProducts: any[] = [];
  filteredCards: any[] = [];
  loading = false;

  folders: Section[] = [
    { name: 'todos', icon: 'users' },
    { name: 'denim', icon: 'hanger' },
    { name: 'camisas', icon: 'shirt' },
    { name: 'deportivo', icon: 'mood-smile' },
    { name: 'hombre', icon: 'user' },
    { name: 'mujer', icon: 'user' },
  ];
  selectedCategory: string = this.folders[0].name;

  notes: Section[] = [
    { name: 'más nuevo', icon: 'calendar' },
    { name: 'precio alto-bajo', icon: 'sort-descending' },
    { name: 'precio bajo-alto', icon: 'sort-ascending' },
    { name: 'con descuento', icon: 'percentage' },
  ];
  selectedSortBy: string = this.notes[0].name;

  selectedColor: string | null = null;
  selectedGender: string = 'todos';
  genderOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Hombre', value: 'hombre' },
    { label: 'Mujer', value: 'mujer' },
    { label: 'Niños', value: 'niños' },
  ];
  selectedPrice: string = 'todos';
  priceOptions = [
    { label: 'Todos', value: 'todos' },
    { label: '0 – 50', value: '0-50' },
    { label: '50 – 100', value: '50-100' },
    { label: '100 – 200', value: '100-200' },
    { label: 'Más de 200', value: 'over-200' },
  ];

  mobileSidenavWidth = 300;

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<VendorProductsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VendorProductsDialogData,
    private vendorService: VendorService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts() {
    this.loading = true;
    // Simulate loading
    setTimeout(() => {
      this.allProducts = this.vendorService.getProductsByVendor(this.data.vendor.id);
      this.filteredCards = [...this.allProducts];
      this.loading = false;
    }, 500);
  }

  filterCards() {
    const text = this.searchText.toLowerCase();
    this.filteredCards = this.allProducts.filter(card =>
      card.product_name.toLowerCase().includes(text) ||
      card.categoria?.toLowerCase().includes(text)
    );
  }

  getCategory(name: string): void {
    this.selectedCategory = name;
    if (name.toLowerCase() === 'todos') {
      this.filteredCards = [...this.allProducts];
    } else {
      this.filteredCards = this.allProducts.filter(card =>
        card.categoria?.toLowerCase() === name.toLowerCase()
      );
    }
  }

  getSorted(name: string): void {
    this.selectedSortBy = name;
    const nameLower = name.toLowerCase();
    switch (nameLower) {
      case 'más nuevo':
        this.filteredCards = [...this.allProducts].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'precio alto-bajo':
        this.filteredCards = [...this.allProducts].sort((a,b) => +b.base_price - +a.base_price);
        break;
      case 'precio bajo-alto':
        this.filteredCards = [...this.allProducts].sort((a,b) => +a.base_price - +b.base_price);
        break;
      case 'con descuento':
        this.filteredCards = [...this.allProducts].sort((a,b) => {
          const discountA = (+a.base_price - +a.dealPrice);
          const discountB = (+b.base_price - +b.dealPrice);
          return discountB - discountA;
        });
        break;
      default:
        this.filteredCards = [...this.allProducts];
    }
  }

  getGender(gender: string): void {
    this.selectedGender = gender;
    if (gender.toLowerCase() === 'todos') {
      this.filteredCards = [...this.allProducts];
    } else {
      this.filteredCards = this.allProducts.filter(card => card.generos?.includes(gender.toLowerCase()));
    }
  }

  getPricing(priceRange: string): void {
    this.selectedPrice = priceRange;
    switch (priceRange) {
      case '0-50':
        this.filteredCards = this.allProducts.filter(card => +card.base_price >= 0 && +card.base_price <= 50);
        break;
      case '50-100':
        this.filteredCards = this.allProducts.filter(card => +card.base_price > 50 && +card.base_price <= 100);
        break;
      case '100-200':
        this.filteredCards = this.allProducts.filter(card => +card.base_price > 100 && +card.base_price <= 200);
        break;
      case 'over-200':
        this.filteredCards = this.allProducts.filter(card => +card.base_price > 200);
        break;
      case 'todos':
      default:
        this.filteredCards = [...this.allProducts];
        break;
    }
  }

  getRestFilter() {
    this.selectedCategory = this.folders[0].name;
    this.selectedSortBy = this.notes[0].name;
    this.filteredCards = [...this.allProducts];
    this.searchText = '';
    this.selectedGender = 'todos';
    this.selectedPrice = 'todos';
  }

  getProductList() {
    this.searchText = '';
    this.filteredCards = [...this.allProducts];
  }

  getviewDetails(product: any) {
    this.dialog.open(ProductDetailsComponent, {
      data: { 
        productId: product.id,
        vendor: this.data.vendor
      },
      panelClass: ['product-details-dialog'],
      maxWidth: '100vw',
      width: '100vw',
      height: '100vh',
      autoFocus: false,
      restoreFocus: false,
      disableClose: false,
    });
  }

  openCart() {
    console.log('Abriendo carrito del vendedor:', {
      vendorId: this.data.vendor.id,
      vendorName: this.data.vendor.name,
      cartItems: this.cartService.getVendorTotalItems(this.data.vendor.id)
    });
    this.dialog.open(CartDialogComponent, {
      data: { mode: 'vendor', vendorId: this.data.vendor.id },
      panelClass: ['product-details-dialog'],
      maxWidth: '100vw',
      width: '100vw',
      height: '100vh',
      autoFocus: false,
      restoreFocus: false,
      disableClose: false,
    });
  }

  getCartItemCount(): number {
    const count = this.cartService.getVendorTotalItems(this.data.vendor.id);
    console.log(`Contador de carrito para ${this.data.vendor.name}: ${count} items`);
    return count;
  }

  checkoutViaWhatsApp() {
    const vendorCart = this.cartService.getVendorCart(this.data.vendor.id);
    if (!vendorCart || vendorCart.items.length === 0) {
      // Si no hay productos, mostrar mensaje
      alert('No hay productos en el carrito para este vendedor');
      return;
    }

    let message = `Hola, quiero comprar los siguientes productos de ${this.data.vendor.name}:\n\n`;
    
    vendorCart.items.forEach((item: any) => {
      const price = item.product.dealPrice || item.product.base_price;
      message += `• ${item.product.product_name} - Cantidad: ${item.quantity} - Precio: $${price * item.quantity}\n`;
    });
    
    message += `\nTotal: $${vendorCart.total}\n\n`;
    message += `Vendedor: ${this.data.vendor.name}\n`;
    message += `ID del vendedor: ${this.data.vendor.id}`;

    // Agregar información de contacto si está disponible
    if (this.data.vendor.socials?.whatsapp) {
      message += `WhatsApp: ${this.data.vendor.socials.whatsapp}\n`;
    }
    if (this.data.vendor.socials?.web) {
      message += `Web: ${this.data.vendor.socials.web}\n`;
    }

    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Abrir WhatsApp con el mensaje
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }

  getStarClass(index: number, rating?: number): string {
    const safeRating = rating ?? 0;
    const fullStars = Math.floor(safeRating);
    const partialStars = safeRating % 1 !== 0;
    if (index < fullStars) {
      return 'fill-warning';
    } else if (index === fullStars && partialStars) {
      return 'text-warning';
    } else {
      return '';
    }
  }

  close() {
    this.dialogRef.close();
  }
}