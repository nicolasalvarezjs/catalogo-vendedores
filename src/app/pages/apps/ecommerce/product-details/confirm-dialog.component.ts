import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';

interface ConfirmDialogData {
  title: string;
  message: string;
  buttonText: string;
  cancelText?: string;
  showCancel?: boolean;
  extraButton?: { label: string; action: () => void; color?: string };
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="confirm-dialog">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button
          mat-button
          *ngIf="data.showCancel"
          (click)="close(false)"
        >
          {{ data.cancelText || 'Cancelar' }}
        </button>
        <button
          mat-stroked-button
          *ngIf="data.extraButton"
          [color]="data.extraButton?.color || 'primary'"
          (click)="handleExtra()"
        >
          {{ data.extraButton?.label }}
        </button>
        <button mat-flat-button color="primary" (click)="close(true)">
          {{ data.buttonText }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      padding: 20px;
    }
    mat-dialog-content p {
      margin: 0;
      font-size: 16px;
      line-height: 1.5;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  close(result: boolean = false): void {
    this.dialogRef.close(result);
  }

  handleExtra(): void {
    if (this.data.extraButton?.action) {
      this.data.extraButton.action();
    }
    this.close(false);
  }
}