import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { Productos } from './productos/productos';
import { Proveedores } from './proveedores/proveedores';
import { Ventas } from './ventas/ventas';
import { ReportesIa } from './reportes-ia/reportes-ia';
import { Ajustes } from './ajustes/ajustes';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'productos', component: Productos },
  { path: 'proveedores', component: Proveedores },
  { path: 'ventas', component: Ventas },
  { path: 'reportes-ia', component: ReportesIa },
  { path: 'ajustes', component: Ajustes }
];