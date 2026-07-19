import { Directive, HostListener, Input } from '@angular/core';

/**
 * Uso:
 *   <input type="text" appSoloNumeros />                          → solo enteros (ej. stock, cantidad)
 *   <input type="text" appSoloNumeros [appSoloNumerosDecimal]="true" /> → acepta un punto decimal (ej. precio, dinero)
 *
 * Bloquea letras, símbolos y texto pegado que no sea numérico, directamente
 * en el teclado del usuario (no solo al enviar el formulario).
 */
@Directive({
  selector: '[appSoloNumeros]',
  standalone: true,
})
export class SoloNumerosDirective {

  @Input() appSoloNumerosDecimal = false;

  private teclasPermitidas = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'
  ];

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Permite atajos como Ctrl+C, Ctrl+V, Ctrl+A, Cmd+C, etc.
    if (event.ctrlKey || event.metaKey) return;

    if (this.teclasPermitidas.includes(event.key)) return;

    const input = event.target as HTMLInputElement;
    const esDigito = /^[0-9]$/.test(event.key);
    const esPuntoDecimal = this.appSoloNumerosDecimal && event.key === '.' && !input.value.includes('.');

    if (!esDigito && !esPuntoDecimal) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const texto = event.clipboardData?.getData('text') || '';
    const regex = this.appSoloNumerosDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
    if (!regex.test(texto)) {
      event.preventDefault();
    }
  }
}