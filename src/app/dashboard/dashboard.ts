import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';
import { DashboardService, DashboardResumen } from '../services/dashboard';
import { NivelRiesgo } from '../services/reporte-ia';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  nombre = '';
  rol = '';
  busqueda = '';
  cargando = true;

  resumen: DashboardResumen = {
    totalProductos: 0,
    productosBajoStock: 0,
    alertasNoLeidas: 0,
    ventasHoy: 0,
    cantidadVentasHoy: 0,
    ventasMes: 0,
    productosBajoStockLista: [],
    ultimasAlertas: []
  };

  constructor(
    private auth: AuthService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.nombre = this.auth.getNombre() || 'Usuario';
    this.rol = this.auth.getRol() || '';
    this.cargarResumen();
  }

  cargarResumen(): void {
    this.cargando = true;
    this.dashboardService.obtenerResumen().subscribe({
      next: (data) => {
        this.resumen = data;
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