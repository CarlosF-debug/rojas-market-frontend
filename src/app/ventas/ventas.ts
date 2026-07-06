import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ===================== TYPES =====================

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  emoji: string;
}

interface CartItem {
  product: Product;
  qty: number;
}

type PaymentMethod = 'efectivo' | 'tarjeta' | 'yape';

@Component({
  selector: 'app-ventas',
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css',
})
export class Ventas {

  // ===================== DATA =====================

  products: Product[] = [
    { id: 'p1', name: 'Coca Cola 500ml', price: 3.50, stock: 120, emoji: '🥤' },
    { id: 'p2', name: 'Inca Kola 500ml', price: 3.50, stock: 85, emoji: '🥤' },
    { id: 'p3', name: 'Agua Cielo 1L', price: 2.20, stock: 60, emoji: '💧' },
    { id: 'p4', name: 'Galletas Oreo 126g', price: 4.50, stock: 45, emoji: '🍪' },
    { id: 'p5', name: 'Papas Lays Clásicas', price: 6.00, stock: 35, emoji: '🍟' },
    { id: 'p6', name: 'Leche Gloria 1L', price: 4.20, stock: 50, emoji: '🥛' },
    { id: 'p7', name: 'Arroz Extra 1kg', price: 4.80, stock: 40, emoji: '🍚' },
    { id: 'p8', name: 'Azúcar Blanca 1kg', price: 3.20, stock: 55, emoji: '🧂' },
    { id: 'p9', name: 'Atún Florida 170g', price: 4.00, stock: 25, emoji: '🥫' },
    { id: 'p10', name: 'Fideos Don Vittorio', price: 2.50, stock: 70, emoji: '🍝' },
    { id: 'p11', name: 'Aceite Primor 1L', price: 6.90, stock: 30, emoji: '🫙' },
    { id: 'p12', name: 'Detergente Ariel 1kg', price: 8.90, stock: 20, emoji: '🧴' },
  ];

  productsPerPage = 12;
  currentPage = 1;
  searchTerm = '';

  // ===================== CART STATE =====================

  cart: CartItem[] = [];

  discount = 0;
  paidAmount = '0.00';
  activePaymentMethod: PaymentMethod = 'efectivo';

  // ===================== COMPUTED (getters) =====================

  get filteredProducts(): Product[] {
    return this.products.filter((p) =>
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get paginatedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.productsPerPage;
    return this.filteredProducts.slice(start, start + this.productsPerPage);
  }

  get totalPages(): number[] {
    const pages = Math.ceil(this.filteredProducts.length / this.productsPerPage) || 1;
    return Array.from({ length: pages }, (_, i) => i + 1);
  }

  get totalItems(): number {
    return this.cart.reduce((sum, item) => sum + item.qty, 0);
  }

  get subtotal(): number {
    return this.cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
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

  addToCart(product: Product): void {
    const existing = this.cart.find((item) => item.product.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.cart.push({ product, qty: 1 });
    }
  }

  increaseQty(productId: string): void {
    const item = this.cart.find((i) => i.product.id === productId);
    if (item) item.qty += 1;
  }

  decreaseQty(productId: string): void {
    const item = this.cart.find((i) => i.product.id === productId);
    if (!item) return;
    item.qty -= 1;
    if (item.qty <= 0) {
      this.removeFromCart(productId);
    }
  }

  removeFromCart(productId: string): void {
    this.cart = this.cart.filter((i) => i.product.id !== productId);
  }

  clearCart(): void {
    this.cart = [];
  }

  lineSubtotal(item: CartItem): number {
    return item.product.price * item.qty;
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

  // ===================== SEARCH / PAGINATION =====================

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

  // ===================== PROCESS SALE =====================

  processSale(): void {
    if (this.isCartEmpty) return;

    if (this.activePaymentMethod === 'efectivo' && this.parseAmount(this.paidAmount) < this.total) {
      alert('El monto pagado es menor al total de la venta.');
      return;
    }

    alert(`Venta procesada por ${this.formatCurrency(this.total)}. ¡Gracias!`);
    this.clearCart();
    this.paidAmount = '0.00';
    this.discount = 0;
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
