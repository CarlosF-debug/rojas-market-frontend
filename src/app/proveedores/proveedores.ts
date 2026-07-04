import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Proveedor {
  codigo: string;
  nombre: string;
  contacto: string;
  telefono: string;
  correo: string;
  direccion: string;
  estado: string;
}

interface Pedido {
  numero: string;
  proveedor: string;
  fecha: string;
  total: number;
  estado: string;
}

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './proveedores.html',
  styleUrls: ['./proveedores.css']
})

export class Proveedores {

  constructor(private router: Router) {}

  buscar = '';

  proveedorSeleccionado: Proveedor | null = null;

  proveedores: Proveedor[] = [

    {
      codigo:'PR001',
      nombre:'Distribuidora Coca Cola',
      contacto:'Juan Pérez',
      telefono:'987654321',
      correo:'ventas@cocacola.com',
      direccion:'Av. La Marina 1234',
      estado:'Activo'
    },

    {
      codigo:'PR002',
      nombre:'Tecno Import SAC',
      contacto:'María Díaz',
      telefono:'965874123',
      correo:'pedidos@tecno.com',
      direccion:'Av. Canadá 510',
      estado:'Activo'
    },

    {
      codigo:'PR003',
      nombre:'San Miguel Distribuciones',
      contacto:'Luis García',
      telefono:'912345678',
      correo:'contacto@sanmiguel.com',
      direccion:'Av. Universitaria 222',
      estado:'Activo'
    },

    {
      codigo:'PR004',
      nombre:'Embotelladora San Luis',
      contacto:'Pedro Ramos',
      telefono:'944221100',
      correo:'ventas@sanluis.com',
      direccion:'Av. Colonial 1020',
      estado:'Activo'
    },

    {
      codigo:'PR005',
      nombre:'Inversiones Luna SAC',
      contacto:'Ana Luna',
      telefono:'901112223',
      correo:'info@luna.com',
      direccion:'Av. Javier Prado',
      estado:'Activo'
    },

    {
      codigo:'PR006',
      nombre:'Distribuidora Don Paco',
      contacto:'Francisco Rojas',
      telefono:'933445566',
      correo:'pedidos@donpaco.com',
      direccion:'Av. México 555',
      estado:'Inactivo'
    }

  ];

    pedidos: Pedido[] = [

    {
      numero:'PED-001',
      proveedor:'Distribuidora Coca Cola',
      fecha:'23/06/2026',
      total:1250,
      estado:'Entregado'
    },

    {
      numero:'PED-002',
      proveedor:'Tecno Import SAC',
      fecha:'25/06/2026',
      total:850,
      estado:'Enviado'
    },

    {
      numero:'PED-003',
      proveedor:'San Miguel Distribuciones',
      fecha:'26/06/2026',
      total:620,
      estado:'Confirmado'
    },

    {
      numero:'PED-004',
      proveedor:'Embotelladora San Luis',
      fecha:'27/06/2026',
      total:980,
      estado:'Pendiente'
    },

    {
      numero:'PED-005',
      proveedor:'Distribuidora Don Paco',
      fecha:'28/06/2026',
      total:430,
      estado:'Cancelado'
    }

  ];

  seleccionarProveedor(proveedor: Proveedor){

    this.proveedorSeleccionado = proveedor;

  }

  nuevoProveedor(){

    alert('Aquí se abrirá el formulario para registrar un nuevo proveedor.');

  }

  nuevoPedido(){

    alert('Aquí se abrirá el formulario para crear un nuevo pedido.');

  }

  historialCompras(){

    if(this.proveedorSeleccionado){

      alert('Mostrando historial de compras de ' + this.proveedorSeleccionado.nombre);

    }

  }

  cerrarSesion(){

    this.router.navigate(['/login']);

  }

    buscarProveedor() {

    if (this.buscar.trim() === '') {
      return this.proveedores;
    }

    return this.proveedores.filter(p =>

      p.nombre.toLowerCase().includes(this.buscar.toLowerCase()) ||

      p.codigo.toLowerCase().includes(this.buscar.toLowerCase()) ||

      p.contacto.toLowerCase().includes(this.buscar.toLowerCase())

    );

  }

  eliminarProveedor(codigo: string) {

    const confirmar = confirm('¿Desea eliminar este proveedor?');

    if (confirmar) {

      this.proveedores = this.proveedores.filter(

        p => p.codigo !== codigo

      );

    }

  }

  editarProveedor(proveedor: Proveedor) {

    alert('Editar proveedor: ' + proveedor.nombre);

  }

  verProveedor(proveedor: Proveedor) {

    this.proveedorSeleccionado = proveedor;

    alert('Visualizando información de ' + proveedor.nombre);

  }

  enviarSolicitud() {

    alert('Solicitud enviada correctamente al proveedor.');

  }

}