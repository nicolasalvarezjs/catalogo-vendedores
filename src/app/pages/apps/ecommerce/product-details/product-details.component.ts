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
  // Swatches derivadas del array de colores del producto
  colorSwatches: { name: string; hex: string }[] = [];
  // Selección de color (nombre, no hex) para carrito / checkout
  selectedColorName: string | null = null;
  selectedColorHex: string | null = null;
  // Talles seleccionados (solo salesType 'unidad')
  selectedSizes: string[] = [];
  // Talles disponibles preprocesados (evita regex en template)
  sizesAvailable: string[] = [];
  loading: boolean = true; // spinner inicial
  isSelected = false;
  quantity: number = 1;
  toggleValue: any = null;
  selectedTabIndex = 0;
  // Reglas de compra mínima para salesType 'unidad'
  get minPurchase(): number {
    const mp = this.product?.minPurchase;
    return this.product?.salesType === 'unidad' &&
      typeof mp === 'number' &&
      mp > 0
      ? mp
      : 1;
  }
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
      console.log('[DETAILS INIT] Producto recibido en dialog:', {
        id: this.product?._id,
        name: this.product?.product_name,
        colorsType: Array.isArray(this.product?.colors)
          ? 'array'
          : typeof this.product?.colors,
        colors: this.product?.colors,
        legacyColor: this.product?.color,
        salesType: this.product?.salesType,
        minPurchase: this.product?.minPurchase,
      });
      if (this.dialogData.vendor) this.vendor = this.dialogData.vendor;
      this.buildSlides(this.product);
      this.extractColors(this.product);
      // Ajustar cantidad inicial según minPurchase
      this.quantity = Math.max(this.quantity, this.minPurchase);
      this.initSizes();
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
    const floor = this.minPurchase;
    if (this.quantity > floor) {
      this.quantity--;
    }
  }
  isDecreaseDisabled(): boolean {
    return this.quantity <= this.minPurchase;
  }
  // Formatea talles separados por guión/coma a CSV legible
  formatTalles(raw: string | undefined | null): string {
    if (!raw) return '';
    return raw
      .split(/[,\-]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .join(', ');
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
      this.extractColors(p);
      this.quantity = Math.max(1, this.minPurchase);
      this.initSizes();
      this.loading = false;
    } else {
      this.router.navigate(['product', p._id || p.id]);
    }
  }

  private loadProduct(_: any) {
    /* deprecated legacy mock method removed */
  }

  private buildSlides(detail: any) {
    // Normaliza y deduplica URLs; corrige http->https si la app está bajo https
    const rawImages: string[] = Array.isArray(detail.images)
      ? detail.images.filter(Boolean)
      : detail.images && typeof detail.images === 'string'
      ? [detail.images]
      : [];
    const unique = [...new Set(rawImages)];
    const normalized = unique.map((u) => this.normalizeImageUrl(u));
    const selected =
      normalized.length > 0
        ? normalized.slice(0, 10)
        : ['assets/images/products/no-image.png'];
    this.slides = selected.map((url, idx) => ({
      id: String(idx),
      imgUrl: url,
      altText: detail.product_name || `Imagen ${idx + 1}`,
    }));
    this.activeIndex = 0;
    console.log(
      '[BUILD SLIDES] raw:',
      rawImages,
      'unique:',
      unique,
      'normalized:',
      normalized,
      'slides:',
      this.slides
    );
    // Debug: probar carga real de cada imagen (sólo en dev / localhost)
    if (
      typeof window !== 'undefined' &&
      /localhost|127\.0\.0\.1/.test(window.location.host)
    ) {
      this.debugImages(normalized);
    }
  }

  private normalizeImageUrl(url: string): string {
    if (!url) return 'assets/images/products/no-image.png';
    try {
      // Trim accidental spaces
      let cleaned = url.trim();
      // Si estamos en https y la imagen viene como http, intentar subir a https
      if (
        typeof window !== 'undefined' &&
        window.location.protocol === 'https:' &&
        cleaned.startsWith('http://')
      ) {
        cleaned = cleaned.replace('http://', 'https://');
      }
      // Asegura que termina con extensión de imagen conocida (opcional)
      // Podríamos agregar lógica extra si backend entrega sin extensión.
      return cleaned;
    } catch (e) {
      console.warn('[NORMALIZE IMAGE URL] fallo normalizando', url, e);
      return 'assets/images/products/no-image.png';
    }
  }

  private debugImages(urls: string[]) {
    const testers = urls.map((u) => this.testImage(u));
    Promise.all(testers).then((results) => {
      console.log('[IMAGE DEBUG RESULTS]', results);
      const failed = results.filter((r) => r.status !== 'ok');
      if (failed.length) {
        console.warn(
          '[IMAGES FALLING BACK] Algunas imágenes no cargan:',
          failed
        );
      }
    });
  }

  private testImage(
    url: string
  ): Promise<{ url: string; status: 'ok' | 'error' }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ url, status: 'ok' });
      img.onerror = () => resolve({ url, status: 'error' });
      img.src = url;
    });
  }

  private extractColors(detail: any) {
    const raw = detail?.colors;
    console.log('[EXTRACT COLORS] Raw colors field:', raw);
    if (Array.isArray(raw)) {
      if (raw.length && typeof raw[0] === 'object') {
        this.colorSwatches = raw
          .map((c: any) => ({ name: c.name, hex: c.hex }))
          .filter((c) => c.name && c.hex);
      } else {
        this.colorSwatches = raw.map((hex: string) => ({ name: hex, hex }));
      }
    } else if (detail?.color) {
      this.colorSwatches = [{ name: detail.color, hex: detail.color }];
    } else if (raw && typeof raw === 'object') {
      this.colorSwatches = Object.keys(raw).map((k) => ({
        name: k,
        hex: raw[k],
      }));
    } else {
      this.colorSwatches = [];
    }
    console.log('[EXTRACT COLORS] Parsed swatches:', this.colorSwatches);
    // Si sólo hay un color, seleccionarlo por defecto
    if (this.colorSwatches.length === 1) {
      this.setSelectedColor(this.colorSwatches[0]);
    }
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
        selectedColorName: this.selectedColorName,
        selectedSizes: this.selectedSizes,
      });
      // Agregar al carrito usando el servicio, pasando la cantidad
      this.cartService.addToCart(
        this.product,
        this.vendor.id,
        this.vendor.name,
        this.quantity,
        this.selectedColorName || undefined,
        this.selectedSizes.length ? this.selectedSizes : undefined
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

  setSelectedColor(c: { name: string; hex: string }) {
    this.selectedColorName = c.name;
    this.selectedColorHex = c.hex;
    console.log('[COLOR SELECTED]', c);
  }

  private initSizes() {
    if (
      this.product?.salesType === 'unidad' &&
      typeof this.product?.talles === 'string'
    ) {
      const arr = this.product.talles
        .split(/[,\-]/)
        .map((s: string) => s.trim())
        .filter(Boolean);
      // No seleccionamos por defecto para obligar al usuario a elegir.
      this.selectedSizes = [];
      this.sizesAvailable = arr;
      console.log('[INIT SIZES] talles disponibles:', arr);
    } else {
      this.selectedSizes = [];
      this.sizesAvailable = [];
    }
  }

  toggleSize(size: string) {
    if (!size) return;
    const idx = this.selectedSizes.indexOf(size);
    if (idx >= 0) {
      this.selectedSizes.splice(idx, 1);
    } else {
      this.selectedSizes.push(size);
    }
  }

  isSizeSelected(size: string): boolean {
    return this.selectedSizes.includes(size);
  }
}
