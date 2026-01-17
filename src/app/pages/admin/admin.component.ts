import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ProductCreateComponent } from './product-create.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, MatButtonModule, ProductCreateComponent],
  template: `
    <section class="admin-shell">
      <div class="hero">
        <div>
          <p class="eyebrow">Dashboard</p>
          <h1>Panel administrativo</h1>
          <div class="actions">
            <button mat-stroked-button color="primary" (click)="goHome()">Ver productos</button>
            <button mat-stroked-button color="primary" (click)="logout()">Cerrar sesión</button>
          </div>
        </div>
      </div>

      <section id="product-form" class="form-wrapper">
        <app-product-create></app-product-create>
      </section>
    </section>
  `,
  styles: [
    `
      .admin-shell {
        padding: 20px;
        max-width: 1100px;
        margin: 0 auto 40px;
        display: grid;
        gap: 18px;
      }
      .hero {
        background: linear-gradient(135deg, #fef9c3, #f5f3ff);
        border: 1px solid #f1eaff;
        border-radius: 18px;
        padding: 18px;
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: flex-start;
        flex-wrap: wrap;
      }
      h1 {
        margin: 4px 0 6px;
        letter-spacing: -0.2px;
      }
      .actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .eyebrow {
        text-transform: uppercase;
        font-size: 0.82rem;
        letter-spacing: 0.08em;
        color: #a855f7;
        margin: 0;
      }
      .form-wrapper {
        background: #ffffff;
        border: 1px solid #f4f4f5;
        border-radius: 16px;
        padding: 6px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      }
      @media (max-width: 700px) {
        .hero {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class AdminComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  goHome() {
    this.router.navigateByUrl('/');
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  scrollToForm() {
    const el = document.getElementById('product-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
