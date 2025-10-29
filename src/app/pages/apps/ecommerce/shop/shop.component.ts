import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconModule } from 'src/app/icon/icon.module';
import { MaterialModule } from 'src/app/material.module';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { VendorService, Vendor } from 'src/app/services/apps/vendor/vendor.service';
import { VendorProductsDialogComponent } from './vendor-products-dialog.component';
import { CartDialogComponent } from './cart-dialog.component';
import { CartService } from 'src/app/services/apps/cart/cart.service';
import { CustomizerComponent } from 'src/app/shared/components/customizer/customizer.component';
import { CategoriesFilterDialogComponent, CategoriesFilterData } from './categories-filter-dialog.component';

@Component({
  selector: 'app-shop',
  imports: [
    MaterialModule,
    IconModule,
    CommonModule,
    FormsModule,
    CustomizerComponent,
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent implements OnInit {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private vendorService = inject(VendorService);
  private cartService = inject(CartService);
  searchText: string = '';
  vendors: Vendor[] = [];
  filteredVendors: Vendor[] = [];
  selectedCategories: string[] = [];
  allCategories: string[] = [];
  ngOnInit(): void {
    this.loadVendors();
  }

  private loadVendors() {
    this.vendors = this.vendorService.getVendors();
    this.filteredVendors = [...this.vendors];
    
    // Extraer todas las categorías únicas
    const categorySet = new Set<string>();
    this.vendors.forEach(vendor => {
      if (vendor.categories) {
        vendor.categories.forEach(category => categorySet.add(category));
      }
    });
    this.allCategories = Array.from(categorySet).sort();
    
    console.log('Vendors loaded:', this.vendors);
    console.log('Categories:', this.allCategories);
  }

  selectVendor(vendor: Vendor) {
    this.dialog.open(VendorProductsDialogComponent, {
      data: { vendor },
      panelClass: ['product-details-dialog'],
      maxWidth: '100vw',
      width: '100vw',
      height: '100vh',
      autoFocus: false,
      restoreFocus: false,
      disableClose: false,
    });
  }
  filterCards() {
    const text = this.searchText.toLowerCase();
    
    this.filteredVendors = this.vendors.filter(vendor => {
      // Filtro por texto
      const matchesText = vendor.name.toLowerCase().includes(text) ||
        (vendor.socials?.web && vendor.socials.web.toLowerCase().includes(text)) ||
        (vendor.socials?.facebook && vendor.socials.facebook.toLowerCase().includes(text));
      
      // Filtro por categorías
      const matchesCategories = this.selectedCategories.length === 0 || 
        (vendor.categories && this.selectedCategories.some(cat => vendor.categories!.includes(cat)));
      
      return matchesText && matchesCategories;
    });
  }

  onCategoriesChange() {
    this.filterCards();
  }

  clearCategoryFilters() {
    this.selectedCategories = [];
    this.filterCards();
  }

  clearSearch() {
    this.searchText = '';
    this.filterCards();
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
      allCategories: this.allCategories,
      selectedCategories: [...this.selectedCategories]
    };

    const dialogRef = this.dialog.open(CategoriesFilterDialogComponent, {
      data: dialogData,
      width: '400px',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.selectedCategories = dialogData.selectedCategories;
        this.filterCards();
      }
    });
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
}
