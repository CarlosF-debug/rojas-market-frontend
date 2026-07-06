import { Component } from '@angular/core';

@Component({
  selector: 'app-categorias',
  templateUrl: 'categorias.html',
  styleUrls: ['categorias.css']
})
export class Categorias {

  productos = [
    {
      nombre: 'Leche Gloria',
      precio: 4.50,
      stock: 45,
      categoria: 'Lácteos'
    },
    {
      nombre: 'Arroz Extra',
      precio: 3.80,
      stock: 120,
      categoria: 'Abarrotes'
    },
    {
      nombre: 'Inca Kola',
      precio: 9.50,
      stock: 15,
      categoria: 'Bebidas'
    }
  ];

  carrito: any[] = [];

  agregarProducto(producto: any) {
    const existe = this.carrito.find(p => p.nombre === producto.nombre);

    if (existe) {
      existe.cantidad++;
    } else {
      this.carrito.push({
        ...producto,
        cantidad: 1
      });
    }
  }

  get subtotal(): number {
    return this.carrito.reduce(
      (acc, item) => acc + (item.precio * item.cantidad), 0
    );
  }

  get igv(): number {
    return this.subtotal * 0.18;
  }

  get total(): number {
    return this.subtotal + this.igv;
  }

  limpiarCarrito() {
    this.carrito = [];
  }
}