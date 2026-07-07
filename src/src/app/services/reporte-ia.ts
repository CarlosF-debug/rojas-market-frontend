import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type EstadoAlerta = 'Crítico' | 'Bajo' | 'Urgente' | 'Normal';

export interface AlertaInventario {
  productoId?: number;
  productoNombre: string;
  stockActual: number;
  stockMinimo: number;
  prediccionIA: string;
  estado: EstadoAlerta;
}

export interface ResumenReporteIA {
  productosStockBajo: number;
  productosAgotados: number;
  prediccionQuiebreSemana: number;
  proveedorTop: string;
  pedidosProveedorTop: number;
}

@Injectable({ providedIn: 'root' })
export class ReporteIaService {

  private api = 'http://localhost:8080/api/reportes-ia';

  constructor(private http: HttpClient) {}

  obtenerResumen(desde?: string, hasta?: string): Observable<ResumenReporteIA> {
    let url = `${this.api}/resumen`;
    if (desde && hasta) url += `?desde=${desde}&hasta=${hasta}`;
    return this.http.get<ResumenReporteIA>(url);
  }

  obtenerAlertas(): Observable<AlertaInventario[]> {
    return this.http.get<AlertaInventario[]>(`${this.api}/alertas`);
  }
}