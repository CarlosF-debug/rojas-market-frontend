import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CategoriaService, Categoria } from '../services/categoria';
import { AuthService } from '../services/auth';

type PestanaAjustes = 'perfil' | 'categorias';

@Component({
  selector: 'app-ajustes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ajustes.html',
  styleUrl: './ajustes.css'
})
export class Ajustes implements OnInit {

  nombre = '';
  rol = '';
  correo = '';

  pestanaActiva: PestanaAjustes = 'perfil';

  categorias: Categoria[] = [];
  cargando = true;

  mostrarModal = false;
  modoEdicion = false;
  categoriaActual: Categoria = this.categoriaVacia();

  constructor(
    private categoriaService: CategoriaService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.nombre = this.auth.getNombre() || '';
    this.rol = this.auth.getRol() || '';
    this.correo = this.auth.getCorreo() || '';
    this.cargarCategorias();
  }

  cambiarPestana(p: PestanaAjustes): void {
    this.pestanaActiva = p;
  }

  cargarCategorias(): void {
    this.cargando = true;
    this.categoriaService.obtenerTodas().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirNueva(): void {
    this.categoriaActual = this.categoriaVacia();
    this.modoEdicion = false;
    this.mostrarModal = true;
  }

  abrirEditar(cat: Categoria): void {
    this.categoriaActual = { ...cat };
    this.modoEdicion = true;
    this.mostrarModal = true;
  }

  guardar(): void {
    if (this.modoEdicion && this.categoriaActual.id) {
      this.categoriaService.actualizar(this.categoriaActual.id, this.categoriaActual).subscribe({
        next: () => { this.mostrarModal = false; this.cargarCategorias(); }
      });
    } else {
      this.categoriaService.crear(this.categoriaActual).subscribe({
        next: () => { this.mostrarModal = false; this.cargarCategorias(); }
      });
    }
  }

  eliminar(id: number): void {
    if (confirm('¿Eliminar esta categoría? Los productos que la tengan asignada quedarán sin categoría.')) {
      this.categoriaService.eliminar(id).subscribe({
        next: () => this.cargarCategorias()
      });
    }
  }

  private categoriaVacia(): Categoria {
    return { nombre: '', descripcion: '' };
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}