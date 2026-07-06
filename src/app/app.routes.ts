import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { Productos } from './productos/productos';
import { Categorias } from './categorias/categorias';
import { Proveedores } from './proveedores/proveedores';
import { Ventas } from './ventas/ventas';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'productos', component: Productos },
  { path: 'categorias', component: Categorias },
   { path: 'proveedores', component: Proveedores },
  { path: 'ventas', component: Ventas }
];