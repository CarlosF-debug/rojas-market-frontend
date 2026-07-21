import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type EstadoProveedor = 'ACTIVO' | 'INACTIVO';

export interface Proveedor {
  id?: number;
  codigo?: string;
  nombre: string;
  telefono?: string;
  direccion?: string;
  correo?: string;
  ruc?: string;
  contacto?: string;
  productosSuministrados?: string;
  estado: EstadoProveedor;
}

@Injectable({ providedIn: 'root' })
export class ProveedorService {

  private api = `${environment.apiUrl}/proveedores`;

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.api);
  }

  obtenerPorId(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.api}/${id}`);
  }

  crear(proveedor: Proveedor): Observable<Proveedor> {
    return this.http.post<Proveedor>(this.api, proveedor);
  }

  actualizar(id: number, proveedor: Proveedor): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.api}/${id}`, proveedor);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}