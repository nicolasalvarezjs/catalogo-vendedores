import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="login-wrapper">
      <div class="background"></div>
      <mat-card class="panel">
        <div class="panel__header">
          <div class="badge">Panel privado</div>
          <h1>Catálogo admin</h1>
          <p>Accedé al panel para gestionar productos y mantener el catálogo al día.</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Usuario</mat-label>
            <input matInput formControlName="username" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Contraseña</mat-label>
            <input matInput type="password" formControlName="password" />
          </mat-form-field>

          <button
            mat-raised-button
            color="primary"
            class="full-width cta"
            type="submit"
            [disabled]="form.invalid || loading"
          >
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>

          <div class="error" *ngIf="error">{{ error }}</div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .login-wrapper {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle at 20% 20%, #fef08a 0, transparent 36%),
          radial-gradient(circle at 80% 10%, #e9d5ff 0, transparent 30%),
          linear-gradient(135deg, #f8fafc, #eef2ff);
        padding: 20px;
        position: relative;
        overflow: hidden;
      }
      .background {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.35), transparent 45%),
          radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.25), transparent 40%);
        filter: blur(10px);
        pointer-events: none;
      }
      .panel {
        width: 100%;
        max-width: 420px;
        padding: 18px 18px 12px;
        background: #ffffff;
        color: #0f172a;
        border: 1px solid #f4f4f5;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
        border-radius: 16px;
      }
      .panel__header {
        display: grid;
        gap: 4px;
        margin-bottom: 12px;
      }
      .panel__header h1 {
        margin: 0;
        font-weight: 700;
        letter-spacing: -0.3px;
      }
      .panel__header p {
        margin: 0;
        color: #4b5563;
        font-size: 0.95rem;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        border-radius: 999px;
        background: linear-gradient(90deg, #facc15, #a855f7);
        color: #0f172a;
        font-weight: 700;
        font-size: 0.85rem;
        width: fit-content;
      }
      .form {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .full-width {
        width: 100%;
      }
      .cta {
        margin-top: 4px;
        height: 44px;
        font-weight: 700;
        letter-spacing: 0.2px;
        text-transform: none;
      }
      .error {
        color: #dc2626;
        margin-top: 6px;
        font-size: 0.92rem;
      }
      /* Evita zoom en inputs en iOS al asegurar 16px+ */
      .panel .mat-mdc-input-element {
        font-size: 16px;
      }
      @media (max-width: 480px) {
        .panel {
          padding: 16px 14px 12px;
        }
      }
    `,
  ],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error: string | null = null;

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.error = null;
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/admin');
      },
      error: (err) => {
        console.error('Login error', err);
        this.loading = false;
        this.error =
          err?.error?.message || 'No se pudo iniciar sesión. Intenta de nuevo.';
      },
    });
  }
}
