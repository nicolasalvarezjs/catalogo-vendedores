// ...existing code...
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ProductApiService } from 'src/app/services/api/product-api.service';
import { VendorApiService } from 'src/app/services/api/vendor-api.service';
import type { BackendProduct } from 'src/app/services/api/product-api.service';
import type { BackendVendor } from 'src/app/services/api/vendor-api.service';

@Component({
  selector: 'app-home-new',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './home-new.component.html',
  styleUrls: ['./home-new.component.scss'],
})
export class HomeNewComponent implements OnInit {
  featuredProducts: BackendProduct[] = [];
  topVendors: BackendVendor[] = [];

  constructor(
    private productApi: ProductApiService,
    private vendorApi: VendorApiService
  ) {}

  ngOnInit(): void {
    // Productos destacados
    this.productApi.getProducts({ page: 1, limit: 12 }).subscribe({
      next: (res) => {
        this.featuredProducts = res.products || [];
      },
      error: (err) => {
        this.featuredProducts = [];
        console.error('Error cargando productos', err);
      },
    });

    // Vendedores
    this.vendorApi.getVendors(1, 12).subscribe({
      next: (res) => {
        this.topVendors = res.vendors || [];
      },
      error: (err) => {
        this.topVendors = [];
        console.error('Error cargando vendedores', err);
      },
    });
  }
  getVendorName(vendorId: string | { _id?: string; name?: string }): string {
    if (typeof vendorId === 'object' && vendorId !== null) {
      return vendorId.name || vendorId._id || '';
    }
    return vendorId || '';
  }
}
