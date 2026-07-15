import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProductoService, Producto } from '../services/producto';
import { CategoriaService, Categoria } from '../services/categoria';
import { AuthService } from '../services/auth';

// ===================== TYPES =====================

interface CartItem {
  product: Producto;
  qty: number;
}

type PaymentMethod = 'efectivo' | 'yape';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css',
})
export class Ventas implements OnInit {

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
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
  // aún no existe en tu interfaz Producto). Si no hay imagen, se muestra un ícono genérico.
  getImagen(p: Producto): string | undefined {
    return (p as any).imagenUrl;
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
  }

  increaseQty(id: number | undefined): void {
    const item = this.cart.find((i) => i.product.id === id);
    if (item && item.qty < item.product.stock) item.qty += 1;
  }

  decreaseQty(id: number | undefined): void {
    const item = this.cart.find((i) => i.product.id === id);
    if (!item) return;
    item.qty -= 1;
    if (item.qty <= 0) {
      this.removeFromCart(id);
    }
  }

  removeFromCart(id: number | undefined): void {
    this.cart = this.cart.filter((i) => i.product.id !== id);
  }

  clearCart(): void {
    this.cart = [];
  }

  lineSubtotal(item: CartItem): number {
    return item.product.precio * item.qty;
  }

  // ===================== PAYMENT =====================

  setPaymentMethod(method: PaymentMethod): void {
    this.activePaymentMethod = method;
  }

  onDiscountChange(value: string): void {
    this.discount = this.parseAmount(value);
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

    if (this.activePaymentMethod === 'efectivo' && this.parseAmount(this.paidAmount) < this.total) {
      alert('El monto pagado es menor al total de la venta.');
      return;
    }

    this.procesando = true;

    // Por cada producto en el carrito, resta la cantidad vendida de su stock actual
    // y envía la actualización a la base de datos.
    const actualizaciones = this.cart.map((item) => {
      const productoActualizado: Producto = {
        ...item.product,
        stock: item.product.stock - item.qty,
      };
      return this.productoService.actualizar(item.product.id!, productoActualizado);
    });

    forkJoin(actualizaciones).subscribe({
      next: () => {
        alert(`Venta procesada por ${this.formatCurrency(this.total)}. ¡Gracias!`);
        this.clearCart();
        this.paidAmount = '0.00';
        this.discount = 0;
        this.procesando = false;
        this.cargarProductos(); // refresca el stock real desde el backend
      },
      error: () => {
        alert('Ocurrió un error al descontar el stock. Verifica tu conexión con el servidor e inténtalo de nuevo.');
        this.procesando = false;
      },
    });
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
