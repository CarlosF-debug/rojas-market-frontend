import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductoService, Producto } from '../services/producto';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class Productos implements OnInit {

  nombre = '';
  rol = '';
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  busqueda = '';
  cargando = true;
  mostrarModal = false;
  modoEdicion = false;
  productoActual: Producto = this.productoVacio();

  constructor(
    private productoService: ProductoService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.nombre = this.auth.getNombre() || '';
    this.rol = this.auth.getRol() || '';
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.obtenerTodos().subscribe({
      next: (data) => {
        this.productos = data;
        this.productosFiltrados = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrar(): void {
    const term = this.busqueda.toLowerCase();
    this.productosFiltrados = this.productos.filter(p =>
      p.nombre.toLowerCase().includes(term)
    );
  }

  abrirNuevo(): void {
    this.productoActual = this.productoVacio();
    this.modoEdicion = false;
    this.mostrarModal = true;
  }

  abrirEditar(producto: Producto): void {
    this.productoActual = { ...producto };
    this.modoEdicion = true;
    this.mostrarModal = true;
  }

  guardar(): void {
    if (this.modoEdicion && this.productoActual.id) {
      this.productoService.actualizar(this.productoActual.id, this.productoActual).subscribe({
        next: () => { this.mostrarModal = false; this.cargarProductos(); }
      });
    } else {
      this.productoService.crear(this.productoActual).subscribe({
        next: () => { this.mostrarModal = false; this.cargarProductos(); }
      });
    }
  }

  eliminar(id: number): void {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productoService.eliminar(id).subscribe({
        next: () => this.cargarProductos()
      });
    }
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private productoVacio(): Producto {
    return {
      nombre: '', descripcion: '', precio: 0,
      stock: 0, stockMinimo: 0, estado: true
    };
  }

  getStockClass(p: Producto): string {
    if (p.stock === 0) return 'badge-critico';
    if (p.stock <= p.stockMinimo) return 'badge-bajo';
    return 'badge-normal';
  }

  getStockLabel(p: Producto): string {
    if (p.stock === 0) return 'Agotado';
    if (p.stock <= p.stockMinimo) return 'Bajo';
    return 'Normal';
  }
}