import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductoService, Producto } from '../services/producto';
import { CategoriaService, Categoria } from '../services/categoria';
import { AuthService } from '../services/auth';

type EstadoStock = 'normal' | 'bajo' | 'agotado';

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

  categorias: Categoria[] = [];
  categoriasSeleccionadas: number[] = [];
  estadosStockSeleccionados: EstadoStock[] = [];
  mostrarPanelFiltros = false;

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.nombre = this.auth.getNombre() || '';
    this.rol = this.auth.getRol() || '';
    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarProductos(): void {
    this.productoService.obtenerTodos().subscribe({
      next: (data) => {
        this.productos = data;
        this.aplicarFiltros();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarCategorias(): void {
    this.categoriaService.obtenerTodas().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.detectChanges();
      }
    });
  }

  filtrar(): void {
    this.aplicarFiltros();
  }

  togglePanelFiltros(): void {
    this.mostrarPanelFiltros = !this.mostrarPanelFiltros;
  }

  toggleCategoriaFiltro(id: number): void {
    const idx = this.categoriasSeleccionadas.indexOf(id);
    if (idx >= 0) this.categoriasSeleccionadas.splice(idx, 1);
    else this.categoriasSeleccionadas.push(id);
    this.aplicarFiltros();
  }

  toggleEstadoStockFiltro(estado: EstadoStock): void {
    const idx = this.estadosStockSeleccionados.indexOf(estado);
    if (idx >= 0) this.estadosStockSeleccionados.splice(idx, 1);
    else this.estadosStockSeleccionados.push(estado);
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.categoriasSeleccionadas = [];
    this.estadosStockSeleccionados = [];
    this.aplicarFiltros();
  }

  revisarCriticos(): void {
    this.mostrarPanelFiltros = true;
    if (!this.estadosStockSeleccionados.includes('bajo')) {
      this.estadosStockSeleccionados.push('bajo');
    }
    if (!this.estadosStockSeleccionados.includes('agotado')) {
      this.estadosStockSeleccionados.push('agotado');
    }
    this.aplicarFiltros();
  }

  get totalFiltrosActivos(): number {
    return this.categoriasSeleccionadas.length + this.estadosStockSeleccionados.length;
  }

  private aplicarFiltros(): void {
    const term = this.busqueda.toLowerCase().trim();

    this.productosFiltrados = this.productos.filter(p => {
      const coincideTexto = !term ||
        p.nombre.toLowerCase().includes(term) ||
        (p.descripcion || '').toLowerCase().includes(term) ||
        (p.categoriaNombre || '').toLowerCase().includes(term);

      const coincideCategoria = this.categoriasSeleccionadas.length === 0 ||
        (p.categoriaId != null && this.categoriasSeleccionadas.includes(p.categoriaId));

      const coincideStock = this.estadosStockSeleccionados.length === 0 ||
        this.estadosStockSeleccionados.includes(this.getEstadoStock(p));

      return coincideTexto && coincideCategoria && coincideStock;
    });
  }

  private getEstadoStock(p: Producto): EstadoStock {
    if (p.stock === 0) return 'agotado';
    if (p.stock <= p.stockMinimo) return 'bajo';
    return 'normal';
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