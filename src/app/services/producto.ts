import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  id?: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  fechaVencimiento?: string;
  estado?: boolean;
  categoriaId?: number;
  categoriaNombre?: string;
  proveedorId?: number;
  proveedorNombre?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductoService {

  private api = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.api);
  }

  obtenerPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.api}/${id}`);
  }

  crear(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.api, producto);
  }

  actualizar(id: number, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.api}/${id}`, producto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  bajoStock(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.api}/bajo-stock`);
  }

  buscar(nombre: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.api}/buscar?nombre=${nombre}`);
  }
}