import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  ViewChild,
  Inject,
  Optional,
} from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { IconModule } from 'src/app/icon/icon.module';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductService } from 'src/app/services/apps/product/product.service';
import {
  productcards,
  PRODUCT_DATA,
  VENDORS,
  Vendor,
  Element,
} from '../ecommerceData';
import {
  MockProductApiService,
  ProductDetail,
} from 'src/app/services/apps/product/mock-product-api.service';

interface Slide {
  id: string;
  imgUrl: string;
  altText: string;
  title?: string;
}

@Component({
  selector: 'app-product-details',
  imports: [MaterialModule, CarouselModule, IconModule, CommonModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements AfterViewInit {
  @ViewChild('carouselContainer', { static: false })
  private productService = inject(ProductService);
  carouselContainer!: ElementRef;
  product: ProductDetail | null = null;
  loading: boolean = true; // spinner inicial
  isSelected = false;
  quantity: number = 1;
  toggleValue: any = null;
  selectedTabIndex = 0;
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 500,
    navText: ['‹', '›'],
    items: 1,
    autoHeight: true,
    responsive: {
      0: { items: 1 },
      400: { items: 1 },
      740: { items: 1 },
      940: { items: 1 },
    },
    nav: true,
  };
  slides: Slide[] = [
    {
      id: 'slide-1',
      imgUrl: 'assets/images/products/s1.jpg',
      altText: 'Imagen 1',
      title: 'Vista 1',
    },
    {
      id: 'slide-2',
      imgUrl: 'assets/images/products/s2.jpg',
      altText: 'Imagen 2',
      title: 'Vista 2',
    },
    {
      id: 'slide-3',
      imgUrl: 'assets/images/products/s3.jpg',
      altText: 'Imagen 3',
      title: 'Vista 3',
    },
    {
      id: 'slide-4',
      imgUrl: 'assets/images/products/s4.jpg',
      altText: 'Imagen 4',
      title: 'Vista 4',
    },
  ];
  productcards = productcards; // se usará ahora como productos del vendedor
  vendor: Vendor | undefined;
  vendorProducts: Element[] = [];
  // TODO(Revisar futuro): distribución de ratings para pestaña de reseñas
  // ratings = [ { label: 1, value: 30, count: 485 }, { label: 2, value: 20, count: 215 }, { label: 3, value: 10, count: 110 }, { label: 4, value: 60, count: 620 }, { label: 5, value: 15, count: 160 } ];

  getWhatsappLink(num: string): string {
    // Sanitiza cualquier carácter no numérico
    const sanitized = num.replace(/[^0-9]/g, '');
    return `https://wa.me/${sanitized}`;
  }
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: MockProductApiService,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    private dialogData: { productId?: number } | null,
    @Optional() private dialogRef?: MatDialogRef<ProductDetailsComponent>
  ) {
    // Si el componente se usa como página normal (no modal), seguimos tomando el id de la ruta
    if (!this.dialogData) {
      this.route.paramMap.subscribe((params) => {
        const idParam = params.get('id');
        const id = idParam ? +idParam : null;
        if (id == null) {
          console.error('Product id not present in URL');
          this.loading = false;
          return;
        }
        this.loadProduct(id);
      });
    } else {
      // Modal: recibir id vía data
      if (this.dialogData.productId !== undefined) {
        this.loadProduct(this.dialogData.productId);
      } else {
        console.error('No se pasó productId al diálogo');
        this.loading = false;
      }
    }
  }
  ngAfterViewInit(): void {}
  trackById(index: number, item: any): string {
    return item.id;
  }
  increaseQty() {
    this.quantity++;
  }
  decreaseQty() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  // Updated path prefix from 'apps/product' to 'product'
  getBack() {
    // Si está en modal, cerrar; si no, navegar atrás
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.router.navigate(['']);
    }
  }
  toggleSelected() {
    this.isSelected = !this.isSelected;
  }
  resetToggleValue() {
    this.toggleValue = null;
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
  viewVendorProduct(p: Element) {
    // En modo modal: recargar contenido dentro del mismo diálogo.
    if (this.dialogRef) {
      this.loading = true;
      this.loadProduct(p.id);
    } else {
      this.router.navigate(['product', p.id]);
    }
  }

  private loadProduct(id: number) {
    this.api.getProductById(id).subscribe((detail) => {
      this.product = detail;
      if (detail) {
        this.vendor = detail.vendor;
        this.vendorProducts = detail.vendorProducts || [];
      }
      this.loading = false;
    });
  }
}
