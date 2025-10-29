import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewChecked, ViewChildren, QueryList, inject } from '@angular/core';
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
import { CarouselModule, OwlOptions, CarouselComponent } from 'ngx-owl-carousel-o';

interface Slide {
  id: string;
  imgUrl: string;
  altText: string;
}

@Component({
  selector: 'app-shop',
  imports: [
    MaterialModule,
    IconModule,
    CommonModule,
    FormsModule,
    CustomizerComponent,
    CarouselModule,
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent implements OnInit, AfterViewChecked {
  @ViewChildren(CarouselComponent) carousels!: QueryList<CarouselComponent>;
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private vendorService = inject(VendorService);
  private cartService = inject(CartService);
  searchText: string = '';
  vendors: Vendor[] = [];
  filteredVendors: Vendor[] = [];
  selectedCategories: string[] = [];
  allCategories: string[] = [];
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 500,
    items: 1,
    autoHeight: true,
    autoWidth: false,
    autoplay: true,
    autoplayTimeout: 4000,
    autoplayHoverPause: true,
    responsive: { 0: { items: 1 }, 400: { items: 1 }, 740: { items: 1 }, 940: { items: 1 } },
    nav: false,
  };
  ngOnInit(): void {
    this.loadVendors();
  }

  ngAfterViewChecked(): void {
    // Forzar actualización de los carruseles con un pequeño delay
    setTimeout(() => {
      if (this.carousels) {
        this.carousels.forEach(carousel => {
          if (carousel) {
            // Trigger resize event to force carousel recalculation
            window.dispatchEvent(new Event('resize'));
          }
        });
      }
    }, 100);
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

  getVendorSlides(vendor: Vendor): Slide[] {
    if (vendor.images && vendor.images.length > 0) {
      return vendor.images.map((imgUrl, index) => ({
        id: `${vendor.id}-slide-${index}`,
        imgUrl,
        altText: `Imagen ${index + 1} de ${vendor.name}`
      }));
    } else if (vendor.logoPath) {
      return [{
        id: `${vendor.id}-logo`,
        imgUrl: vendor.logoPath,
        altText: `Logo de ${vendor.name}`
      }];
    } else {
      return [{
        id: `${vendor.id}-placeholder`,
        imgUrl: 'assets/images/placeholder.jpg',
        altText: `Imagen de ${vendor.name}`
      }];
    }
  }

  onCarouselInitialized(): void {
    // Trigger resize event to ensure carousel displays correctly
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
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
