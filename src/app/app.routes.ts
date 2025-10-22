import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { ShopComponent } from './pages/apps/ecommerce/shop/shop.component';
import { ProductDetailsComponent } from './pages/apps/ecommerce/product-details/product-details.component';

// Layout raiz sin sidebar.

export const routes: Routes = [
  {
    path: '',
    component: BlankComponent,
    children: [
      // Root ahora es directamente el listado del catálogo
      { path: '', component: ShopComponent },
  { path: 'product/:id', component: ProductDetailsComponent },
    ],
  },
  // Fallback redirige al listado del catálogo
  { path: '**', redirectTo: '' },
];
