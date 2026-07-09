import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProveedorService, Proveedor } from '../services/proveedor';
import { PedidoService, Pedido, EstadoPedido, SolicitudCompra } from '../services/pedido';
import { AuthService } from '../services/auth';

type FiltroPedido = 'Todos' | EstadoPedido;

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.css'
})
export class Proveedores implements OnInit {

  nombre = '';
  rol = '';
  busqueda = '';

  proveedores: Proveedor[] = [];
  proveedoresFiltrados: Proveedor[] = [];
  cargandoProveedores = true;
  proveedorSeleccionado: Proveedor | null = null;

  mostrarModal = false;
  modoEdicion = false;
  proveedorActual: Proveedor = this.proveedorVacio();

  mostrarSolicitud = false;
  nuevaSolicitud: SolicitudCompra = this.solicitudVacia();

  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  cargandoPedidos = true;
  filtroPedido: FiltroPedido = 'Todos';
  paginaActual = 1;
  pedidosPorPagina = 5;
  mostrarDetallePedido = false;
  detallePedido: SolicitudCompra | null = null;
  cargandoDetalle = false;

  constructor(
    private proveedorService: ProveedorService,
    private pedidoService: PedidoService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.nombre = this.auth.getNombre() || '';
    this.rol = this.auth.getRol() || '';
    this.cargarProveedores();
    this.cargarPedidos();
  }

  cargarProveedores(): void {
    this.cargandoProveedores = true;
    this.proveedorService.obtenerTodos().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.proveedoresFiltrados = data;
        this.cargandoProveedores = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoProveedores = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrar(): void {
    const term = this.busqueda.toLowerCase();
    this.proveedoresFiltrados = this.proveedores.filter(p =>
      p.nombre.toLowerCase().includes(term) ||
      (p.contacto || '').toLowerCase().includes(term)
    );
  }

  verProveedor(p: Proveedor): void {
    this.proveedorSeleccionado = p;
  }

  abrirNuevo(): void {
    this.proveedorActual = this.proveedorVacio();
    this.modoEdicion = false;
    this.mostrarModal = true;
  }

  abrirEditar(p: Proveedor): void {
    this.proveedorActual = { ...p };
    this.modoEdicion = true;
    this.mostrarModal = true;
  }

  guardarProveedor(): void {
    if (this.modoEdicion && this.proveedorActual.id) {
      this.proveedorService.actualizar(this.proveedorActual.id, this.proveedorActual).subscribe({
        next: () => { this.mostrarModal = false; this.cargarProveedores(); }
      });
    } else {
      this.proveedorService.crear(this.proveedorActual).subscribe({
        next: () => { this.mostrarModal = false; this.cargarProveedores(); }
      });
    }
  }

  eliminarProveedor(id: number): void {
    if (confirm('¿Estás seguro de eliminar este proveedor?')) {
      this.proveedorService.eliminar(id).subscribe({
        next: () => {
          if (this.proveedorSeleccionado?.id === id) this.proveedorSeleccionado = null;
          this.cargarProveedores();
        }
      });
    }
  }

  private proveedorVacio(): Proveedor {
    return { nombre: '', contacto: '', telefono: '', correo: '', estado: 'ACTIVO' };
  }

  abrirSolicitud(): void {
    this.nuevaSolicitud = this.solicitudVacia();
    this.mostrarSolicitud = true;
  }

  cerrarSolicitud(): void {
    this.mostrarSolicitud = false;
  }

  agregarItemSolicitud(): void {
    this.nuevaSolicitud.productos.push({ nombre: '', cantidad: 1, unidad: 'Unidades' });
  }

  quitarItemSolicitud(index: number): void {
    this.nuevaSolicitud.productos.splice(index, 1);
  }

  guardarSolicitud(): void {
    this.pedidoService.crearSolicitud(this.nuevaSolicitud).subscribe({
      next: () => {
        this.mostrarSolicitud = false;
        this.cargarPedidos();
      }
    });
  }

  private solicitudVacia(): SolicitudCompra {
    return {
      proveedorId: 0,
      fechaSolicitud: new Date().toISOString().substring(0, 10),
      observaciones: '',
      productos: [{ nombre: '', cantidad: 1, unidad: 'Unidades' }]
    };
  }

  cargarPedidos(): void {
    this.cargandoPedidos = true;
    this.pedidoService.obtenerTodos().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.aplicarFiltroPedidos();
        this.cargandoPedidos = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoPedidos = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarFiltroPedido(filtro: FiltroPedido): void {
    this.filtroPedido = filtro;
    this.paginaActual = 1;
    this.aplicarFiltroPedidos();
  }

  private aplicarFiltroPedidos(): void {
    this.pedidosFiltrados = this.filtroPedido === 'Todos'
      ? this.pedidos
      : this.pedidos.filter(p => p.estado === this.filtroPedido);
  }

  get pedidosPagina(): Pedido[] {
    const inicio = (this.paginaActual - 1) * this.pedidosPorPagina;
    return this.pedidosFiltrados.slice(inicio, inicio + this.pedidosPorPagina);
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.pedidosFiltrados.length / this.pedidosPorPagina));
  }

