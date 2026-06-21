import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';
import { ProductoService } from '../services/producto';

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
  totalProductos = 0;
  productosBajoStock = 0;
  cargando = true;
  busqueda = '';

  constructor(
    private auth: AuthService,
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.nombre = this.auth.getNombre() || 'Usuario';
    this.rol = this.auth.getRol() || '';
    this.cargarResumen();
  }

  cargarResumen(): void {
    this.productoService.obtenerTodos().subscribe({
      next: (productos) => {
        this.totalProductos = productos.length;
        this.productosBajoStock = productos.filter(
          p => p.stockMinimo != null && p.stock <= p.stockMinimo
        ).length;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Error:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}