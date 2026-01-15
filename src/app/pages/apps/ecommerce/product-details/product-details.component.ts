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
import { ProductApiService } from 'src/app/services/api/product-api.service';
import { Product } from 'src/app/models/product.model';

interface Slide {
  id: string;
  imgUrl: string;
  altText: string;
  title?: string;
}

type DetailVendor = Vendor & {
  id?: string;
  logoPath?: string;
  doesShipping?: boolean;
  shippingDetail?: string;
  productDescription?: string;
  socials?: any;
};

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
  vendor: DetailVendor | undefined;
  private currentProductId: string | null = null;
  // Productos relacionados por categoría
  relatedProducts: any[] = [];
  relatedMax = 8;
  relatedLoadError: string | null = null;
  // Helper para skeletons en template
  skeletonIndices: number[] = [1, 2, 3, 4];
  // Placeholder ratings (no usado activamente, evita errores si plantilla lo referencia)
  ratings: { label: number; value: number; count: number }[] = [];
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
    private productApi: ProductApiService,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    private dialogData: { product?: any; vendor?: Vendor } | null,
    @Optional() private dialogRef?: MatDialogRef<ProductDetailsComponent>
  ) {
    if (this.dialogData?.product) {
      // Modal con producto ya cargado
      this.product = this.dialogData.product;
      this.currentProductId =
        this.dialogData.product?.id || this.dialogData.product?._id || null;
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
      if (this.dialogData.vendor) {
        this.vendor = this.dialogData.vendor;
      } else {
        // Intentar derivar vendor desde el producto (vendorMeta o vendorId)
        const prod = this.product as any;
        const vendorObj =
          prod?.vendorMeta ||
          (typeof prod?.vendorId === 'object' ? prod.vendorId : undefined);
        const vendorId =
          typeof prod?.vendorId === 'string' ? prod.vendorId : vendorObj?._id;
        if (vendorObj) {
          this.vendor = {
            id: vendorId,
            name: vendorObj.name || 'Vendedor',
            logoPath: (vendorObj as any).logoPath,
            doesShipping: (vendorObj as any).doesShipping,
            shippingDetail: (vendorObj as any).shippingDetail,
            productDescription: (vendorObj as any).productDescription,
            socials: (vendorObj as any).socials,
          } as any;
        } else if (vendorId) {
          this.vendor = {
            id: vendorId,
            name: 'Vendedor',
            logoPath: null,
          } as any;
        }
      }
      this.buildSlides(this.product);
      this.extractColors(this.product);
      // Ajustar cantidad inicial según minPurchase
      this.quantity = Math.max(this.quantity, this.minPurchase);
      this.initSizes();
      this.loading = false;
      // Cargar productos relacionados inmediatamente al abrir el diálogo
      this.loadRelatedProducts(this.product);
    } else {
      // Página normal: cargar por id desde backend
      this.route.paramMap.subscribe((params) => {
        const idParam = params.get('id');
        if (!idParam) {
          console.error('Product id not present in URL');
          this.loading = false;
          return;
        }
        this.fetchProduct(idParam);
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
      this.router.navigate(['']);
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
    // Asegurar vendor - intentar derivarlo si falta
    if (!this.vendor && this.product) {
      const prod = this.product as any;
      const vobj =
        prod.vendorMeta ||
        (typeof prod.vendorId === 'object' ? prod.vendorId : undefined);
      const vid = typeof prod.vendorId === 'string' ? prod.vendorId : vobj?._id;
      if (vobj) {
        this.vendor = {
          id: vid,
          name: vobj.name || 'Vendedor',
          logoPath: vobj.logoPath,
        } as any;
      } else if (vid) {
        this.vendor = { id: vid, name: 'Vendedor', logoPath: null } as any;
      }
    }

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

  private fetchProduct(id: string) {
    this.loading = true;
    this.productApi.getProductById(id).subscribe({
      next: (p) => {
        const mapped = this.mapBackendProduct(p);
        this.applyProduct(mapped, id);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching product', err);
        this.loading = false;
      },
    });
  }

  private mapBackendProduct(
    p: any
  ): Product & { id?: string; vendorMeta?: DetailVendor } {
    const vendorObj = typeof p.vendorId === 'object' ? p.vendorId : undefined;
    const vendorId =
      typeof p.vendorId === 'string' ? p.vendorId : vendorObj?._id;
    return {
      ...p,
      id: p._id || p.id,
      product_name: p.product_name || p.titulo,
      base_price: p.base_price || p.precio,
      imagePath:
        p.images && p.images.length > 0
          ? p.images[0]
          : 'assets/images/products/no-image.png',
      vendorMeta: vendorObj
        ? {
            id: vendorId,
            name: vendorObj.name,
            logoPath: (vendorObj as any).logoPath,
            doesShipping: (vendorObj as any).doesShipping,
            shippingDetail: (vendorObj as any).shippingDetail,
            productDescription: (vendorObj as any).productDescription,
            socials: (vendorObj as any).socials,
          }
        : undefined,
    } as Product & { id?: string; vendorMeta?: DetailVendor };
  }

  private applyProduct(
    mapped: Product & { id?: string; vendorMeta?: DetailVendor },
    fallbackId?: string
  ) {
    this.currentProductId =
      mapped.id || (mapped as any)._id || fallbackId || null;
    this.product = mapped;
    this.vendor = mapped.vendorMeta;
    this.selectedColorName = null;
    this.selectedColorHex = null;
    this.buildSlides(mapped);
    this.extractColors(mapped);
    this.quantity = Math.max(1, this.minPurchase);
    this.initSizes();
    // Cargar relacionados cuando se aplica el producto (página o diálogo)
    this.loadRelatedProducts(this.product);
  }

  private loadRelatedProducts(product: any) {
    if (!product) {
      this.relatedProducts = [];
      this.relatedLoadError = 'no product';
      return;
    }
    const category = product?.categoria || null;
    if (!category) {
      this.relatedProducts = [];
      this.relatedLoadError = 'no category';
      return;
    }
    this.relatedLoadError = null;
    console.log(
      '[RELATED] loading related for category=',
      category,
      'productId=',
      product?.id || product?._id
    );
    this.productApi
      .getProducts({ page: 1, limit: this.relatedMax, categories: [category] })
      .subscribe({
        next: (res) => {
          console.log('[RELATED] response', res);
          const mapped = (res.products || []).map((p) =>
            this.mapBackendProduct(p)
          );
          const currentId = this.product?.id || this.product?._id || null;
          this.relatedProducts = mapped
            .filter((p) => (p.id || (p as any)._id) !== currentId)
            .slice(0, this.relatedMax);
          if (!this.relatedProducts.length) this.relatedLoadError = 'empty';
        },
        error: (err) => {
          console.error('Error cargando relacionados', err);
          this.relatedProducts = [];
          this.relatedLoadError = 'error';
        },
      });
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

  openRelatedProduct(p: any) {
    const pid = p?.id || p?._id;
    if (!pid) return;
    if (this.dialogRef) {
      // Reemplazar el producto actual en el mismo diálogo (no apilar diálogos)
      this.applyProduct(this.mapBackendProduct(p), pid);
      // Si el asociado vendor viene en el objeto p, actualizarlo
      const v =
        p.vendorMeta ||
        (typeof p.vendorId === 'object' ? p.vendorId : undefined);
      if (v) {
        this.vendor = {
          id: typeof p.vendorId === 'string' ? p.vendorId : v._id,
          name: v.name || 'Vendedor',
          logoPath: v.logoPath || null,
          doesShipping: v.doesShipping,
          shippingDetail: v.shippingDetail,
          productDescription: v.productDescription,
          socials: v.socials,
        } as any;
      }
      // Recargar relacionados para la nueva categoría
      this.loadRelatedProducts(this.product);
    } else {
      this.router.navigate(['product', pid]);
    }
  }

  refreshRelated() {
    this.loadRelatedProducts(this.product);
  }
}
