import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ReporteIaService, AlertaInventario, ResumenReporteIA, NivelRiesgo } from '../services/reporte-ia';
import { AsistenteIaService } from '../services/asistente-ia';
import { AuthService } from '../services/auth';

type PestanaReportes = 'resumen' | 'asistente';

interface MensajeChat {
  rol: 'usuario' | 'asistente';
  texto: string;
}

@Component({
  selector: 'app-reportes-ia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reportes-ia.html',
  styleUrl: './reportes-ia.css'
})
export class ReportesIa implements OnInit {

  nombre = '';
  rol = '';
  busqueda = '';

  pestanaActiva: PestanaReportes = 'resumen';

  resumen: ResumenReporteIA = {
    productosStockBajo: 0,
    productosAgotados: 0,
    prediccionQuiebreSemana: 0,
    proveedorTop: '',
    pedidosProveedorTop: 0
  };

  alertas: AlertaInventario[] = [];
  cargando = true;

  // Chat del asistente
  mensajes: MensajeChat[] = [
    { rol: 'asistente', texto: '¡Hola! Soy el asistente de Rojas Market. Pregúntame sobre stock bajo, alertas, productos más vendidos o pedidos pendientes.' }
  ];
  mensajeActual = '';
  enviandoMensaje = false;

  constructor(
    private reporteService: ReporteIaService,
    private asistenteService: AsistenteIaService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.nombre = this.auth.getNombre() || '';
    this.rol = this.auth.getRol() || '';
    this.actualizarDatos();
  }

  cambiarPestana(p: PestanaReportes): void {
    this.pestanaActiva = p;
  }

  actualizarDatos(): void {
    this.cargando = true;

    this.reporteService.obtenerResumen().subscribe({
      next: (data) => {
        this.resumen = data;
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });

    this.reporteService.obtenerAlertas().subscribe({
      next: (data) => {
        this.alertas = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  descargarInforme(): void {
    this.reporteService.descargarExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = 'informe-rojas-market.xlsx';
        enlace.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('No se pudo generar el informe. Intenta nuevamente.')
    });
  }

  enviarMensaje(): void {
    const texto = this.mensajeActual.trim();
    if (!texto || this.enviandoMensaje) return;

    this.mensajes.push({ rol: 'usuario', texto });
    this.mensajeActual = '';
    this.enviandoMensaje = true;

    this.asistenteService.enviarMensaje(texto).subscribe({
      next: (res) => {
        this.mensajes.push({ rol: 'asistente', texto: res.respuesta });
        this.enviandoMensaje = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajes.push({ rol: 'asistente', texto: 'Ocurrió un error al consultar el asistente. Intenta nuevamente.' });
        this.enviandoMensaje = false;
        this.cdr.detectChanges();
      }
    });
  }

  getEstadoClass(nivel: NivelRiesgo): string {
    switch (nivel) {
      case 'CRITICO': return 'estado-critico';
      case 'ALTO': return 'estado-urgente';
      case 'MEDIO': return 'estado-bajo';
      default: return 'estado-normal';
    }
  }

  getNivelLabel(nivel: NivelRiesgo): string {
    const labels: Record<NivelRiesgo, string> = {
      CRITICO: 'Crítico', ALTO: 'Urgente', MEDIO: 'Bajo', BAJO: 'Normal'
    };
    return labels[nivel] || nivel;
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}