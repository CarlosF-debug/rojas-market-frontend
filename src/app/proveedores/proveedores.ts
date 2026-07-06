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

interface Solicitud {

  proveedor: string;
  fecha: string;
  producto: string;
  cantidad: number;
  unidad: string;
  observaciones: string;

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

  solicitud: Solicitud = {

  proveedor: '',
  fecha: '',
  producto: '',
  cantidad: 1,
  unidad: 'Cajas',
  observaciones: ''

};

  mostrarModal = false;
  modoEdicion = false;

  mensaje = '';

tipoMensaje = '';

nuevoProveedorData: Proveedor = {
  codigo: '',
  nombre: '',
  contacto: '',
  telefono: '',
  correo: '',
  direccion: '',
  estado: 'Activo'
};

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

  nuevoProveedor() {

  this.modoEdicion = false;

  this.nuevoProveedorData = {
    codigo: '',
    nombre: '',
    contacto: '',
    telefono: '',
    correo: '',
    direccion: '',
    estado: 'Activo'
  };

  this.mostrarModal = true;

}

cerrarModal() {

  this.mostrarModal = false;

}

mostrarMensaje(mensaje: string, tipo: string) {

  this.mensaje = mensaje;

  this.tipoMensaje = tipo;

  setTimeout(() => {

    this.mensaje = '';

    this.tipoMensaje = '';

  }, 3000);

}

guardarProveedor() {

  // Validaciones

if (
  this.nuevoProveedorData.nombre.trim() === '' ||
  this.nuevoProveedorData.contacto.trim() === '' ||
  this.nuevoProveedorData.telefono.trim() === '' ||
  this.nuevoProveedorData.correo.trim() === '' ||
  this.nuevoProveedorData.direccion.trim() === ''
) {

  alert('Todos los campos son obligatorios.');

  return;

}

if (this.nuevoProveedorData.telefono.length !== 9) {

  alert('El teléfono debe tener 9 dígitos.');

  return;

}

const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!correoValido.test(this.nuevoProveedorData.correo)) {

  alert('Ingrese un correo electrónico válido.');

  return;

}

  if (this.modoEdicion) {

    const index = this.proveedores.findIndex(

      p => p.codigo === this.nuevoProveedorData.codigo

    );

    if (index !== -1) {

      this.proveedores[index] = { ...this.nuevoProveedorData };

    }

  } else {

   const nuevoCodigo = 'PR' + (this.proveedores.length + 1)
  .toString()
  .padStart(3, '0');

this.proveedores.push({

  codigo: nuevoCodigo,

  nombre: this.nuevoProveedorData.nombre,
  contacto: this.nuevoProveedorData.contacto,
  telefono: this.nuevoProveedorData.telefono,
  correo: this.nuevoProveedorData.correo,
  direccion: this.nuevoProveedorData.direccion,
  estado: this.nuevoProveedorData.estado

});

  }

  this.cerrarModal();

  this.mostrarMensaje(
  this.modoEdicion
    ? 'Proveedor actualizado correctamente.'
    : 'Proveedor registrado correctamente.',
  'success'
);

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

  this.mostrarMensaje(
    'Proveedor eliminado correctamente.',
    'success'
  );

}

  }

editarProveedor(proveedor: Proveedor) {

  this.nuevoProveedorData = { ...proveedor };

  this.modoEdicion = true;

  this.mostrarModal = true;

}

 verProveedor(proveedor: Proveedor) {

    this.proveedorSeleccionado = proveedor;

}

enviarSolicitud() {

  if (
    this.solicitud.proveedor.trim() === '' ||
    this.solicitud.fecha.trim() === '' ||
    this.solicitud.producto.trim() === '' ||
    this.solicitud.cantidad <= 0
  ) {

    this.mostrarMensaje(
      'Complete todos los campos de la solicitud.',
      'error'
    );

    return;

  }

  const nuevoNumero = 'PED-' + (this.pedidos.length + 1)
    .toString()
    .padStart(3, '0');

  this.pedidos.unshift({

    numero: nuevoNumero,
    proveedor: this.solicitud.proveedor,
    fecha: this.solicitud.fecha,
    total: 0,
    estado: 'Pendiente'

  });

  this.mostrarMensaje(
    'Solicitud enviada correctamente.',
    'success'
  );

  this.solicitud = {

    proveedor: '',
    fecha: '',
    producto: '',
    cantidad: 1,
    unidad: 'Cajas',
    observaciones: ''

  };

}



  }

