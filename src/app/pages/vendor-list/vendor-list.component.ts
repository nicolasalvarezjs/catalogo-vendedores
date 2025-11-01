import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorService } from '../../services/vendor.service';
import { Vendor } from '../../models/vendor.model';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="vendor-list" *ngIf="vendors.length">
      <div
        class="vendor-card"
        *ngFor="let v of vendors"
        (click)="selectVendor(v)"
      >
        <img *ngIf="v.logoPath" [src]="v.logoPath" alt="{{ v.name }}" />
        <h3>{{ v.name }}</h3>
        <p *ngIf="v.description">{{ v.description }}</p>
        <small>Rating: {{ v.rating || 0 }}</small>
      </div>
    </div>
    <div class="loading" *ngIf="loading">Cargando...</div>
    <div class="end" *ngIf="!loading && reachedEnd">No hay más vendedores.</div>
  `,
  styles: [
    `
      .vendor-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1rem;
      }
      .vendor-card {
        border: 1px solid #ddd;
        padding: 1rem;
        cursor: pointer;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      .vendor-card:hover {
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      }
      .vendor-card img {
        max-width: 100%;
        height: 60px;
        object-fit: contain;
        margin-bottom: 0.5rem;
      }
      .loading,
      .end {
        text-align: center;
        padding: 1rem;
      }
    `,
  ],
})
export class VendorListComponent implements OnInit {
  vendors: Vendor[] = [];
  page = 1;
  limit = 10;
  totalPages?: number;
  loading = false;
  reachedEnd = false;

  constructor(private vendorService: VendorService) {}

  ngOnInit(): void {
    this.loadVendors();
  }

  loadVendors(): void {
    if (this.loading || this.reachedEnd) return;
    this.loading = true;
    this.vendorService.getVendors(this.page, this.limit).subscribe({
      next: (res) => {
        this.vendors.push(...res.vendors);
        this.totalPages = res.totalPages;
        if (!res.page || !res.totalPages) {
          // No paginated response -> reached end
          this.reachedEnd = true;
        } else if (res.page >= res.totalPages) {
          this.reachedEnd = true;
        } else {
          this.page += 1;
        }
      },
      error: (err) => {
        console.error('Error loading vendors', err);
      },
      complete: () => (this.loading = false),
    });
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    const threshold = 300; // px from bottom
    const position = window.innerHeight + window.scrollY;
    const height = document.body.offsetHeight;
    if (height - position < threshold) {
      this.loadVendors();
    }
  }

  selectVendor(vendor: Vendor) {
    // TODO: navigate to vendor detail route
    console.log('Selected vendor', vendor._id);
  }
}
