import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';

export interface CategoriesFilterData {
  allCategories: string[];
  selectedCategories: string[];
}

@Component({
  selector: 'app-categories-filter-dialog',
  imports: [CommonModule, MaterialModule, FormsModule],
  template: `
    <div class="categories-filter-dialog">
      <h2 mat-dialog-title>Filtrar por Categorías</h2>
      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-width">
          <mat-select
            [(value)]="data.selectedCategories"
            multiple
            placeholder="Seleccionar categorías">
            @for(category of data.allCategories; track category) {
              <mat-option [value]="category">{{ category }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="clearFilters()">Limpiar</button>
        <button mat-button mat-dialog-close>Aplicar</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .categories-filter-dialog {
      min-width: 300px;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class CategoriesFilterDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CategoriesFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CategoriesFilterData
  ) {}

  clearFilters() {
    this.data.selectedCategories = [];
  }
}