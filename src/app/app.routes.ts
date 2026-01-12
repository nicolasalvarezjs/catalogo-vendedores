import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { ShopComponent } from './pages/apps/ecommerce/shop/shop.component';
import { ProductDetailsComponent } from './pages/apps/ecommerce/product-details/product-details.component';
import { EmpresaComponent } from './pages/empresa/empresa.component';
import { HomeNewComponent } from './pages/apps/ecommerce/home-new/home-new.component';

export const routes: Routes = [
  {
    path: '',
    component: BlankComponent,
    children: [
      { path: '', component: ShopComponent },
      { path: 'empresa', component: EmpresaComponent },
      { path: 'product/:id', component: ProductDetailsComponent },
      { path: 'home', component: HomeNewComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
