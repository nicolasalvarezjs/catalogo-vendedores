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
import { CarouselModule, OwlOptions, CarouselComponent } from 'ngx-owl-carousel-o';
import { IconModule } from 'src/app/icon/icon.module';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ProductService } from 'src/app/services/apps/product/product.service';
import {
  productcards,
  PRODUCT_DATA,
  VENDORS,
  Vendor,
  Element as ProductElement,
} from '../ecommerceData';
import {
  MockProductApiService,
  ProductDetail,
} from 'src/app/services/apps/product/mock-product-api.service';
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
  imports: [MaterialModule, CarouselModule, IconModule, CommonModule, MonedaArsPipe],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements AfterViewInit {
  @ViewChild(CarouselComponent) carousel?: CarouselComponent;
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private dialog = inject(MatDialog);
  product: ProductDetail | null = null;
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
    responsive: { 0: { items: 1 }, 400: { items: 1 }, 740: { items: 1 }, 940: { items: 1 } },
    nav: false,
  };
  // Slides dinámicos construidos desde product.images (solo ropa 1-4.jpg)
  slides: Slide[] = [];
  activeIndex = 0;
  productcards = productcards; // se usará ahora como productos del vendedor
  vendor: Vendor | undefined;
  vendorProducts: ProductElement[] = [];
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
    private dialogData: { productId?: number; vendor?: Vendor } | null,
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
        // Si se pasó vendor desde el modal, usarlo
        if (this.dialogData.vendor) {
          this.vendor = this.dialogData.vendor;
          console.log('Vendor set from dialogData:', this.vendor);
        } else {
          console.warn('No vendor passed from dialogData');
        }
        this.loadProduct(this.dialogData.productId);
      } else {
        console.error('No se pasó productId al diálogo');
        this.loading = false;
      }
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
  viewVendorProduct(p: ProductElement) {
    // En modo modal: recargar contenido dentro del mismo diálogo.
    if (this.dialogRef) {
      this.loading = true;
      this.loadProduct(+p.id);
    } else {
      this.router.navigate(['product', p.id]);
    }
  }

  private loadProduct(id: number) {
    console.log('Loading product with id:', id);
    this.api.getProductById(id).subscribe((detail) => {
      console.log('Product detail received:', detail);
      this.product = detail;
      if (detail) {
        console.log('Vendor from detail:', detail.vendor);
        console.log('Current vendor before assignment:', this.vendor);
        // Solo asignar vendor del detail si no tenemos uno del modal
        if (!this.vendor) {
          this.vendor = detail.vendor;
          console.log('Vendor assigned from detail:', this.vendor);
        } else {
          console.log('Keeping vendor from modal, ignoring detail vendor');
        }
        this.vendorProducts = detail.vendorProducts || [];
        this.buildSlides(detail);
      }
      this.loading = false;
    });
  }

  private buildSlides(detail: ProductDetail) {
    const allowedClothing = [
      'assets/images/ropa/IMG-20240927-WA0086.jpg',
      'assets/images/ropa/IMG-20240927-WA0091.jpg',
      'assets/images/ropa/IMG-20240927-WA0088.jpg',
      'assets/images/ropa/IMG-20240927-WA0089.jpg',
    ];
    const images: string[] = Array.isArray((detail as any).images)
      ? (detail as any).images
      : [];
    // Detecta si es prenda (fashion) o si alguno de los géneros apunta a ropa
    const isClothing =
      (detail as any).categoria === 'fashion' ||
      ((detail as any).generos || []).some((g: string) => ['Mujer', 'Hombre', 'Niño'].includes(g));

    let selected: string[] = [];
    if (isClothing) {
      // filtra solo imágenes permitidas y limita a 4
      selected = images.filter((img) => allowedClothing.includes(img));
      if (selected.length === 0) {
        // fallback: usa todas las clothing si el producto aún no tiene asignadas
        selected = allowedClothing.slice(0, 4);
      }
    } else if (images.length > 0) {
      // No es ropa, usa sus propias imágenes
      selected = images.slice(0, 4);
    } else if (detail.imagePath) {
      selected = [detail.imagePath];
    }
    this.slides = selected.slice(0,5).map((url, idx) => ({
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

  addToCart() {
    if (this.product && this.vendor) {
      console.log('ProductDetailsComponent.addToCart called with:', {
        product: this.product,
        vendor: this.vendor,
        quantity: this.quantity
      });
      // Agregar al carrito usando el servicio, pasando la cantidad
      this.cartService.addToCart(this.product, this.vendor.id, this.vendor.name, this.quantity);
      // Mostrar modal de confirmación
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Producto agregado',
          message: `${this.product.product_name} ha sido agregado al carrito correctamente.`,
          buttonText: 'Aceptar'
        },
        width: '400px'
      });
    } else {
      console.error('Cannot add to cart: product or vendor is missing', {
        product: this.product,
        vendor: this.vendor
      });
    }
  }
}
