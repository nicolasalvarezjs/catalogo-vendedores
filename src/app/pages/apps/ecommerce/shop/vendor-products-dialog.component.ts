import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { IconModule } from 'src/app/icon/icon.module';
import { MaterialModule } from 'src/app/material.module';
import { MonedaArsPipe } from 'src/app/pipe/moneda-ars.pipe';
import { Vendor } from 'src/app/services/apps/vendor/vendor.service';
import {
  BackendProduct,
  ProductApiService,
} from 'src/app/services/api/product-api.service';
import {
  BackendCategory,
  CategoryApiService,
} from 'src/app/services/api/category-api.service';
import { CartService } from 'src/app/services/apps/cart/cart.service';
import { ProductDetailsComponent } from '../product-details/product-details.component';
import { CartDialogComponent } from './cart-dialog.component';

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

      <mat-sidenav-container class="fullscreen-container">
        <mat-sidenav
          #sidenav
          mode="over"
          class="filter-sidenav"
          [style.width.px]="mobileSidenavWidth"
        >
          <div class="mobile-filters-header d-flex align-items-center justify-content-between">
            <h4 class="m-0">Filtros</h4>
            <button mat-icon-button (click)="sidenav.close()" aria-label="Cerrar filtros">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="p-16">
            <h5 class="section-title">Ordenar</h5>
            <mat-nav-list>
              <a mat-list-item *ngFor="let note of notes" (click)="getSorted(note.name)">
                <span matListItemTitle>{{ note.name | titlecase }}</span>
              </a>
            </mat-nav-list>

            <h5 class="section-title">Categor�as</h5>
            <mat-selection-list
                [multiple]="true"
                (selectionChange)="onCategorySelectionChange($event)"
            >
              <mat-list-option
                *ngFor="let c of categories"
                [value]="c.id"
                [selected]="selectedCategories.includes(c.id)"
              >
                {{ c.name }}
              </mat-list-option>
            </mat-selection-list>

            <h5 class="section-title">G�nero</h5>
            <mat-radio-group
              class="d-flex flex-column gap-8"
              [(ngModel)]="selectedGender"
              (change)="getGender(selectedGender)"
            >
              <mat-radio-button *ngFor="let g of genderOptions" [value]="g.value">
                {{ g.label }}
              </mat-radio-button>
            </mat-radio-group>

            <button mat-stroked-button class="w-100 m-t-12" (click)="getRestFilter()">
              Restablecer filtros
            </button>
          </div>
        </mat-sidenav>

        <mat-sidenav-content class="fullscreen-content">
          <div class="modal-navbar d-flex align-items-center justify-content-between p-y-12 p-x-16">
            <div class="d-flex align-items-center gap-8 flex-wrap">
              <button
                mat-icon-button
                class="bg-primary text-white"
                (click)="sidenav.toggle()"
                aria-label="Abrir filtros"
              >
                <mat-icon>menu</mat-icon>
              </button>
              <mat-form-field class="hide-hint search-field" appearance="outline">
                <mat-icon matPrefix>search</mat-icon>
                <input
                  matInput
                  placeholder="Buscar producto"
                  [(ngModel)]="searchText"
                  (ngModelChange)="filterCards()"
                />
                <button
                  *ngIf="searchText"
                  matSuffix
                  mat-icon-button
                  (click)="getProductList()"
                  aria-label="Limpiar b�squeda"
                >
                  <mat-icon>close</mat-icon>
                </button>
              </mat-form-field>
            </div>
            <div class="navbar-actions d-flex align-items-center gap-8">
              <button mat-icon-button (click)="openCart()" aria-label="Abrir carrito">
                <mat-icon>shopping_cart</mat-icon>
                <span class="cart-badge" *ngIf="getCartItemCount() as count">{{ count }}</span>
              </button>
            </div>
          </div>

          <div class="row">
            <ng-container *ngIf="loading; else productsGrid">
              <div
                class="col-6 p-x-4 p-sm-0 m-b-24 shop-skeleton-wrapper"
                *ngFor="let s of [1, 2, 3, 4, 5, 6]"
              >
                <div class="skeleton-card">
                  <div class="skeleton-img"></div>
                  <div class="skeleton-footer">
                    <div class="skeleton-bar long"></div>
                    <div class="skeleton-bar short"></div>
                  </div>
                </div>
              </div>
            </ng-container>

            <ng-template #productsGrid>
              <div class="col-6 col-lg-3 p-x-4 p-sm-0" *ngFor="let productcard of filteredCards">
                <mat-card
                  class="cardWithShadow productcard overflow-hidden b-1 cursor-pointer"
                  (click)="getviewDetails(productcard)"
                >
                  <div class="img-wrapper position-relative">
                    <img [src]="productcard.imagePath" alt="imgSrc" class="w-100" mat-card-image />
                  </div>
                  <mat-card-content class="p-10 position-relative" style="padding: 10px !important;">
                    <mat-card-title class="mat-headline-2 f-s-16 m-b-4 product-title text-ellipsis">
                      {{ productcard.product_name }}
                    </mat-card-title>
                    <div class="product-meta-line d-flex align-items-center justify-content-between m-b-8">
                      <div class="price-line d-flex align-items-center">
                        <ng-container *ngIf="productcard.dealPrice && productcard.dealPrice < productcard.base_price; else regularPrice">
                          <span class="price-old f-s-14 f-w-500 m-r-6 text-muted" aria-label="Precio anterior">
                            {{ productcard.base_price | monedaARS }}
                          </span>
                          <h6 class="price-current f-s-16 f-w-600 m-0 text-success" aria-label="Precio con descuento">
                            {{ productcard.dealPrice | monedaARS }}
                          </h6>
                          <span class="discount-badge f-s-12 f-w-600 m-l-6">{{ productcard.discountPercent }}% OFF</span>
                        </ng-container>
                        <ng-template #regularPrice>
                          <h6 class="price-current f-s-16 f-w-600 m-0 text-primary" aria-label="Precio">
                            {{ productcard.base_price | monedaARS }}
                          </h6>
                        </ng-template>
                      </div>
                    </div>

                    <div class="wholesale-lines f-s-12">
                      <div class="line d-flex align-items-center gap-4 m-b-4" *ngIf="productcard.talles">
                        <i-tabler name="ruler" class="icon-14 text-muted"></i-tabler><strong>Talles:</strong>
                        <span class="talles-badge">{{ productcard.talles }}</span>
                      </div>
                      <div class="line d-flex align-items-center gap-4 m-b-4" *ngIf="productcard.tela">
                        <i-tabler name="scissors" class="icon-14 text-muted"></i-tabler><strong>Tela:</strong>
                        {{ productcard.tela }}
                      </div>
                      <div class="line generos-line m-b-4" *ngIf="productcard.generos && productcard.generos.length">
                        <div class="d-flex align-items-center gap-4">
                          <i-tabler name="users" class="icon-14 text-muted"></i-tabler>
                          <strong class="f-w-600">G�neros:</strong>
                        </div>
                        <div class="generos-row d-flex gap-6 m-t-4">
                          <span
                            class="genero-pill"
                            *ngFor="let g of productcard.generos"
                            [title]="g"
                            [attr.aria-label]="'G�nero ' + g"
                          >
                            {{ g }}
                          </span>
                        </div>
                      </div>
                      <div class="line d-flex align-items-center gap-4" *ngIf="productcard.categoria">
                        <i-tabler name="tag" class="icon-14 text-muted"></i-tabler><strong>Categor�a:</strong>
                        <span class="category-chip">{{ productcard.categoria }}</span>
                      </div>
                      <div class="line colors-line m-b-4" *ngIf="productcard.colors && productcard.colors.length">
                        <div class="d-flex align-items-center gap-4">
                          <i-tabler name="palette" class="icon-14 text-muted"></i-tabler>
                          <strong class="f-w-600">Colores:</strong>
                        </div>
                        <div class="color-avatars d-flex flex-wrap gap-6 m-t-4">
                          <div
                            class="color-avatar"
                            *ngFor="let c of productcard.colors"
                            [title]="c.name + ' ' + c.hex"
                            [attr.aria-label]="c.name"
                          >
                            <span class="swatch" [style.background]="c.hex"></span>
                          </div>
                        </div>
                      </div>
                      <div
                        class="line d-flex align-items-center gap-4 m-b-4"
                        *ngIf="(!productcard.colors || !productcard.colors.length) && productcard.color"
                      >
                        <i-tabler name="palette" class="icon-14 text-muted"></i-tabler>
                        <strong>Color:</strong>
                        <span class="color-chip" [title]="productcard.color">
                          <span class="mini-swatch" [style.background]="productcard.color"></span>
                          <span class="c-name">{{ productcard.color }}</span>
                        </span>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </ng-template>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [
    `
      .vendor-products-modal {
        width: 100vw;
        max-width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
      }
      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      }
      .modal-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
      .fullscreen-container {
        flex: 1;
        height: calc(100vh - 56px);
      }
      .modal-navbar {
        background: #f8f9fa;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        gap: 12px;
        flex-wrap: wrap;
      }
      .navbar-actions {
        position: relative;
      }
      .cart-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: #ff4444;
        color: #fff;
        border-radius: 999px;
        padding: 2px 6px;
        font-size: 11px;
        font-weight: 700;
        min-width: 22px;
        text-align: center;
      }
      .search-field {
        min-width: 260px;
        width: 100%;
      }
      .filter-sidenav {
        max-width: 320px;
      }
      .section-title {
        margin: 0 0 8px;
        font-weight: 600;
        font-size: 14px;
      }
      .fullscreen-content {
        padding: 8px 16px 24px;
        height: calc(100vh - 56px);
        overflow: auto;
      }
      .productcard {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .productcard:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      }
      .product-title {
        font-weight: 600;
      }
      .price-old {
        text-decoration: line-through;
      }
      .skeleton-card {
        background: #f2f2f2;
        border-radius: 12px;
        overflow: hidden;
      }
      .skeleton-img {
        height: 180px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
        background-size: 400% 100%;
        animation: shimmer 1.4s ease infinite;
      }
      .skeleton-footer {
        padding: 12px;
      }
      .skeleton-bar {
        height: 12px;
        border-radius: 6px;
        background: #e0e0e0;
        margin-bottom: 8px;
      }
      .skeleton-bar.short {
        width: 60%;
      }
      .skeleton-bar.long {
        width: 90%;
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
      .color-avatar {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
      }
      .color-avatar .swatch {
        width: 100%;
        height: 100%;
        display: block;
        border-radius: 50%;
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
      @keyframes shimmer {
        0% {
          background-position: 100% 0;
        }
        100% {
          background-position: 0 0;
        }
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

  categories: BackendCategory[] = [];
  selectedCategories: string[] = [];

  notes: Section[] = [
    { name: 'm�s nuevo', icon: 'calendar' },
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
    { label: 'Niños', value: 'niños' },
  ];

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
      dealPrice: p.base_price,
      imagePath:
        p.images && p.images.length > 0
          ? p.images[0]
          : 'assets/images/products/no-image.png',
      images: p.images || [],
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

  onCategorySelectionChange(event: MatSelectionListChange) {
    const selectedValues = event.source.selectedOptions.selected.map(
      (option) => option.value
    );
    this.onCategoriesChange(selectedValues);
  }

  onCategoriesChange(values: string[]) {
    this.selectedCategories = values || [];
    this.resetAndReloadProducts();
  }

  getSorted(name: string): void {
    this.selectedSortBy = name;
    const nameLower = name.toLowerCase();
    switch (nameLower) {
      case 'm�s nuevo':
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
    const normalized = this.normalizeGender(gender);
    if (!normalized || normalized === 'todos') {
      this.filteredCards = [...this.allProducts];
      return;
    }

    this.filteredCards = this.allProducts.filter((card) => {
      if (Array.isArray(card.generos) && card.generos.length) {
        return card.generos.some(
          (g: any) => this.normalizeGender(g) === normalized
        );
      }

      if (card.gender) {
        return this.normalizeGender(card.gender) === normalized;
      }

      return false;
    });
  }

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
    this.dialog.open(ProductDetailsComponent, {
      data: {
        product: product,
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
    this.dialog.open(CartDialogComponent, {
      data: { mode: 'general', vendor: this.data.vendor },
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
    return this.cartService.getTotalItems();
  }

  checkoutViaWhatsApp() {
    const cart = this.cartService.getCart();
    if (!cart.items.length) {
      alert('No hay productos en el carrito');
      return;
    }

    let message = `Hola, quiero comprar los siguientes productos:\n\n`;

    cart.items.forEach((item: any) => {
      const price = item.product.dealPrice || item.product.base_price;
      const colorPart = item.colorName ? ` - color: ${item.colorName} ` : '';
      const sizesPart =
        item.sizes && item.sizes.length
          ? ` - talles: [${item.sizes.join(', ')}]`
          : '';
      const vendorPart = item.vendorName ? ` (Vendedor: ${item.vendorName})` : '';
      message += ` ${
        item.product.product_name
      }${vendorPart}${colorPart}${sizesPart} - Cantidad: ${item.quantity} - Precio: $${
        price * item.quantity
      }\n`;
    });

    message += `\nTotal: $${cart.total}\n\n`;

    if (this.data.vendor.socials?.whatsapp) {
      message += `WhatsApp: ${this.data.vendor.socials.whatsapp}\n`;
    }
    if (this.data.vendor.socials?.web) {
      message += `Web: ${this.data.vendor.socials.web}\n`;
    }

    const encodedMessage = encodeURIComponent(message);

    const rawNumber: string | undefined = this.data.vendor.socials?.whatsapp;
    const cleaned = rawNumber ? rawNumber.replace(/[^0-9]/g, '') : '';
    const sanitizedNumber = cleaned.startsWith('54')
      ? cleaned
      : cleaned
      ? '54' + cleaned
      : '';
    const whatsappUrl = sanitizedNumber
      ? `https://wa.me/${sanitizedNumber}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;
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

  private normalizeGender(value: any): string {
    const raw = (value || '').toString().trim().toLowerCase();
    if (!raw) return '';
    // Remove accents to make comparisons tolerant to variations.
    const unaccented = raw.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    if (unaccented === 'ninos' || unaccented === 'nino') return 'ninos';
    if (unaccented === 'ninas' || unaccented === 'nina') return 'ninas';
    return unaccented;
  }
}
