import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type EstadoPedido = 'Pendiente' | 'Enviado' | 'Confirmado' | 'Entregado' | 'Cancelado';

export interface Pedido {
  id?: number;
  numero?: string;
  proveedorId: number;
  proveedorNombre?: string;
  fecha?: string;
  total: number;
  estado: EstadoPedido;
}

export interface ItemSolicitud {
  productoId?: number;
  nombre: string;
  cantidad: number;
  unidad: string;
}

export interface SolicitudCompra {
  id?: number;
  proveedorId: number;
  fechaSolicitud: string;
  observaciones?: string;
  productos: ItemSolicitud[];
}

@Injectable({ providedIn: 'root' })
export class PedidoService {

  private api = 'http://localhost:8080/api/pedidos';
  private apiSolicitudes = 'http://localhost:8080/api/solicitudes-compra';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.api);
  }

  obtenerPorEstado(estado: EstadoPedido): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.api}?estado=${estado}`);
  }

  crear(pedido: Pedido): Observable<Pedido> {
    return this.http.post<Pedido>(this.api, pedido);
  }

  actualizarEstado(id: number, estado: EstadoPedido): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.api}/${id}/estado`, { estado });
  }

  crearSolicitud(solicitud: SolicitudCompra): Observable<SolicitudCompra> {
    return this.http.post<SolicitudCompra>(this.apiSolicitudes, solicitud);
  }
}