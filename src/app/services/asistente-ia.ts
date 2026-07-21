import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RespuestaAsistente {
  respuesta: string;
}

@Injectable({ providedIn: 'root' })
export class AsistenteIaService {

  private api = `${environment.apiUrl}/asistente-ia`;

  constructor(private http: HttpClient) {}

  enviarMensaje(mensaje: string): Observable<RespuestaAsistente> {
    return this.http.post<RespuestaAsistente>(`${this.api}/chat`, { mensaje });
  }
}