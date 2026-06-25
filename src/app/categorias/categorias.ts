import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 

// Definimos cómo es un Producto en el sistema
interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
  imagen: string;
  colorBadge: string;
}

// Definimos cómo es un elemento dentro del Ticket
interface ItemTicket {
  producto: Producto;
  cantidad: number;
  subtotal: number;
}

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule], // Permite usar *ngFor y *ngIf en el HTML
  templateUrl: './categorias.html',
  styleUrl: './categorias.css',
})
export class Categorias implements OnInit {
  
  // 1. VARIABLES DE ESTADO
  filtroActivo: string = 'Todos';
  
  // Lista simulada de productos
  productosTotales: Producto[] = [
    { id: 1, nombre: 'Leche Gloria 400g', precio: 4.50, stock: 45, categoria: 'Lácteos', imagen: 'https://pepsicobs.vtexassets.com/arquivos/ids/155452/Leche-Evaporada-Gloria-Caja-400-Gr.png', colorBadge: '#c0392b' },
    { id: 2, nombre: 'Arroz Extra 1kg', precio: 3.80, stock: 120, categoria: 'Abarrotes', imagen: 'https://plazavea.vteximg.com.br/arquivos/ids/28551469-512-512/20120516.jpg', colorBadge: '#d35400' },
    { id: 3, nombre: 'Inca Kola 2.5L', precio: 9.50, stock: 15, categoria: 'Bebidas', imagen: 'https://licoreriasunidas.pe/wp-content/uploads/2021/04/Inca-kola-2.25L.png', colorBadge: '#2980b9' },
    { id: 4, nombre: 'Detergente Líquido', precio: 12.00, stock: 2, categoria: 'Limpieza', imagen: 'https://plazavea.vteximg.com.br/arquivos/ids/28551469-512-512/20120516.jpg', colorBadge: '#16a085' }
  ];

  productosFiltrados: Producto[] = [];
  
  // Variables del Ticket
  ticket: ItemTicket[] = [];
  tasaIGV: number = 0.18; // 18% 

  ngOnInit(): void {
    // Al iniciar la pantalla, mostramos todos los productos
    this.productosFiltrados = [...this.productosTotales];
  }

  // ==========================================
  // LÓGICA DE FILTROS
  // ==========================================
  cambiarFiltro(categoria: string) {
    this.filtroActivo = categoria;
    if (categoria === 'Todos') {
      this.productosFiltrados = [...this.productosTotales];
    } else {
      this.productosFiltrados = this.productosTotales.filter(p => p.categoria.toUpperCase() === categoria.toUpperCase());
    }
  }

  // ==========================================
  // LÓGICA DEL TICKET (CARRITO)
  // ==========================================
  agregarAlTicket(producto: Producto) {
    const itemExistente = this.ticket.find(item => item.producto.id === producto.id);

    if (itemExistente) {
      if (itemExistente.cantidad < producto.stock) {
        itemExistente.cantidad++;
        itemExistente.subtotal = itemExistente.cantidad * producto.precio;
      } else {
        alert('No hay suficiente stock de este producto.');
      }
    } else {
      if (producto.stock > 0) {
        this.ticket.push({
          producto: producto,
          cantidad: 1,
          subtotal: producto.precio
        });
      }
    }
  }

  aumentarCantidad(item: ItemTicket) {
    if (item.cantidad < item.producto.stock) {
      item.cantidad++;
      item.subtotal = item.cantidad * item.producto.precio;
    }
  }

  disminuirCantidad(item: ItemTicket) {
    if (item.cantidad > 1) {
      item.cantidad--;
      item.subtotal = item.cantidad * item.producto.precio;
    } else {
      this.eliminarDelTicket(item);
    }
  }

  eliminarDelTicket(item: ItemTicket) {
    this.ticket = this.ticket.filter(i => i.producto.id !== item.producto.id);
  }

  limpiarTicket() {
    this.ticket = [];
  }

  // ==========================================
  // LÓGICA DE MATEMÁTICAS (TOTALES)
  // ==========================================
  get subtotalTicket(): number {
    const totalConIgv = this.ticket.reduce((sum, item) => sum + item.subtotal, 0);
    return totalConIgv / (1 + this.tasaIGV);
  }

  get igvTicket(): number {
    return this.subtotalTicket * this.tasaIGV;
  }

  get totalPagar(): number {
    return this.subtotalTicket + this.igvTicket;
  }

  cobrar() {
    if (this.ticket.length === 0) {
      alert('El ticket está vacío. Agregue productos primero.');
      return;
    }
    alert(`¡Cobro exitoso por S/ ${this.totalPagar.toFixed(2)}!`);
    this.limpiarTicket();
  }
}