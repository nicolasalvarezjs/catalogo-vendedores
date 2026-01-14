import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';

export interface CategoriesFilterData {
  allCategories: string[];
  selectedCategories: string[];
  onSelectionChange?: (categories: string[]) => void;
}

@Component({
  selector: 'app-categories-filter-dialog',
  imports: [CommonModule, MaterialModule, FormsModule],
  template: `
    <div class="categories-filter-dialog">
      <h2 mat-dialog-title>Filtrar por Categorías</h2>
      <mat-dialog-content>
        @if (data.allCategories.length) {
          <mat-selection-list
            class="category-list"
            [(ngModel)]="data.selectedCategories"
            [multiple]="true"
            (ngModelChange)="handleSelectionChange($event)"
          >
            @for (category of data.allCategories; track category) {
              <mat-list-option [value]="category">
                {{ category }}
              </mat-list-option>
            }
          </mat-selection-list>
        } @else {
          <div class="empty-placeholder">
            No hay categorías disponibles en este momento.
          </div>
        }
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="clearFilters()">Limpiar</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .categories-filter-dialog {
      min-width: 300px;
    }

    .category-list {
      width: 100%;
      max-height: 60vh;
      overflow: auto;
    }

    .empty-placeholder {
      padding: 16px;
      text-align: center;
      color: rgba(0, 0, 0, 0.54);
    }
  `]
})
export class CategoriesFilterDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: CategoriesFilterData) {}

  clearFilters() {
    this.data.selectedCategories = [];
    this.data.onSelectionChange?.([]);
  }

  handleSelectionChange(categories: string[] | null | undefined) {
    const next = Array.isArray(categories) ? categories : [];
    this.data.selectedCategories = next;
    this.data.onSelectionChange?.([...next]);
  }
}