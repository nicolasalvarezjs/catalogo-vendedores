import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconModule } from 'src/app/icon/icon.module';
import { MaterialModule } from 'src/app/material.module';
import { NgScrollbarModule } from 'ngx-scrollbar';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ProductDetailsComponent } from '../product-details/product-details.component';
import { MonedaArsPipe } from 'src/app/pipe/moneda-ars.pipe';
import { Vendor } from 'src/app/services/apps/vendor/vendor.service';
import {
  ProductApiService,
  BackendProduct,
} from 'src/app/services/api/product-api.service';
import {
  CategoryApiService,
  BackendCategory,
} from 'src/app/services/api/category-api.service';
import { CartService } from 'src/app/services/apps/cart/cart.service';
import { ConfirmDialogComponent } from '../product-details/confirm-dialog.component';
import { CartDialogComponent } from './cart-dialog.component';

// Unificar interfaz con panel (name/icon)
export interface Section {
  name: string;
  icon: string;
}

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

      <div
        class="modal-navbar d-flex align-items-center justify-content-between p-y-12 p-x-16"
      >
        <button
          mat-icon-button
          class="bg-primary text-white"
          (click)="sidenav.toggle()"
          aria-label="Abrir filtros"
        >
          <mat-icon>menu</mat-icon>
        </button>
        <div class="navbar-center">
          <mat-form-field class="hide-hint search-field" appearance="outline">
            <mat-icon matPrefix>search</mat-icon>
            <input
              matInput
              placeholder="Buscar producto"
              [(ngModel)]="searchText"
              (ngModelChange)="filterCards()"
            />
            @if(searchText){
            <button
              matSuffix
              mat-icon-button
              (click)="getProductList()"
              aria-label="Limpiar búsqueda"
            >
              <mat-icon>close</mat-icon>
            </button>
            }
          </mat-form-field>
        </div>
        <button
          mat-icon-button
          class="cart-button"
          (click)="openCart()"
          aria-label="Carrito"
        >
          <mat-icon>shopping_cart</mat-icon>
          @if(getCartItemCount() > 0){
          <span class="cart-badge">{{ getCartItemCount() }}</span>
          }
        </button>
      </div>

      <mat-sidenav-container class="modal-content fullscreen-container">
        <mat-sidenav
          #sidenav
          mode="over"
          class="modal-sidebar"
          [style.width.px]="mobileSidenavWidth"
        >
          <div
            class="mobile-filters-header d-flex align-items-center justify-content-between"
          >
            <h6 class="m-0 f-s-14 f-w-600">Filtros</h6>
            <button
              mat-icon-button
              (click)="sidenav.close()"
              aria-label="Cerrar filtros"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <ng-scrollbar
            class="position-relative mobile-filters-scroll"
            style="height: 100%"
          >
            <div class="p-16">
              <h5 class="m-0 p-t-16 p-x-32 f-s-14 f-w-600">
                Filtrar por categorías
              </h5>
              <div class="p-16">
                <mat-form-field appearance="outline" class="w-100">
                  <mat-label>Categorías</mat-label>
                  <mat-select
                    multiple
                    [(ngModel)]="selectedCategories"
                    (ngModelChange)="onCategoriesChange($event)"
                    placeholder="Todas"
                  >
                    @for(cat of categories; track cat.id){
                    <mat-option [value]="cat.name">{{
                      cat.name | titlecase
                    }}</mat-option>
                    }
                  </mat-select>
                  <mat-hint *ngIf="selectedCategories.length === 0"
                    >Mostrando todas las categorías</mat-hint
                  >
                </mat-form-field>
              </div>
              <h5 class="m-0 p-t-16 p-x-32 f-s-14 f-w-600 b-t-1">
                Ordenar por
              </h5>
              <div class="p-16">
                <mat-nav-list>
                  @for (note of notes; track note) {
                  <mat-list-item
                    role="listitem"
                    class="m-b-2 gap-10 active-primary"
                    [ngClass]="{ 'bg-primary': selectedSortBy === note.name }"
                    (click)="getSorted(note.name)"
                  >
                    <span matListItemIcon class="m-r-0"
                      ><i-tabler
                        name="{{ note.icon }}"
                        class="icon-18"
                      ></i-tabler
                    ></span>
                    <span matListItemTitle class="f-w-400 f-s-14">{{
                      note.name | titlecase
                    }}</span>
                  </mat-list-item>
                  }
                </mat-nav-list>
              </div>
              <h5 class="m-0 p-t-16 p-x-32 f-s-14 f-w-600 b-t-1">Por género</h5>
              <div class="p-16 pricing-section">
                <mat-radio-group [(ngModel)]="selectedGender" class="m-b-20">
                  @for (price of genderOptions; track price.value) {
                  <mat-radio-button
                    class="custom-radio"
                    [value]="price.value"
                    (click)="getGender(price.value)"
                    >{{ price.label | titlecase }}</mat-radio-button
                  >
                  }
                </mat-radio-group>
              </div>
              <div class="sidebar-reset-wrapper b-t-1 p-16">
                <button mat-flat-button class="w-100" (click)="getRestFilter()">
                  Restablecer filtros
                </button>
              </div>
            </div>
          </ng-scrollbar>
        </mat-sidenav>

        <mat-sidenav-content class="fullscreen-content">
          <div class="row">
            @if(loading){ @for(s of [1,2,3,4,5,6]; track s){
            <div class="col-6 p-x-4 p-sm-0 m-b-24 shop-skeleton-wrapper">
              <div class="skeleton-card">
                <div class="skeleton-img"></div>
                <div class="skeleton-footer">
                  <div class="skeleton-bar long"></div>
                  <div class="skeleton-bar short"></div>
                </div>
              </div>
            </div>
            } } @else { @for(productcard of filteredCards; track
            productcard.product_name) {
            <div class="col-6 col-lg-3 p-x-4 p-sm-0">
              <mat-card
                class="cardWithShadow productcard overflow-hidden b-1 cursor-pointer"
                (click)="getviewDetails(productcard)"
              >
                <div class="img-wrapper position-relative">
                  <img
                    [src]="productcard.imagePath"
                    alt="imgSrc"
                    class="w-100"
                    mat-card-image
                  />
                </div>
                <mat-card-content
                  class="p-10 position-relative"
                  style="padding: 10px !important;"
                >
                  <mat-card-title
                    class="mat-headline-2 f-s-16 m-b-4 product-title text-ellipsis"
                    >{{ productcard.product_name }}</mat-card-title
                  >
                  <div
                    class="product-meta-line d-flex align-items-center justify-content-between m-b-8"
                  >
                    <div class="price-line d-flex align-items-center">
                      @if(productcard.dealPrice && productcard.dealPrice <
                      productcard.base_price){
                      <span
                        class="price-old f-s-14 f-w-500 m-r-6 text-muted"
                        aria-label="Precio anterior"
                        >{{ productcard.base_price | monedaARS }}</span
                      >
                      <h6
                        class="price-current f-s-16 f-w-600 m-0 text-success"
                        aria-label="Precio con descuento"
                      >
                        {{ productcard.dealPrice | monedaARS }}
                      </h6>
                      <span class="discount-badge f-s-12 f-w-600 m-l-6"
                        >{{ productcard.discountPercent }}% OFF</span
                      >
                      } @else {
                      <h6
                        class="price-current f-s-16 f-w-600 m-0 text-primary"
                        aria-label="Precio"
                      >
                        {{ productcard.base_price | monedaARS }}
                      </h6>
                      }
                    </div>
                  </div>
                  <div class="wholesale-lines f-s-12">
                    @if(productcard.talles){
                    <div class="line d-flex align-items-center gap-4 m-b-4">
                      <i-tabler
                        name="ruler"
                        class="icon-14 text-muted"
                      ></i-tabler
                      ><strong>Talles:</strong>
                      <span class="talles-badge">{{ productcard.talles }}</span>
                    </div>
                    } @if(productcard.tela){
                    <div class="line d-flex align-items-center gap-4 m-b-4">
                      <i-tabler
                        name="scissors"
                        class="icon-14 text-muted"
                      ></i-tabler
                      ><strong>Tela:</strong> {{ productcard.tela }}
                    </div>
                    } @if(productcard.generos && productcard.generos.length){
                    <div class="line generos-line m-b-4">
                      <div class="d-flex align-items-center gap-4">
                        <i-tabler
                          name="users"
                          class="icon-14 text-muted"
                        ></i-tabler>
                        <strong class="f-w-600">Géneros:</strong>
                      </div>
                      <div class="generos-row d-flex gap-6 m-t-4">
                        @for(g of productcard.generos; track g){
                        <span
                          class="genero-pill"
                          [title]="g"
                          [attr.aria-label]="'Género ' + g"
                          >{{ g }}</span
                        >
                        }
                      </div>
                    </div>
                    } @if(productcard.categoria){
                    <div class="line d-flex align-items-center gap-4">
                      <i-tabler name="tag" class="icon-14 text-muted"></i-tabler
                      ><strong>Categoría:</strong>
                      <span class="category-chip">{{
                        productcard.categoria
                      }}</span>
                    </div>
                    } @if(productcard.colors && productcard.colors.length){
                    <div class="line colors-line m-b-4">
                      <div class="d-flex align-items-center gap-4">
                        <i-tabler
                          name="palette"
                          class="icon-14 text-muted"
                        ></i-tabler>
                        <strong class="f-w-600">Colores:</strong>
                      </div>
                      <div class="color-avatars d-flex flex-wrap gap-6 m-t-4">
                        @for(c of productcard.colors; track c._id){
                        <div
                          class="color-avatar"
                          [title]="c.name + ' ' + c.hex"
                          [attr.aria-label]="c.name"
                        >
                          <span
                            class="swatch"
                            [style.background]="c.hex"
                          ></span>
                        </div>
                        }
                      </div>
                    </div>
                    } @if((!productcard.colors || !productcard.colors.length) &&
                    productcard.color){
                    <div class="line d-flex align-items-center gap-4 m-b-4">
                      <i-tabler
                        name="palette"
                        class="icon-14 text-muted"
                      ></i-tabler>
                      <strong>Color:</strong>
                      <span class="color-chip" [title]="productcard.color">
                        <span
                          class="mini-swatch"
                          [style.background]="productcard.color"
                        ></span>
                        <span class="c-name">{{ productcard.color }}</span>
                      </span>
                    </div>
                    }
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
            }@empty {
            <div class="col-12 text-center p-4 m-t-30">
              <img
                src="assets/images/products/empty-shopping-cart.svg"
                width="200"
                height="200"
              />
              <div class="f-s-48 f-w-600">No hay productos</div>
              <div class="f-s-14 f-w-500">
                El producto que buscas no está disponible.
              </div>
              <button mat-flat-button (click)="getProductList()" class="m-t-10">
                Intentar nuevamente
              </button>
            </div>
            } }
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [
    `
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
        box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
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
        background: linear-gradient(
          90deg,
          #f0f0f0 25%,
          #fafafa 37%,
          #f0f0f0 63%
        );
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
      .skeleton-bar.long {
        width: 70%;
      }
      .skeleton-bar.short {
        width: 40%;
      }
      @keyframes shimmer {
        0% {
          background-position: 100% 0;
        }
        100% {
          background-position: 0 0;
        }
      }
      .img-wrapper {
        max-height: 300px;
        overflow: hidden;
      }
      .img-wrapper img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .discount-badge {
        background: #ff4444;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
      }
      .talles-badge {
        background: #e3f2fd;
        color: #1976d2;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 500;
      }
      .category-chip {
        background: #f3e5f5;
        color: #7b1fa2;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 500;
      }
      .genero-chip {
        background: #e8f5e9;
        color: #1b5e20;
      }
      .wholesale-lines .line {
        margin-bottom: 4px;
      }
      .wholesale-lines .line:last-child {
        margin-bottom: 0;
      }
      /* Color avatars */
      .colors-line strong {
        font-size: 12px;
      }
      .color-avatars {
        --avatar-size: 18px;
      }
      .color-avatar {
        width: var(--avatar-size);
        height: var(--avatar-size);
        border-radius: 50%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
        overflow: hidden;
      }
      .color-avatar .swatch {
        position: absolute;
        inset: 0;
        border-radius: 50%;
      }
      .color-avatar:hover {
        box-shadow: 0 0 0 2px var(--mat-sys-primary, #1976d2);
      }
      .color-avatar:focus-within {
        outline: 2px solid var(--mat-sys-primary, #1976d2);
        outline-offset: 2px;
      }
      .color-avatar + .color-avatar {
        margin-left: 4px;
      }
      @supports not (gap: 6px) {
        .color-avatars {
          margin-left: -4px;
        }
        .color-avatar {
          margin-left: 4px;
        }
      }
      /* Generos pills */
      .generos-line strong {
        font-size: 12px;
      }
      .generos-row {
        flex-wrap: nowrap;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .generos-row::-webkit-scrollbar {
        display: none;
      }
      .genero-pill {
        background: #e8f5e9;
        color: #1b5e20;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 500;
        white-space: nowrap;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
      }
      .genero-pill + .genero-pill {
        margin-left: 4px;
      }
      .genero-pill:hover {
        box-shadow: 0 0 0 2px var(--mat-sys-primary, #1976d2);
      }
    `,
  ],
})
export class VendorProductsDialogComponent implements OnInit {
  @ViewChild('infiniteAnchor', { static: false }) infiniteAnchor!: ElementRef;

