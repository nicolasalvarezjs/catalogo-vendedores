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
import { MonedaArsPipe } from 'src/app/pipe/moneda-ars.pipe';
import {
  CarouselModule,
  OwlOptions,
  CarouselComponent,
} from 'ngx-owl-carousel-o';
import { IconModule } from 'src/app/icon/icon.module';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { Vendor } from '../ecommerceData';
import { CartService } from 'src/app/services/apps/cart/cart.service';
import { ConfirmDialogComponent } from './confirm-dialog.component';

interface Slide {
  id: string;
  imgUrl: string;
  altText: string;
  title?: string;
}

@Component({
  selector: 'app-product-details',
  imports: [
    MaterialModule,
    CarouselModule,
    IconModule,
    CommonModule,
    MonedaArsPipe,
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements AfterViewInit {
  @ViewChild(CarouselComponent) carousel?: CarouselComponent;
  private cartService = inject(CartService);
  private dialog = inject(MatDialog);
  // Backend product shape minimal subset
  product: any | null = null;
  loading: boolean = true; // spinner inicial
  isSelected = false;
  quantity: number = 1;
  toggleValue: any = null;
  selectedTabIndex = 0;
  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 500,
    items: 1,
    autoHeight: true,
    responsive: {
      0: { items: 1 },
      400: { items: 1 },
      740: { items: 1 },
      940: { items: 1 },
    },
    nav: false,
  };
  // Slides dinámicos construidos desde product.images (solo ropa 1-4.jpg)
  slides: Slide[] = [];
  activeIndex = 0;
  vendor: Vendor | undefined;
  vendorProducts: any[] = [];
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
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    private dialogData: { product?: any; vendor?: Vendor } | null,
    @Optional() private dialogRef?: MatDialogRef<ProductDetailsComponent>
  ) {
    if (this.dialogData?.product) {
      // Modal con producto ya cargado
      this.product = this.dialogData.product;
      if (this.dialogData.vendor) this.vendor = this.dialogData.vendor;
      this.buildSlides(this.product);
      this.loading = false;
    } else {
      // Página normal: esperar id en ruta y producto precargado no disponible.
      this.route.paramMap.subscribe((params) => {
        const idParam = params.get('id');
        if (!idParam) {
          console.error('Product id not present in URL');
          this.loading = false;
          return;
        }
        // En versión backend real aquí se haría llamada GET /product/{id} (endpoint futuro)
        // Por ahora marcamos loading false y fallback.
        this.product = null;
        this.loading = false;
      });
    }
  }
  ngAfterViewInit(): void {
    if (this.carousel && this.slides.length) {
      this.carousel.to('0');
      this.activeIndex = 0;
    }
  }
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
  viewVendorProduct(p: any) {
    if (this.dialogRef) {
      this.loading = true;
      this.product = p;
      this.buildSlides(p);
      this.loading = false;
    } else {
      this.router.navigate(['product', p._id || p.id]);
    }
  }

  private loadProduct(_: any) {
    /* deprecated legacy mock method removed */
  }

  private buildSlides(detail: any) {
    const images: string[] = Array.isArray(detail.images) ? detail.images : [];
    const selected =
      images.length > 0
        ? images.slice(0, 5)
        : ['assets/images/products/no-image.png'];
    this.slides = selected.map((url, idx) => ({
      id: String(idx),
      imgUrl: url,
      altText: detail.product_name || `Imagen ${idx + 1}`,
    }));
    this.activeIndex = 0;
  }

  goToSlide(i: number) {
    if (i < 0 || i >= this.slides.length) return;
    this.activeIndex = i;
    if (this.carousel) {
      this.carousel.to(String(i));
    }
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement | null;
    if (img) {
      img.src = 'assets/images/products/no-image.png';
    }
  }

  addToCart() {
    if (this.product && this.vendor) {
      console.log('ProductDetailsComponent.addToCart called with:', {
        product: this.product,
        vendor: this.vendor,
        quantity: this.quantity,
      });
      // Agregar al carrito usando el servicio, pasando la cantidad
      this.cartService.addToCart(
        this.product,
        this.vendor.id,
        this.vendor.name,
        this.quantity
      );
      // Mostrar modal de confirmación
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Producto agregado',
          message: `${this.product.product_name} ha sido agregado al carrito correctamente.`,
          buttonText: 'Aceptar',
        },
        width: '400px',
      });
    } else {
      console.error('Cannot add to cart: product or vendor is missing', {
        product: this.product,
        vendor: this.vendor,
      });
    }
  }
}
