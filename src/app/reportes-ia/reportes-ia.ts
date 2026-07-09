import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ReporteIaService, AlertaInventario, ResumenReporteIA, NivelRiesgo } from '../services/reporte-ia';
import { AuthService } from '../services/auth';

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

  resumen: ResumenReporteIA = {
    productosStockBajo: 0,
    productosAgotados: 0,
    prediccionQuiebreSemana: 0,
    proveedorTop: '',
    pedidosProveedorTop: 0
  };

  alertas: AlertaInventario[] = [];
  cargando = true;

  constructor(
    private reporteService: ReporteIaService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.nombre = this.auth.getNombre() || '';
    this.rol = this.auth.getRol() || '';
    this.actualizarDatos();
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