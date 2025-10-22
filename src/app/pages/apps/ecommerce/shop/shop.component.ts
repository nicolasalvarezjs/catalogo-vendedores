import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconModule } from 'src/app/icon/icon.module';
import { MaterialModule } from 'src/app/material.module';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProductDetailsComponent } from '../product-details/product-details.component';
import { ProductService } from 'src/app/services/apps/product/product.service';
import { Element } from '../ecommerceData';
import {
  MockProductApiService,
  ProductListItem,
} from 'src/app/services/apps/product/mock-product-api.service';

export interface Section {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-shop',
  imports: [
    MaterialModule,
    IconModule,
    CommonModule,
    FormsModule,
    NgScrollbarModule,
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent implements OnInit, AfterViewInit {
  @ViewChild('infiniteAnchor', { static: false }) infiniteAnchor!: ElementRef;
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  private productService = inject(ProductService);
  // Sidebar responsive logic removido: siempre modo overlay manejado por botón.
  durationInSeconds = 1;
  searchText: string = '';
  allProducts: ProductListItem[] = [];
  filteredCards: ProductListItem[] = [];
  page = 1;
  pageSize = 10; // ahora 10 elementos por página
  loading = false;
  hasMore = true;
  private intersectionObserver?: IntersectionObserver;
  folders: Section[] = [
    { key: 'all', label: 'Todos', icon: 'users' },
    { key: 'fashion', label: 'Moda', icon: 'hanger' },
    { key: 'books', label: 'Libros', icon: 'book' },
    { key: 'toys', label: 'Juguetes', icon: 'mood-smile' },
    { key: 'electronics', label: 'Electrónica', icon: 'device-laptop' },
  ];
  selectedCategory: string = this.folders[0].key;
  notes: Section[] = [
    { key: 'newest', label: 'Más nuevo', icon: 'calendar' },
    {
      key: 'price_high_low',
      label: 'Precio: Alto-Bajo',
      icon: 'sort-descending',
    },
    {
      key: 'price_low_high',
      label: 'Precio: Bajo-Alto',
      icon: 'sort-ascending',
    },
    { key: 'discounted', label: 'Con descuento', icon: 'percentage' },
  ];
  selectedSortBy: string = this.notes[0].key;
  selectedColor: string | null = null;
  // isMobileView removido (ya no se necesita para mostrar el botón de filtros).
  selectedGender: string = 'all';
  genderOptions = [
    { label: 'Todos', value: 'all' },
    { label: 'Hombre', value: 'men' },
    { label: 'Mujer', value: 'women' },
    { label: 'Niños', value: 'kids' },
  ];
  selectedPrice: string = 'all';
  priceOptions = [
    { label: 'Todos', value: 'all' },
    { label: '0 – 50', value: '0-50' },
    { label: '50–100', value: '50-100' },
    { label: '100–200', value: '100-200' },
    { label: 'Más de 200', value: 'over-200' },
  ];
  // Ancho deseado del panel de filtros en modo móvil (px)
  mobileSidenavWidth = 300;
  constructor(private api: MockProductApiService) {}
  ngOnInit(): void {
    // Restaurar estado de filtros/búsqueda
    const savedSearch = sessionStorage.getItem('shopSearch');
    const savedCategory = sessionStorage.getItem('shopCategory');
    const savedSort = sessionStorage.getItem('shopSort');
    const savedGender = sessionStorage.getItem('shopGender');
    const savedPrice = sessionStorage.getItem('shopPrice');
    if (savedSearch) this.searchText = savedSearch;
    if (savedCategory) this.selectedCategory = savedCategory;
    if (savedSort) this.selectedSortBy = savedSort;
    if (savedGender) this.selectedGender = savedGender;
    if (savedPrice) this.selectedPrice = savedPrice;
    this.loadPage();
  }

  private loadPage() {
    if (!this.hasMore || this.loading) return;
    this.loading = true;
    this.api.getProductsPage(this.page, this.pageSize).subscribe((res) => {
      this.allProducts = [...this.allProducts, ...res.items];
      this.filteredCards = [...this.allProducts];
      this.hasMore = res.hasMore;
      this.loading = false;
      this.page++;
    });
  }
  filterCards() {
    const text = this.searchText.toLowerCase();
    this.filteredCards = this.allProducts.filter(
      (card) =>
        card.product_name.toLowerCase().includes(text) ||
        card.categories.join(' ').toLowerCase().includes(text)
    );
    sessionStorage.setItem('shopSearch', this.searchText);
    // No se recarga página; se filtra sobre las ya cargadas
  }
  getCategory(key: string): void {
    this.selectedCategory = key;
    if (key === 'all') {
      this.filteredCards = [...this.allProducts];
    } else {
      this.filteredCards = this.allProducts.filter((card) =>
        card.categories.some((cat) => cat.toLowerCase() === key.toLowerCase())
      );
    }
    sessionStorage.setItem('shopCategory', this.selectedCategory);
  }
  getSorted(key: string): void {
    this.selectedSortBy = key;
    switch (key) {
      case 'newest':
        this.filteredCards = [...this.allProducts].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case 'price_high_low':
        this.filteredCards = [...this.allProducts].sort(
          (a, b) => +b.base_price - +a.base_price
        );
        break;
      case 'price_low_high':
        this.filteredCards = [...this.allProducts].sort(
          (a, b) => +a.base_price - +b.base_price
        );
        break;
      case 'discounted':
        this.filteredCards = [...this.allProducts].sort((a, b) => {
          const discountA = +a.dealPrice - +a.base_price;
          const discountB = +b.dealPrice - +b.base_price;
          return discountB - discountA;
        });
        break;
      default:
        this.filteredCards = [...this.allProducts];
    }
    sessionStorage.setItem('shopSort', this.selectedSortBy);
  }
  getGender(gender: string): void {
    if (gender.toLowerCase() === 'all') {
      this.filteredCards = [...this.allProducts];
    } else {
      this.filteredCards = this.allProducts.filter(
        (card) => card.gender === gender.toLowerCase()
      );
    }
    this.selectedGender = gender;
    sessionStorage.setItem('shopGender', this.selectedGender);
  }
  getPricing(base_priceRange: string): void {
    this.selectedPrice = base_priceRange;
    switch (base_priceRange) {
      case '0-50':
        this.filteredCards = this.allProducts.filter(
          (card) => +card.base_price >= 0 && +card.base_price <= 50
        );
        break;
      case '50-100':
        this.filteredCards = this.allProducts.filter(
          (card) => +card.base_price > 50 && +card.base_price <= 100
        );
        break;
      case '100-200':
        this.filteredCards = this.allProducts.filter(
          (card) => +card.base_price > 100 && +card.base_price <= 200
        );
        break;
      case 'over-200':
        this.filteredCards = this.allProducts.filter(
          (card) => +card.base_price > 200
        );
        break;
      case 'all':
      default:
        this.filteredCards = [...this.allProducts];
        break;
    }
    sessionStorage.setItem('shopPrice', this.selectedPrice);
  }
  getRestFilter() {
    this.selectedCategory = this.folders[0].key;
    this.selectedSortBy = this.notes[0].key;
    this.filteredCards = [...this.allProducts];
    this.searchText = '';
    this.selectedGender = 'all';
    this.selectedPrice = 'all';
    sessionStorage.removeItem('shopSearch');
    sessionStorage.removeItem('shopCategory');
    sessionStorage.removeItem('shopSort');
    sessionStorage.removeItem('shopGender');
    sessionStorage.removeItem('shopPrice');
  }
  getProductList() {
    this.searchText = '';
    this.filteredCards = [...this.allProducts];
  }
  closeFilters(sidenav: any) {
    sidenav.close();
  }
  // Adjusted base path from 'apps/product' to 'product'
  // Lógica de eliminación removida para vista de clientes.
  getviewDetails(productcardDetails: ProductListItem) {
    this.dialog.open(ProductDetailsComponent, {
      data: { productId: productcardDetails.id },
      panelClass: ['product-details-dialog'],
      maxWidth: '100vw',
      width: '100vw',
      height: '100vh',
      autoFocus: false,
      restoreFocus: false,
      disableClose: false,
    });
  }
  toggleColor(color: string): void {
    this.selectedColor = this.selectedColor === color ? null : color;
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

  // Inicializar observer para infinite scroll (llamar en AfterViewInit si fuera necesario)
  setupInfiniteScroll(anchor: HTMLElement) {
    if (this.intersectionObserver) this.intersectionObserver.disconnect();
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadPage();
          }
        });
      },
      { root: null, rootMargin: '0px', threshold: 0.1 }
    );
    this.intersectionObserver.observe(anchor);
  }

  ngAfterViewInit(): void {
    if (this.infiniteAnchor) {
      this.setupInfiniteScroll(this.infiniteAnchor.nativeElement);
    }
  }

  // Salvamos la posición si el usuario refresca la página
  @HostListener('window:beforeunload')
  saveScrollPosition() {
    // lógica eliminada
  }
}
