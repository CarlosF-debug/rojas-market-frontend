import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DetalleVenta {
  productoId: number;
  productoNombre?: string;
  cantidad: number;
  precioUnitario?: number;
  subtotal?: number;
}

export interface Venta {
  id?: number;
  fechaVenta?: string;
  total?: number;
  estado?: string;
  cajeroNombre?: string;
  detalles: DetalleVenta[];
}

@Injectable({ providedIn: 'root' })
export class VentaService {

  private api = 'http://localhost:8080/api/ventas';

  constructor(private http: HttpClient) {}

  obtenerTodas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.api);
  }

  crear(venta: Venta): Observable<Venta> {
    return this.http.post<Venta>(this.api, venta);
  }

  anular(id: number): Observable<void> {
    return this.http.patch<void>(`${this.api}/${id}/anular`, {});
  }
}