  searchText: string = '';
  allProducts: any[] = [];
  filteredCards: any[] = [];
  loading = false;

  // Categorías dinámicas obtenidas del backend
  categories: BackendCategory[] = [];
  selectedCategories: string[] = []; // vacío => todas

  notes: Section[] = [
    { name: 'más nuevo', icon: 'calendar' },
    { name: 'precio alto-bajo', icon: 'sort-descending' },
    { name: 'precio bajo-alto', icon: 'sort-ascending' },
  ];
  selectedSortBy: string = this.notes[0].name;

  selectedColor: string | null = null;
  selectedGender: string = 'todos';
  genderOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Mujer', value: 'mujer' },
    { label: 'Hombre', value: 'hombre' },
    { label: 'Niño', value: 'niño' },
    { label: 'Niña', value: 'niña' },
    { label: 'Unisex', value: 'unisex' },
  ];
  // Eliminado filtro de precio (requerimiento)

  mobileSidenavWidth = 300;

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<VendorProductsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VendorProductsDialogData,
    private productApi: ProductApiService,
    private categoryApi: CategoryApiService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  private backendPage = 1;
  private backendLimit = 12;
  private backendTotalPages = 0;
  private allLoaded = false;

  private mapBackendProduct(p: BackendProduct) {
    return {
      id: p._id,
      product_name: p.product_name,
      base_price: p.base_price,
      dealPrice: p.base_price, // si hay precio oferta luego se ajusta
      // Mantener primera imagen como imagePath (legacy) pero conservar array completo
      imagePath:
        p.images && p.images.length > 0
          ? p.images[0]
          : 'assets/images/products/no-image.png',
      images: p.images || [], // NUEVO: pasar arreglo completo al details
      categoria: p.categoria,
      generos: p.generos,
      talles: p.talles,
      tela: p.tela,
      date: p.date,
      description: p.description,
      vendorId:
        typeof p.vendorId === 'string' ? p.vendorId : (p.vendorId as any)?._id,
      colors: p.colors,
      color: p.color,
      salesType: p.salesType,
      minPurchase: p.minPurchase,
    };
  }

  private loadProducts() {
    if (this.loading || this.allLoaded) return;
    this.loading = true;
    this.productApi
      .getProducts({
        page: this.backendPage,
        limit: this.backendLimit,
        vendorId: this.data.vendor.id,
        categories: this.selectedCategories.length
          ? this.selectedCategories
          : undefined,
      })
      .subscribe({
        next: (res) => {
          const mapped = res.products.map((p) => this.mapBackendProduct(p));
          this.allProducts.push(...mapped);
          this.filteredCards = [...this.allProducts];
          this.backendTotalPages = res.totalPages;
          if (res.page >= res.totalPages) {
            this.allLoaded = true;
          } else {
            this.backendPage += 1;
          }
        },
        error: (err) => console.error('Error cargando productos backend', err),
        complete: () => (this.loading = false),
      });
  }

  filterCards() {
    const text = this.searchText.toLowerCase();
    this.filteredCards = this.allProducts.filter(
      (card) =>
        card.product_name.toLowerCase().includes(text) ||
        card.categoria?.toLowerCase().includes(text)
    );
  }

  // Cambio manual desde template multi-select
  onCategoriesChange(values: string[]) {
    this.selectedCategories = values || [];
    this.resetAndReloadProducts();
  }

  getSorted(name: string): void {
    this.selectedSortBy = name;
    const nameLower = name.toLowerCase();
    switch (nameLower) {
      case 'más nuevo':
        this.filteredCards = [...this.allProducts].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case 'precio alto-bajo':
        this.filteredCards = [...this.allProducts].sort(
          (a, b) => +b.base_price - +a.base_price
        );
        break;
      case 'precio bajo-alto':
        this.filteredCards = [...this.allProducts].sort(
          (a, b) => +a.base_price - +b.base_price
        );
        break;
      default:
        this.filteredCards = [...this.allProducts];
    }
  }

  getGender(gender: string): void {
    this.selectedGender = gender;
    const normalized = (gender || '').toString().toLowerCase();
    if (normalized === 'todos') {
      this.filteredCards = [...this.allProducts];
      return;
    }

    this.filteredCards = this.allProducts.filter((card) => {
      // Prefer the new `generos` array (case-insensitive match)
      if (Array.isArray(card.generos) && card.generos.length) {
        return card.generos.some((g: any) =>
          (g || '').toString().toLowerCase() === normalized
        );
      }

      // Fallback to legacy single `gender` property
      if (card.gender) {
        return card.gender.toString().toLowerCase() === normalized;
      }

      return false;
    });
  }

  // Filtro de precio removido

  getRestFilter() {
    this.selectedCategories = [];
    this.selectedSortBy = this.notes[0].name;
    this.searchText = '';
    this.selectedGender = 'todos';
    this.resetAndReloadProducts();
  }

  getProductList() {
    this.searchText = '';
    this.filteredCards = [...this.allProducts];
  }

  getviewDetails(product: any) {
    console.log('[VIEW DETAILS] Producto seleccionado:', {
      id: product._id,
      name: product.product_name,
      colors: product.colors,
      legacyColor: product.color,
      vendor: this.data.vendor?.id,
    });
    this.dialog.open(ProductDetailsComponent, {
      data: {
        product: product, // pasar objeto completo para que detalle tenga descripcion y otras props
        vendor: this.data.vendor,
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
    console.log('Abriendo carrito del vendedor (dialog):', {
      vendor: this.data.vendor,
      vendorId: this.data.vendor.id,
      vendorName: this.data.vendor.name,
      cartItems: this.cartService.getVendorTotalItems(this.data.vendor.id),
    });
    this.dialog.open(CartDialogComponent, {
      data: {
        mode: 'vendor',
        vendorId: this.data.vendor.id,
        vendor: this.data.vendor,
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

  getCartItemCount(): number {
    const count = this.cartService.getVendorTotalItems(this.data.vendor.id);
    // Quitar logging repetitivo que spamea consola
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
      const colorPart = item.colorName ? ` - color: ${item.colorName} ` : '';
      const sizesPart =
        item.sizes && item.sizes.length
          ? ` - talles: [${item.sizes.join(', ')}]`
          : '';
      message += `• ${
        item.product.product_name
      }${colorPart}${sizesPart} - Cantidad: ${item.quantity} - Precio: $${
        price * item.quantity
      }\n`;
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

    // Abrir WhatsApp con el mensaje usando número del vendedor si existe (Argentina 54)
    const rawNumber: string | undefined = this.data.vendor.socials?.whatsapp;
    const cleaned = rawNumber ? rawNumber.replace(/[^0-9]/g, '') : '';
    // Evitar duplicar 54 si ya lo trae
    const sanitizedNumber = cleaned.startsWith('54')
      ? cleaned
      : cleaned
      ? '54' + cleaned
      : '';
    const whatsappUrl = sanitizedNumber
      ? `https://wa.me/${sanitizedNumber}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;
    console.log('[checkoutViaWhatsApp] URL generada:', whatsappUrl);
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

  private loadCategories() {
    this.categoryApi.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
      },
      error: (err) => {
        console.error('Error cargando categorías', err);
        this.categories = [];
      },
    });
  }
  private resetAndReloadProducts() {
    this.backendPage = 1;
    this.backendTotalPages = 0;
    this.allLoaded = false;
    this.allProducts = [];
    this.filteredCards = [];
    this.loadProducts();
  }
}