  irPagina(delta: number): void {
    const nueva = this.paginaActual + delta;
    if (nueva >= 1 && nueva <= this.totalPaginas) this.paginaActual = nueva;
  }

  verDetallePedido(ped: Pedido): void {
    this.mostrarDetallePedido = true;
    this.detallePedido = null;
    this.cargandoDetalle = true;
    this.pedidoService.obtenerSolicitudPorPedido(ped.id!).subscribe({
      next: (data) => {
        this.detallePedido = data;
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarDetallePedido(): void {
    this.mostrarDetallePedido = false;
    this.detallePedido = null;
  }

  cambiarEstadoPedido(ped: Pedido, nuevoEstado: string): void {
    this.pedidoService.actualizarEstado(ped.id!, nuevoEstado as EstadoPedido).subscribe({
      next: () => this.cargarPedidos()
    });
  }

  imprimirPedido(ped: Pedido): void {
    const contenido = `
      <html>
        <head>
          <title>Pedido ${ped.numero}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a2e; }
            h1 { color: #c0392b; margin-bottom: 0; }
            h2 { color: #555; font-weight: 400; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            td { padding: 10px 0; border-bottom: 1px solid #eee; }
            td:first-child { font-weight: 600; width: 160px; }
          </style>
        </head>
        <body>
          <h1>Rojas Market</h1>
          <h2>Comprobante de Pedido ${ped.numero}</h2>
          <table>
            <tr><td>Proveedor</td><td>${ped.proveedorNombre}</td></tr>
            <tr><td>Fecha</td><td>${ped.fecha}</td></tr>
            <tr><td>Estado</td><td>${this.getEstadoLabel(ped.estado)}</td></tr>
            <tr><td>Total</td><td>S/ ${ped.total.toFixed(2)}</td></tr>
          </table>
        </body>
      </html>`;
    const ventana = window.open('', '_blank', 'width=600,height=700');
    if (ventana) {
      ventana.document.write(contenido);
      ventana.document.close();
      ventana.focus();
      ventana.print();
    }
  }

  getEstadoClass(estado: EstadoPedido): string {
    switch (estado) {
      case 'ENTREGADO': return 'estado-entregado';
      case 'ENVIADO': return 'estado-enviado';
      case 'CONFIRMADO': return 'estado-confirmado';
      case 'CANCELADO': return 'estado-cancelado';
      default: return 'estado-pendiente';
    }
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      ACTIVO: 'Activo', INACTIVO: 'Inactivo',
      PENDIENTE: 'Pendiente', ENVIADO: 'Enviado',
      CONFIRMADO: 'Confirmado', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado'
    };
    return labels[estado] || estado;
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}