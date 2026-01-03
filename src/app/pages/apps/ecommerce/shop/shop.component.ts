import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { IconModule } from 'src/app/icon/icon.module';
import { MaterialModule } from 'src/app/material.module';
import { Router, ActivatedRoute } from '@angular/router';
import { CategoriesFilterDialogComponent, CategoriesFilterData } from './categories-filter-dialog.component';
import { CartDialogComponent } from './cart-dialog.component';
import { CartService } from 'src/app/services/apps/cart/cart.service';
import { ProductApiService, BackendProduct } from 'src/app/services/api/product-api.service';
import { CategoryApiService, BackendCategory } from 'src/app/services/api/category-api.service';
import { ShopStateService } from './shop-state.service';
import { ProductDetailsComponent } from '../product-details/product-details.component';

@Component({
  selector: 'app-shop',
  imports: [
    MaterialModule,
    IconModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent implements OnInit, AfterViewInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private productApi = inject(ProductApiService);
  private categoryApi = inject(CategoryApiService);
  private cartService = inject(CartService);
  private shopState = inject(ShopStateService);

  private productDialogRef: any = null;

  searchText: string = '';
  products: any[] = [];
  filteredProducts: any[] = [];
  categories: BackendCategory[] = [];
  selectedCategories: string[] = [];

  backendPage = 1;
  backendLimit = 12;
  backendTotalPages = 0;
  loadingBackend = false;
  allBackendLoaded = false;

  // Filtro de género
  selectedGender: string = 'todos';
  genderOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Mujer', value: 'mujer' },
    { label: 'Hombre', value: 'hombre' },
    { label: 'Niños', value: 'niños' },
  ];

  ngOnInit(): void {
    this.loadCategories();
    const cached = this.shopState.getState();
    if (cached) {
      this.restoreFromState(cached);
    } else {
      this.loadProducts();
    }
    this.route.paramMap.subscribe((params) => {
      const pid = params.get('id');
      this.handleProductParam(pid);
    });
    window.addEventListener('scroll', this.onWindowScroll, { passive: true });
  }

  ngAfterViewInit(): void {
    const cached = this.shopState.getState();
    if (cached) {
      setTimeout(() => window.scrollTo({ top: cached.scrollY ?? 0 }), 0);
    }
  }

  ngOnDestroy(): void {
    this.persistState();
    window.removeEventListener('scroll', this.onWindowScroll);
  }

  private onWindowScroll = () => {
    if (this.loadingBackend || this.allBackendLoaded) return;
    const threshold = 400;
    const position = window.innerHeight + window.scrollY;
    const height = document.body.offsetHeight;
    if (height - position < threshold) {
      this.loadProducts();
    }
  };

  private computeStickyThreshold = () => {};

  private updateStickyState() {}

  private mapBackendProduct(p: BackendProduct) {
    const vendorObj = typeof p.vendorId === 'object' ? p.vendorId : undefined;
    const vendorId = typeof p.vendorId === 'string' ? p.vendorId : vendorObj?._id;
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
      vendorId,
      colors: p.colors,
      color: p.color,
      salesType: p.salesType,
      minPurchase: p.minPurchase,
      vendorMeta: vendorObj
        ? {
            id: vendorId,
            name: vendorObj.name,
            logoPath: (vendorObj as any).logoPath,
            doesShipping: (vendorObj as any).doesShipping,
            shippingDetail: (vendorObj as any).shippingDetail,
            productDescription: (vendorObj as any).productDescription,
            socials: (vendorObj as any).socials,
          }
        : undefined,
    };
  }

  loadProducts() {
    if (this.loadingBackend || this.allBackendLoaded) return;
    this.loadingBackend = true;
    this.productApi
      .getProducts({
        page: this.backendPage,
        limit: this.backendLimit,
        categories: this.selectedCategories.length
          ? this.selectedCategories
          : undefined,
      })
      .subscribe({
        next: (res) => {
          const mapped = res.products.map((p) => this.mapBackendProduct(p));
          this.products.push(...mapped);
          this.filteredProducts = [...this.products];
          this.applyFilters();
          this.backendTotalPages = res.totalPages;
          if (res.page >= res.totalPages) {
            this.allBackendLoaded = true;
          } else {
            this.backendPage += 1;
          }
        },
        error: (err) => {
          console.error('Error cargando productos backend', err);
        },
        complete: () => (this.loadingBackend = false),
      });
  }

  private loadCategories() {
    this.categoryApi.getCategories().subscribe({
      next: (cats) => (this.categories = cats || []),
      error: () => (this.categories = []),
    });
  }

  filterCards() {
    this.applyFilters();
  }

  clearSearch() {
    this.searchText = '';
    this.applyFilters();
  }

  clearCategoryFilters() {
    this.selectedCategories = [];
    this.applyFilters();
  }

  onCategoriesChange() {
    this.resetAndReload();
  }

  getGender(gender: string) {
    this.selectedGender = gender;
    this.applyFilters();
  }

  private applyFilters() {
    const text = this.searchText.toLowerCase();
    const normalizedGender = this.normalizeGender(this.selectedGender);

    let result = this.products.filter((p) => {
      const matchesText =
        p.product_name?.toLowerCase().includes(text) ||
        p.categoria?.toLowerCase().includes(text);

      const matchesCat =
        this.selectedCategories.length === 0 ||
        (p.categoria && this.selectedCategories.includes(p.categoria));

      const matchesGender =
        normalizedGender === 'todos' ||
        (Array.isArray(p.generos) &&
          p.generos.some(
            (g: string) => this.normalizeGender(g) === normalizedGender
          ));

      return matchesText && matchesCat && matchesGender;
    });

    // Mantener un orden consistente (más nuevos primero)
    result = result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    this.filteredProducts = result;
  }

  resetAndReload() {
    this.products = [];
    this.filteredProducts = [];
    this.backendPage = 1;
    this.backendTotalPages = 0;
    this.allBackendLoaded = false;
    this.loadProducts();
  }

  private persistState() {
    this.shopState.setState({
      products: this.products,
      filteredProducts: this.filteredProducts,
      categories: this.categories,
      selectedCategories: this.selectedCategories,
      selectedGender: this.selectedGender,
      searchText: this.searchText,
      backendPage: this.backendPage,
      backendTotalPages: this.backendTotalPages,
      allBackendLoaded: this.allBackendLoaded,
      loadingBackend: this.loadingBackend,
      scrollY: window.scrollY,
    });
  }

  private restoreFromState(state: any) {
    this.products = state.products || [];
    this.filteredProducts = state.filteredProducts || [];
    this.categories = state.categories || [];
    this.selectedCategories = state.selectedCategories || [];
    this.selectedGender = state.selectedGender || 'todos';
    this.searchText = state.searchText || '';
    this.backendPage = state.backendPage || 1;
    this.backendTotalPages = state.backendTotalPages || 0;
    this.allBackendLoaded = !!state.allBackendLoaded;
    this.loadingBackend = false;
  }

  private normalizeGender(value: any): string {
    const raw = (value || '').toString().trim().toLowerCase();
    if (!raw) return '';
    const unaccented = raw.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    if (unaccented === 'ninos' || unaccented === 'nino') return 'niños';
    if (unaccented === 'hombres' || unaccented === 'hombre') return 'hombre';
    if (unaccented === 'mujeres' || unaccented === 'mujer') return 'mujer';
    return raw;
  }

  getTotalCartItems(): number {
    return this.cartService.getTotalItems();
  }

  openGeneralCart(): void {
    this.dialog.open(CartDialogComponent, {
      data: { mode: 'general' },
      panelClass: ['cart-dialog-fullscreen'],
      maxWidth: '100vw',
      width: '100vw',
      height: '100vh',
      autoFocus: false,
      restoreFocus: false,
      disableClose: false,
    });
  }

  openCategoriesFilter(): void {
    const dialogData: CategoriesFilterData = {
      allCategories: this.categories.map((c) => c.name),
      selectedCategories: [...this.selectedCategories],
    };

    const dialogRef = this.dialog.open(CategoriesFilterDialogComponent, {
      data: dialogData,
      width: '360px',
      maxWidth: '90vw',
      height: '100vh',
      position: { top: '0', right: '0' },
      autoFocus: false,
      panelClass: ['filter-sidenav-dialog'],
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.selectedCategories = dialogData.selectedCategories;
        this.resetAndReload();
      }
    });
  }

  openProductDetails(product: any) {
    this.router.navigate(['/product', product.id || product._id]);
  }

  navigateToEmpresa() {
    this.router.navigate(['/empresa']);
  }

  private handleProductParam(id: string | null) {
    if (id && !this.productDialogRef) {
      this.productApi.getProductById(id).subscribe({
        next: (p) => {
          const mapped = this.mapBackendProduct(p);
          const vendor = mapped.vendorMeta || (mapped.vendorId ? { id: mapped.vendorId, name: 'Vendedor', logoPath: null } : undefined);
          this.productDialogRef = this.dialog.open(ProductDetailsComponent, {
            data: { product: mapped, vendor },
            panelClass: ['product-details-dialog'],
            maxWidth: '100vw',
            width: '100vw',
            height: '100vh',
            autoFocus: false,
            restoreFocus: false,
            disableClose: false,
          });
          this.productDialogRef.afterClosed().subscribe(() => {
            this.productDialogRef = null;
            const current = this.route.snapshot.paramMap.get('id');
            if (current) {
              this.router.navigate(['/']);
            }
          });
        },
        error: (err) => console.error('Error cargando producto', err),
      });
    }

    if (!id && this.productDialogRef) {
      this.productDialogRef.close();
      this.productDialogRef = null;
    }
  }
}
