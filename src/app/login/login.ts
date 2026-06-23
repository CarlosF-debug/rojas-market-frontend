import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  correo = '';
  contrasena = '';
  error = '';
  cargando = false;
  mostrarPassword = false;
  recordar = false;

  constructor(private auth: AuthService, private router: Router) {}

  ingresar(): void {
    if (!this.correo || !this.contrasena) {
      this.error = 'Completa todos los campos';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.auth.login({ correo: this.correo, contrasena: this.contrasena }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error = 'Correo o contraseña incorrectos';
        this.cargando = false;
      }
    });
  }
}