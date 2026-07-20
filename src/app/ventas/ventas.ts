import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as QRCode from 'qrcode';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { ProductoService, Producto } from '../services/producto';
import { CategoriaService, Categoria } from '../services/categoria';
import { AuthService } from '../services/auth';
import { VentaService, Venta } from '../services/venta';
import { SoloNumerosDirective } from '../directives/solo-numeros.directive';

// ===================== TYPES =====================

interface CartItem {
  product: Producto;
  qty: number;
}

// Solo 3 métodos: Efectivo (con boleta), Yape/Plin (QR simulado con Stripe), Tarjeta (Stripe)
type PaymentMethod = 'efectivo' | 'yape' | 'tarjeta';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, SoloNumerosDirective],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css',
})
export class Ventas implements OnInit, AfterViewInit, OnDestroy {

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private ventaService: VentaService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    public router: Router
  ) {}

  // ===================== SIDEBAR / TOPBAR =====================

  nombre = '';
  rol = '';
  busqueda = '';

  ngOnInit(): void {
    this.nombre = this.auth.getNombre() || '';
    this.rol = this.auth.getRol() || '';
    this.cargarProductos();
    this.cargarCategorias();
  }

  ngAfterViewInit(): void {
    this.initStripe();
  }

  ngOnDestroy(): void {
    this.detenerPollingQR();
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  // ===================== PRODUCTS (desde la base de datos) =====================

  productos: Producto[] = [];
  cargando = true;

  cargarProductos(): void {
    this.cargando = true;
    this.productoService.obtenerTodos().subscribe({
      next: (data) => {
        this.productos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ===================== CATEGORÍAS =====================

  categorias: Categoria[] = [];
  categoriaSeleccionada = 0; // 0 = "Todas las categorías"

  cargarCategorias(): void {
    this.categoriaService.obtenerTodas().subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.detectChanges();
      }
    });
  }

  onCategoriaChange(): void {
    this.currentPage = 1;
  }

  // Helper para mostrar foto del producto si tu backend la envía (campo opcional,
  // aún no existe en tu interfaz Producto). Si no hay imagen, no se muestra nada.
  getImagen(p: Producto): string | undefined {
    return (p as any).imagenUrl;
  }

  // Como los productos vienen de tu base de datos (no tienen un campo "emoji"),
  // se asigna un ícono aproximado según palabras clave en el nombre.
  // Si no coincide con nada, se usa 📦 como ícono genérico.
  private static readonly EMOJI_POR_PALABRA: { palabra: string; emoji: string }[] = [
    { palabra: 'coca cola', emoji: '🥤' },
    { palabra: 'inka cola', emoji: '🥤' },
    { palabra: 'inca kola', emoji: '🥤' },
    { palabra: 'gaseosa', emoji: '🥤' },
    { palabra: 'agua', emoji: '💧' },
    { palabra: 'jugo', emoji: '🧃' },
    { palabra: 'leche', emoji: '🥛' },
    { palabra: 'cerveza', emoji: '🍺' },
    { palabra: 'vino', emoji: '🍷' },
    { palabra: 'oreo', emoji: '🍪' },
    { palabra: 'galleta', emoji: '🍪' },
    { palabra: 'chocolate', emoji: '🍫' },
    { palabra: 'caramelo', emoji: '🍬' },
    { palabra: 'halls', emoji: '🍬' },
    { palabra: 'papas', emoji: '🍟' },
    { palabra: 'arroz', emoji: '🍚' },
    { palabra: 'azucar', emoji: '🧂' },
    { palabra: 'azúcar', emoji: '🧂' },
    { palabra: 'sal', emoji: '🧂' },
    { palabra: 'aceite', emoji: '🫙' },
    { palabra: 'fideo', emoji: '🍝' },
    { palabra: 'pasta', emoji: '🍝' },
    { palabra: 'atun', emoji: '🥫' },
    { palabra: 'atún', emoji: '🥫' },
    { palabra: 'conserva', emoji: '🥫' },
    { palabra: 'detergente', emoji: '🧴' },
    { palabra: 'jabon', emoji: '🧼' },
    { palabra: 'jabón', emoji: '🧼' },
    { palabra: 'shampoo', emoji: '🧴' },
    { palabra: 'pan', emoji: '🍞' },
    { palabra: 'huevo', emoji: '🥚' },
    { palabra: 'pollo', emoji: '🍗' },
    { palabra: 'carne', emoji: '🥩' },
    { palabra: 'manzana', emoji: '🍎' },
    { palabra: 'platano', emoji: '🍌' },
    { palabra: 'plátano', emoji: '🍌' },
    { palabra: 'mouse', emoji: '🖱️' },
    { palabra: 'teclado', emoji: '⌨️' },
    { palabra: 'audifono', emoji: '🎧' },
    { palabra: 'audífono', emoji: '🎧' },
    { palabra: 'cargador', emoji: '🔌' },
    { palabra: 'casino', emoji: '🎰' },
    { palabra: 'naipe', emoji: '🃏' },
    { palabra: 'cigarro', emoji: '🚬' },
  ];

  getEmoji(p: Producto): string {
    const nombre = (p.nombre || '').toLowerCase();
    const encontrado = Ventas.EMOJI_POR_PALABRA.find((e) => nombre.includes(e.palabra));
    return encontrado ? encontrado.emoji : '📦';
  }

  productsPerPage = 12;
  currentPage = 1;
  searchTerm = '';

  get filteredProducts(): Producto[] {
    return this.productos.filter((p) => {
      const coincideTexto = (p.nombre || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      const coincideCategoria = this.categoriaSeleccionada === 0 || p.categoriaId === this.categoriaSeleccionada;
      return coincideTexto && coincideCategoria;
    });
  }

  get paginatedProducts(): Producto[] {
    const start = (this.currentPage - 1) * this.productsPerPage;
    return this.filteredProducts.slice(start, start + this.productsPerPage);
  }

  get totalPages(): number[] {
    const pages = Math.ceil(this.filteredProducts.length / this.productsPerPage) || 1;
    return Array.from({ length: pages }, (_, i) => i + 1);
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage -= 1;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages.length) this.currentPage += 1;
  }

  // ===================== CART STATE =====================

  cart: CartItem[] = [];

  discount = 0;
  paidAmount = '0.00';
  activePaymentMethod: PaymentMethod = 'efectivo';
  procesando = false;

  // ===================== COMPUTED (getters) =====================

  get totalItems(): number {
    return this.cart.reduce((sum, item) => sum + item.qty, 0);
  }

  get subtotal(): number {
    return this.cart.reduce((sum, item) => sum + item.product.precio * item.qty, 0);
  }

  get total(): number {
    const t = this.subtotal - this.discount;
    return t > 0 ? t : 0;
  }

  get vuelto(): number {
    const paid = this.parseAmount(this.paidAmount);
    const v = paid - this.total;
    return v > 0 ? v : 0;
  }

  get isCartEmpty(): boolean {
    return this.cart.length === 0;
  }

  // ===================== HELPERS =====================

  formatCurrency(value: number): string {
    return `S/ ${value.toFixed(2)}`;
  }

  private parseAmount(value: string): number {
    const n = parseFloat(value);
    return isNaN(n) ? 0 : n;
  }

  // ===================== CART ACTIONS =====================

  addToCart(producto: Producto): void {
    if (producto.stock <= 0) return; // no permitir vender productos agotados

    const existing = this.cart.find((item) => item.product.id === producto.id);
    if (existing) {
      if (existing.qty < producto.stock) existing.qty += 1;
    } else {
      this.cart.push({ product: producto, qty: 1 });
    }
    this.actualizarQRSiCorresponde();
  }

  increaseQty(id: number | undefined): void {
    const item = this.cart.find((i) => i.product.id === id);
    if (item && item.qty < item.product.stock) item.qty += 1;
    this.actualizarQRSiCorresponde();
  }

  decreaseQty(id: number | undefined): void {
    const item = this.cart.find((i) => i.product.id === id);
    if (!item) return;
    item.qty -= 1;
    if (item.qty <= 0) {
      this.removeFromCart(id);
    }
    this.actualizarQRSiCorresponde();
  }

  removeFromCart(id: number | undefined): void {
    this.cart = this.cart.filter((i) => i.product.id !== id);
    this.actualizarQRSiCorresponde();
  }

  clearCart(): void {
    this.cart = [];
    this.actualizarQRSiCorresponde();
  }

  lineSubtotal(item: CartItem): number {
    return item.product.precio * item.qty;
  }

  // ===================== PAYMENT METHOD SWITCH =====================

  setPaymentMethod(method: PaymentMethod): void {
    if (method === 'yape' && this.isCartEmpty) {
      alert('Agrega productos al carrito antes de elegir este método de pago.');
      return;
    }

    // Si estábamos esperando un pago QR y el cajero cambia de método, cancelamos el sondeo
    if (this.activePaymentMethod === 'yape' && method !== 'yape') {
      this.detenerPollingQR();
      this.qrStripeDataUrl = null;
    }

    // Si estábamos en el formulario de tarjeta y el cajero cambia de método, lo desmontamos
    if (this.activePaymentMethod === 'tarjeta' && method !== 'tarjeta') {
      this.cardElement?.unmount();
    }

    this.activePaymentMethod = method;

    if (method === 'yape') {
      this.generarQRStripe();
    } else if (method === 'tarjeta') {
      // Esperamos un tick para que Angular renderice el <div id="card-element">
      // (con *ngIf) antes de intentar montar el formulario de Stripe ahí.
      setTimeout(() => this.montarTarjetaStripe(), 0);
    }
  }

  private actualizarQRSiCorresponde(): void {
    if (this.activePaymentMethod === 'yape') {
      this.generarQRStripe();
    }
  }

  // ===================== STRIPE: TARJETA (formulario escrito) =====================

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;
  stripeError: string | null = null;
  stripeListo = false;

  // 🔑 Llave PÚBLICA de Stripe (segura de exponer en el frontend).
  // IMPORTANTE: debe venir de la MISMA cuenta/página que tu llave secreta en el backend.
  private readonly stripePublicKey = 'pk_test_51Tuaru2Zd3epulFwmqqtOOPIKuEo3doGIfULxARWQDvH8xegUUulB0PPNYEccCi5t0AneSJ3sjN7kuP446jsvk8L00dGfGw7WE';

  private async initStripe(): Promise<void> {
    this.stripe = await loadStripe(this.stripePublicKey);
    if (!this.stripe) {
      this.stripeError = 'No se pudo cargar Stripe. Revisa tu conexión a internet.';
      this.cdr.detectChanges();
      return;
    }

    this.elements = this.stripe.elements();
    this.stripeListo = true;
    this.cdr.detectChanges();
  }

  private montarTarjetaStripe(): void {
    if (!this.elements) return;

    if (!this.cardElement) {
      this.cardElement = this.elements.create('card', {
        style: {
          base: {
            fontSize: '14px',
            color: '#1f2430',
            '::placeholder': { color: '#7c8394' },
          },
          invalid: { color: '#c0242a' },
        },
      });

this.cardElement.on('change', (event: any) => {
        this.stripeError = event.error ? event.error.message : null;
        this.cdr.detectChanges();
      });
    }

    this.cardElement.mount('#card-element');
  }

  private async procesarPagoConTarjeta(): Promise<void> {
    if (!this.stripe || !this.cardElement) {
      alert('El formulario de tarjeta no cargó correctamente. Recarga la página.');
      return;
    }

    this.procesando = true;

    const { paymentMethod, error } = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.cardElement,
    });

    if (error || !paymentMethod) {
      this.stripeError = error?.message || 'No se pudo procesar la tarjeta.';
      this.procesando = false;
      this.cdr.detectChanges();
      return;
    }

    // Le pedimos a nuestro backend que confirme el cobro con Stripe usando la llave secreta.
    this.http.post<{ exito: boolean; mensaje?: string }>(
      'http://localhost:8080/api/pagos/stripe',
      {
        paymentMethodId: paymentMethod.id,
        monto: this.total,
        moneda: 'pen',
      }
    ).subscribe({
      next: (respuesta) => {
        if (respuesta.exito) {
          this.confirmarVenta();
        } else {
          alert(respuesta.mensaje || 'El pago fue rechazado por el banco.');
          this.procesando = false;
        }
      },
      error: (err) => {
        console.error('Error al pagar con tarjeta:', err);
        alert('No se pudo conectar con el servidor para procesar el pago con tarjeta.');
        this.procesando = false;
      },
    });
  }

  // ===================== STRIPE: YAPE / PLIN (QR simulado con Stripe Checkout) =====================

  qrStripeDataUrl: string | null = null;
  verificandoPagoQR = false;
  private stripeSessionId: string | null = null;
  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  private generarQRStripe(): void {
    this.detenerPollingQR();
    this.qrStripeDataUrl = null;
    this.stripeError = null;

    this.http.post<{ url: string; sessionId: string }>(
      'http://localhost:8080/api/pagos/stripe/checkout-session',
      { monto: this.total, moneda: 'pen' }
    ).subscribe({
      next: async (respuesta) => {
        this.stripeSessionId = respuesta.sessionId;
        try {
          this.qrStripeDataUrl = await QRCode.toDataURL(respuesta.url, {
            width: 220,
            margin: 1,
            color: { dark: '#1f2430', light: '#ffffff' },
          });
        } catch {
          this.qrStripeDataUrl = null;
        }
        this.cdr.detectChanges();
        this.iniciarPollingQR();
      },
      error: (err) => {
        console.error('Error al generar el QR de pago:', err);
        this.stripeError = 'No se pudo generar el QR de pago. Verifica el servidor.';
        this.cdr.detectChanges();
      },
    });
  }

  private iniciarPollingQR(): void {
    this.verificandoPagoQR = true;

    this.pollingInterval = setInterval(() => {
      if (!this.stripeSessionId) return;

      this.http.get<{ pagado: boolean }>(
        `http://localhost:8080/api/pagos/stripe/session-status/${this.stripeSessionId}`
      ).subscribe({
        next: (res) => {
          if (res.pagado) {
            this.detenerPollingQR();
            this.confirmarVenta();
          }
        },
      });
    }, 3000);
  }

  private detenerPollingQR(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.verificandoPagoQR = false;
  }

  cancelarQRStripe(): void {
    this.detenerPollingQR();
    this.qrStripeDataUrl = null;
    this.stripeSessionId = null;
    this.setPaymentMethod('efectivo');
  }

  // ===================== EFECTIVO =====================

  onDiscountChange(value: string): void {
    this.discount = this.parseAmount(value);
    this.actualizarQRSiCorresponde();
  }

  pressKey(key: string): void {
    let current = this.paidAmount;

    if (key === 'del') {
      current = current.slice(0, -1);
    } else if (key === '.') {
      if (!current.includes('.')) current += '.';
    } else {
      if (current === '0' && key !== '00' && key !== '.') {
        current = key;
      } else {
        current += key;
      }
    }

    this.paidAmount = current;
  }

  // ===================== PROCESS SALE =====================

  processSale(): void {
    if (this.isCartEmpty || this.procesando) return;

    if (this.activePaymentMethod === 'yape') return; // se confirma solo, vía sondeo

    let ventanaBoleta: Window | null = null;

    if (this.activePaymentMethod === 'efectivo') {
      if (this.parseAmount(this.paidAmount) < this.total) {
        alert('El monto pagado es menor al total de la venta.');
        return;
      }
      // Abrimos la ventana YA, en el mismo clic (todavía vacía), para que el navegador
      // no la bloquee. Recién más abajo, cuando el backend confirme la venta, la llenamos.
      ventanaBoleta = window.open('', '_blank');
    }

    if (this.activePaymentMethod === 'tarjeta') {
      this.procesarPagoConTarjeta();
      return;
    }

    // Efectivo: no requiere confirmación de un tercero, se procesa directo
    this.procesando = true;
    this.confirmarVenta(ventanaBoleta);
  }

  private confirmarVenta(ventanaBoleta: Window | null = null): void {
    this.procesando = true;

    // Guardamos una copia de lo vendido ANTES de limpiar el carrito, para poder imprimir la boleta
    const itemsVendidos = this.cart.map((item) => ({ ...item }));
    const subtotalVenta = this.subtotal;
    const descuentoVenta = this.discount;
    const totalVenta = this.total;
    const metodoVenta = this.activePaymentMethod;

    // Arma la venta con sus detalles. El backend se encarga de descontar
    // el stock de cada producto y de dejar el registro guardado para
    // los reportes y el asistente de IA.
    const nuevaVenta: Venta = {
      detalles: this.cart.map((item) => ({
        productoId: item.product.id!,
        cantidad: item.qty,
        precioUnitario: item.product.precio
      }))
    };

    this.ventaService.crear(nuevaVenta).subscribe({
      next: () => {
        if (metodoVenta === 'efectivo' && ventanaBoleta) {
          this.imprimirBoletaEnVentana(ventanaBoleta, itemsVendidos, subtotalVenta, descuentoVenta, totalVenta, metodoVenta);
        }

        this.clearCart();
        this.paidAmount = '0.00';
        this.discount = 0;
        this.cardElement?.clear();
        this.cardElement?.unmount();
        this.activePaymentMethod = 'efectivo';
        this.qrStripeDataUrl = null;
        this.stripeSessionId = null;
        this.stripeError = null;
        this.procesando = false;
        this.cargarProductos(); // refresca el stock real desde el backend
      },
      error: (err) => {
        ventanaBoleta?.close(); // la ventana ya se había abierto vacía; si falla la venta, la cerramos
        const mensaje = err?.error?.message || 'Ocurrió un error al procesar la venta. Verifica el stock disponible e inténtalo de nuevo.';
        alert(mensaje);
        this.procesando = false;
      },
    });
  }

  // ===================== BOLETA (comprobante en otra ventana, solo para Efectivo por ahora) =====================

  private imprimirBoletaEnVentana(
    ventana: Window,
    items: CartItem[],
    subtotal: number,
    descuento: number,
    total: number,
    metodo: PaymentMethod
  ): void {
    const metodoLabel = metodo === 'efectivo' ? 'Efectivo' : metodo === 'tarjeta' ? 'Tarjeta' : 'Yape / Plin';
    const numeroBoleta = 'B' + Date.now().toString().slice(-8);

    const filas = items.map((item) => `
      <tr>
        <td>${item.product.nombre || '(Sin nombre)'}</td>
        <td style="text-align:center">${item.qty}</td>
        <td style="text-align:right">${this.formatCurrency(item.product.precio)}</td>
        <td style="text-align:right">${this.formatCurrency(item.product.precio * item.qty)}</td>
      </tr>
    `).join('');

    const contenido = `
      <html>
        <head>
          <title>Boleta ${numeroBoleta}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 30px; color: #1f2430; max-width: 380px; margin: 0 auto; }
            h1 { color: #c0242a; font-size: 18px; margin-bottom: 0; }
            h2 { color: #555; font-weight: 400; font-size: 12px; margin-top: 4px; }
            .datos { font-size: 12px; color: #555; margin-top: 10px; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            th { text-align: left; border-bottom: 1px solid #ccc; padding: 6px 4px; font-size: 11px; }
            td { padding: 6px 4px; border-bottom: 1px dashed #eee; }
            .totales { margin-top: 14px; font-size: 13px; }
            .totales div { display: flex; justify-content: space-between; padding: 3px 0; }
            .total-final { font-weight: 800; font-size: 16px; border-top: 1px solid #ccc; padding-top: 8px; margin-top: 6px; }
            .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #888; }
            .btn-imprimir {
              display: block;
              width: 100%;
              margin-top: 24px;
              padding: 12px;
              background: #c0242a;
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              font-family: inherit;
            }
            @media print {
              .btn-imprimir { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>ROJAS MARKET</h1>
          <h2>Boleta de Venta ${numeroBoleta}</h2>
          <div class="datos">
            Fecha: ${this.currentDateTime}<br/>
            Cajero: ${this.nombre}<br/>
            Método de pago: ${metodoLabel}
          </div>
          <table>
            <thead>
              <tr><th>Producto</th><th>Cant.</th><th>P. Unit.</th><th>Subtotal</th></tr>
            </thead>
            <tbody>${filas}</tbody>
          </table>
          <div class="totales">
            <div><span>Subtotal</span><span>${this.formatCurrency(subtotal)}</span></div>
            <div><span>Descuento</span><span>${this.formatCurrency(descuento)}</span></div>
            <div class="total-final"><span>TOTAL</span><span>${this.formatCurrency(total)}</span></div>
          </div>
          <p class="footer">¡Gracias por su compra!</p>
          <button class="btn-imprimir" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
        </body>
      </html>`;

    ventana.document.write(contenido);
    ventana.document.close();
    ventana.focus();
  }

  // ===================== DATE / TIME =====================

  get currentDateTime(): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timeStr = now.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr} ${timeStr}`;
  }
}