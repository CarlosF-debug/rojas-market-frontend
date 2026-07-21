import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  id?: number;
  nombre: string;
  precio: number;
  stock: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private apiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) { }

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  guardarProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }
}