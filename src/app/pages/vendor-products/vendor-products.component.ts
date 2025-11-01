import { Component, Input, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCatalogService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-vendor-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 *ngIf="vendorName">Productos de {{ vendorName }}</h2>
    <div class="products-grid" *ngIf="products.length">
      <div class="product-card" *ngFor="let p of products">
        <h4>{{ p.titulo }}</h4>
        <p *ngIf="p.description">{{ p.description }}</p>
        <span class="price" *ngIf="p.precio">$ {{ p.precio }}</span>
      </div>
    </div>
    <div class="loading" *ngIf="loading">Cargando...</div>
    <div class="end" *ngIf="!loading && reachedEnd">No hay más productos.</div>
  `,
  styles: [
    `
      .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1rem;
      }
      .product-card {
        border: 1px solid #ddd;
        padding: 0.75rem;
        border-radius: 8px;
        background: #fff;
      }
      .product-card h4 {
        margin: 0 0 0.5rem;
        font-size: 1rem;
      }
      .price {
        font-weight: 600;
        color: #e65100;
      }
      .loading,
      .end {
        text-align: center;
        padding: 1rem;
      }
    `,
  ],
})
export class VendorProductsComponent implements OnInit {
  @Input() vendorId?: string;
  @Input() vendorName?: string;

  products: Product[] = [];
  page = 1;
  limit = 12;
  totalPages = 0;
  loading = false;
  reachedEnd = false;

  constructor(private productService: ProductCatalogService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnChanges(): void {
    // Reset when vendor changes
    this.resetAndLoad();
  }

  resetAndLoad() {
    this.products = [];
    this.page = 1;
    this.totalPages = 0;
    this.reachedEnd = false;
    this.loadProducts();
  }

  loadProducts() {
    if (!this.vendorId || this.loading || this.reachedEnd) return;
    this.loading = true;
    this.productService
      .getProducts({
        page: this.page,
        limit: this.limit,
        vendorId: this.vendorId,
      })
      .subscribe({
        next: (res) => {
          this.products.push(...res.products);
          this.totalPages = res.totalPages;
          if (res.page >= res.totalPages) {
            this.reachedEnd = true;
          } else {
            this.page += 1;
          }
        },
        error: (err) => {
          console.error('Error loading products', err);
        },
        complete: () => (this.loading = false),
      });
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    const threshold = 300;
    const position = window.innerHeight + window.scrollY;
    const height = document.body.offsetHeight;
    if (height - position < threshold) {
      this.loadProducts();
    }
  }
}
