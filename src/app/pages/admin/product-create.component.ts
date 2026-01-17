import { Component, inject, signal, Optional, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FileService } from '../../services/file.service';
import { ProductApiService } from '../../services/api/product-api.service';
import { finalize } from 'rxjs/operators';
import { CategoryApiService, BackendCategory } from '../../services/api/category-api.service';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="page" [class.dialog-mode]="isDialogMode">
      <div class="background"></div>
      <mat-card class="panel">
        <header class="panel__header">
          <div class="badge">{{ editMode ? 'Editar producto' : 'Nuevo producto' }}</div>
          <div class="status">
            <span class="pill live" *ngIf="uploading()">Subiendo imágenes...</span>
            <span class="pill ok" *ngIf="success()">Listo para vender</span>
          </div>
        </header>

        <div class="alert success" *ngIf="success()">
          {{ editMode ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.' }}
        </div>

        <section class="media">
          <div class="media__picker">
            <label class="img-picker" [class.disabled]="uploading()">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                (change)="onFiles($event)"
                [disabled]="uploading()"
              />
              <div class="picker-copy">
                <span class="eyebrow">Imágenes</span>
                <strong>{{ uploading() ? 'Subiendo...' : 'Agregar o tomar fotos' }}</strong>
                <small>Se optimizan a 1280px antes de subir.</small>
              </div>
            </label>
            <p class="tip">Tip: priorizá luz natural y foco centrado para mejores resultados.</p>
          </div>
          <div class="thumbs">
            <div class="thumb" *ngFor="let url of imageUrls(); let i = index">
              <img [src]="url" alt="preview" />
              <button mat-icon-button color="warn" (click)="removeImage(i)" aria-label="Quitar imagen">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <div class="empty" *ngIf="!imageUrls().length">
              <mat-icon>photo_camera</mat-icon>
              <span>Sin imágenes aún</span>
            </div>
          </div>
        </section>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="form">
          <div class="grid">
            <mat-form-field appearance="outline" class="full">
              <mat-label>Nombre</mat-label>
              <input matInput formControlName="product_name" />
            </mat-form-field>

            <div class="cat-field">
              <mat-form-field appearance="outline" class="full">
                <mat-label>Categoría</mat-label>
                <mat-select formControlName="categoria">
                  <mat-option *ngFor="let cat of categories()" [value]="cat.name">
                    {{ cat.name }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
              <button mat-mini-fab color="primary" class="add-cat" type="button" (click)="onAddCategory()">
                <mat-icon>add</mat-icon>
              </button>
            </div>
          </div>

          <div class="grid">
            <mat-form-field appearance="outline" class="full">
              <mat-label>Precio</mat-label>
              <input matInput type="number" min="0" formControlName="base_price" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Géneros</mat-label>
              <mat-select formControlName="generos" multiple>
                <mat-option *ngFor="let g of generoOptions" [value]="g">{{ g }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Descripción</mat-label>
            <textarea matInput rows="3" formControlName="description"></textarea>
          </mat-form-field>

          <div class="chip-row">
            <mat-chip-set>
              <mat-chip color="primary" selected>Generos: unisex</mat-chip>
            </mat-chip-set>
          </div>

          <button
            mat-raised-button
            color="primary"
            class="full cta"
            type="submit"
            [disabled]="form.invalid || saving()"
          >
            {{ saving() ? 'Guardando...' : editMode ? 'Guardar cambios' : 'Publicar' }}
          </button>

          <div class="error" *ngIf="error()">{{ error() }}</div>
          <div class="success" *ngIf="success()">
            {{ editMode ? 'Producto actualizado' : 'Producto creado' }}
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .page {
        padding: 14px;
        display: flex;
        justify-content: center;
        background: radial-gradient(circle at 10% 20%, #fef08a 0, transparent 32%),
          radial-gradient(circle at 85% 15%, #e9d5ff 0, transparent 30%),
          linear-gradient(120deg, #f8fafc, #eef2ff);
        min-height: 100vh;
        position: relative;
        overflow: hidden;
      }
      .page.dialog-mode {
        min-height: auto;
        max-height: 86vh;
        overflow-y: auto;
        padding: 12px 12px 18px;
      }
      .background {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.24), transparent 52%),
          radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.2), transparent 48%);
        filter: blur(12px);
        pointer-events: none;
      }
      .panel {
        width: 100%;
        max-width: 640px;
        padding: 16px;
        background: #ffffff;
        color: #0f172a;
        border: 1px solid #f4f4f5;
        box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
        position: relative;
        border-radius: 18px;
      }
      .panel__header {
        display: grid;
        gap: 6px;
        margin-bottom: 14px;
      }
      .badge {
        width: fit-content;
        background: linear-gradient(90deg, #facc15, #a855f7);
        color: #0f172a;
        padding: 6px 12px;
        border-radius: 999px;
        font-weight: 700;
        font-size: 0.9rem;
      }
      .status {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .pill {
        border-radius: 999px;
        padding: 6px 10px;
        font-weight: 600;
        font-size: 0.85rem;
        border: 1px solid #e4e4e7;
        background: #f8fafc;
      }
      .pill.soft {
        color: #7c3aed;
      }
      .pill.live {
        color: #d97706;
        border-color: rgba(217, 119, 6, 0.35);
      }
      .pill.ok {
        color: #16a34a;
        border-color: rgba(22, 163, 74, 0.35);
      }
      .media {
        display: grid;
        gap: 10px;
        margin-bottom: 12px;
      }
      .media__picker {
        display: grid;
        gap: 8px;
      }
      .img-picker {
        border: 1px dashed #e4e4e7;
        padding: 12px;
        border-radius: 12px;
        background: #fffbeb;
        color: #3f3f46;
        cursor: pointer;
        transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
      }
      .img-picker:hover {
        border-color: #facc15;
        background: #fef9c3;
        box-shadow: 0 8px 18px rgba(250, 204, 21, 0.18);
      }
      .img-picker.disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .img-picker input {
        display: none;
      }
      .picker-copy {
        display: grid;
        gap: 4px;
      }
      .picker-copy strong {
        font-size: 1.05rem;
      }
      .picker-copy small {
        color: #6b7280;
      }
      .eyebrow {
        text-transform: uppercase;
        font-size: 0.8rem;
        letter-spacing: 0.08em;
        color: #7c3aed;
      }
      .tip {
        margin: 0;
        color: #6b7280;
        font-size: 0.9rem;
      }
      .thumbs {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
        gap: 10px;
        border: 1px solid #e4e4e7;
        border-radius: 12px;
        padding: 10px;
        background: #f8fafc;
      }
      .thumb {
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        background: #ffffff;
        aspect-ratio: 1 / 1;
        box-shadow: inset 0 0 0 1px #e4e4e7;
      }
      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .thumb button {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 28px;
        height: 28px;
        background: rgba(255, 255, 255, 0.9);
        color: #dc2626;
      }
      .empty {
        display: grid;
        place-items: center;
        gap: 6px;
        padding: 12px 8px;
        color: #6b7280;
        grid-column: 1 / -1;
        border: 1px dashed #e4e4e7;
        border-radius: 10px;
      }
      .form {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 10px;
      }
      .full {
        width: 100%;
      }
      .cat-field {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
        align-items: center;
      }
      .add-cat {
        box-shadow: 0 6px 16px rgba(124, 58, 237, 0.22);
      }
      .chip-row {
        display: flex;
      }
      .cta {
        height: 46px;
        font-weight: 700;
        text-transform: none;
        letter-spacing: 0.2px;
      }
      .error {
        color: #dc2626;
      }
      .success {
        color: #16a34a;
      }
      .alert {
        border-radius: 12px;
        padding: 12px;
        border: 1px solid #dcfce7;
        background: #f0fdf4;
        color: #166534;
        margin-bottom: 10px;
        font-weight: 600;
      }
      @media (max-width: 520px) {
        .panel {
          padding: 14px;
        }
        .thumbs {
          grid-template-columns: repeat(auto-fill, minmax(78px, 1fr));
        }
      }
    `,
  ],
})
export class ProductCreateComponent {
  private fb = inject(FormBuilder);
  private fileService = inject(FileService);
  private productApi = inject(ProductApiService);
  private categoryApi = inject(CategoryApiService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData?: any,
    @Optional() private dialogRef?: MatDialogRef<ProductCreateComponent>
  ) {
    this.isDialogMode = !!this.dialogRef;
    this.loadCategories();
    if (this.dialogData?.product) {
      this.prefillForEdit(this.dialogData.product);
    }
  }

  saving = signal(false);
  uploading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  imageUrls = signal<string[]>([]);
  categories = signal<BackendCategory[]>([]);
  generoOptions = ['Hombre', 'Mujer', 'Niños', 'Unisex'];
  isDialogMode = false;

  editMode = false;
  editProductId: string | null = null;

  form = this.fb.nonNullable.group({
    product_name: ['', Validators.required],
    categoria: ['', Validators.required],
    base_price: [0, [Validators.required, Validators.min(0)]],
    generos: this.fb.nonNullable.control<string[]>(['Unisex'], Validators.required),
    description: [''],
  });

  async onFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;
    this.uploading.set(true);
    this.error.set(null);
    try {
      const compressedFiles = await Promise.all(
        Array.from(files).map((f) => this.compressImage(f, 1280, 0.72))
      );

      const uploaded: string[] = [];
      for (const cf of compressedFiles) {
        const url = await this.fileService
          .uploadImage(cf, 'images', this.generateUuid())
          .toPromise();
        if (url) uploaded.push(url as any);
      }

      this.imageUrls.set([...this.imageUrls(), ...uploaded]);
    } catch (e: any) {
      console.error('Upload error', e);
      this.error.set('No se pudo subir la imagen');
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  removeImage(index: number) {
    const current = [...this.imageUrls()];
    current.splice(index, 1);
    this.imageUrls.set(current);
  }

  onSubmit() {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    this.success.set(false);
    const payload = {
      ...this.form.getRawValue(),
      images: this.imageUrls(),
    };

    const request$ = this.editMode && this.editProductId
      ? this.productApi.updateProduct(this.editProductId, payload)
      : this.productApi.createProduct(payload);

    request$
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.success.set(true);
          this.snack.open(
            this.editMode ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
            'Cerrar',
            { duration: 3000 }
          );
          if (this.editMode) {
            this.dialogRef?.close({ updated: true });
          } else {
            this.form.reset({ product_name: '', categoria: '', base_price: 0, generos: ['Unisex'], description: '' });
            this.imageUrls.set([]);
            this.loadCategories();
          }
        },
        error: (err) => {
          console.error(this.editMode ? 'Update product error' : 'Create product error', err);
          this.error.set(
            err?.error?.message ||
              (this.editMode ? 'No se pudo actualizar el producto' : 'No se pudo crear el producto')
          );
        },
      });
  }

  private generateUuid(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private loadCategories() {
    this.categoryApi.getCategories().subscribe({
      next: (cats) => this.categories.set(cats || []),
      error: (err) => {
        console.error('Load categories error', err);
        this.categories.set([]);
      },
    });
  }

  private prefillForEdit(product: any) {
    this.editMode = true;
    this.editProductId = product._id || product.id || null;
    this.form.patchValue({
      product_name: product.product_name || '',
      categoria: product.categoria || product.category || '',
      base_price: product.base_price || product.precio || 0,
      generos: product.generos && product.generos.length ? product.generos : ['unisex'],
      description: product.description || '',
    });
    if (Array.isArray(product.images)) {
      this.imageUrls.set(product.images.filter(Boolean));
    }
  }

  onAddCategory() {
    const ref = this.dialog.open(CreateCategoryDialogComponent, {
      width: '320px',
      panelClass: 'category-dialog',
    });
    ref.afterClosed().subscribe((name?: string) => {
      if (!name) return;
      this.categoryApi.createCategory({ name }).subscribe({
        next: (cat) => {
          // refresh list and select the newly created one
          this.loadCategories();
          this.form.patchValue({ categoria: cat.name });
        },
        error: (err) => {
          console.error('Create category error', err);
          this.error.set(err?.error?.message || 'No se pudo crear la categoría');
        },
      });
    });
  }

  private compressImage(file: File, maxSize: number, quality: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const longer = Math.max(width, height);
        if (longer > maxSize) {
          const scale = maxSize / longer;
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('No ctx'));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('No blob'));
            const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            URL.revokeObjectURL(url);
            resolve(compressed);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    });
  }
}

@Component({
  selector: 'app-create-category-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Nueva categoría</h2>
    <form class="dialog-form" [formGroup]="form" (ngSubmit)="submit()">
      <mat-form-field appearance="outline" class="full">
        <mat-label>Nombre</mat-label>
        <input matInput formControlName="name" />
      </mat-form-field>
      <div class="actions">
        <button mat-button type="button" (click)="dialogRef.close()">Cancelar</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Crear</button>
      </div>
    </form>
  `,
  styles: [
    `
      .dialog-form {
        display: grid;
        gap: 12px;
        padding: 0 8px 8px;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .full {
        width: 100%;
      }
    `,
  ],
})
export class CreateCategoryDialogComponent {
  form = this.fb.nonNullable.group({ name: ['', Validators.required] });
  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<CreateCategoryDialogComponent>) {}

  submit() {
    if (this.form.invalid) return;
    const { name } = this.form.getRawValue();
    this.dialogRef.close(name.trim());
  }
}
