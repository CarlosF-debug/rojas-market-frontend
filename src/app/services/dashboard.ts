import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from './producto';
import { AlertaInventario } from './reporte-ia';

export interface DashboardResumen {
  totalProductos: number;
  productosBajoStock: number;
  alertasNoLeidas: number;
  ventasHoy: number;
  cantidadVentasHoy: number;
  ventasMes: number;
  productosBajoStockLista: Producto[];
  ultimasAlertas: AlertaInventario[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private api = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) {}

  obtenerResumen(): Observable<DashboardResumen> {
    return this.http.get<DashboardResumen>(this.api);
  }
}