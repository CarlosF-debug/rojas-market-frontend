import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Proveedor {
  id?: number;
  codigo?: string;
  nombre: string;
  ruc?: string;
  contacto: string;
  telefono: string;
  correo: string;
  direccion?: string;
  productosSuministrados?: string;
  estado: 'Activo' | 'Inactivo';
}

@Injectable({ providedIn: 'root' })
export class ProveedorService {

  private api = 'http://localhost:8080/api/proveedores';

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