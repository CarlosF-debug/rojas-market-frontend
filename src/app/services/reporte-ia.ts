import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type NivelRiesgo = 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';

export interface AlertaInventario {
  id?: number;
  mensaje: string;
  nivelRiesgo: NivelRiesgo;
  fechaAlerta?: string;
  leida?: boolean;
  productoId?: number;
  productoNombre: string;
  stockActual: number;
  stockMinimo: number;
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

  private apiAlertas = 'http://localhost:8080/api/alertas';
  private apiResumen = 'http://localhost:8080/api/reportes-ia/resumen';

  constructor(private http: HttpClient) {}

  obtenerResumen(): Observable<ResumenReporteIA> {
    return this.http.get<ResumenReporteIA>(this.apiResumen);
  }

  obtenerAlertas(): Observable<AlertaInventario[]> {
    return this.http.get<AlertaInventario[]>(this.apiAlertas);
  }
}