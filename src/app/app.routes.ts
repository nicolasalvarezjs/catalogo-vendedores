import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { ShopComponent } from './pages/apps/ecommerce/shop/shop.component';
import { ProductDetailsComponent } from './pages/apps/ecommerce/product-details/product-details.component';
import { EmpresaComponent } from './pages/empresa/empresa.component';
import { HomeNewComponent } from './pages/apps/ecommerce/home-new/home-new.component';
import { LoginComponent } from './pages/auth/login.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { ProductCreateComponent } from './pages/admin/product-create.component';

export const routes: Routes = [
  {
    path: '',
    component: BlankComponent,
    children: [
      { path: '', component: ShopComponent },
      { path: 'empresa', component: EmpresaComponent },
      { path: 'product/:id', component: ProductDetailsComponent },
      { path: 'home', component: HomeNewComponent },
      { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
      {
        path: 'admin/new-product',
        component: ProductCreateComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '' },
];
