import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Importante para la navegación

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule], // Añadido RouterModule
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Input() activeItem = 'dashboard';
  @Output() activeItemChange = new EventEmitter<string>();

  // Íconos cambiados de Emojis a Clases de FontAwesome
  menuItems = [
    { id: 'dashboard',    label: 'Dashboard',    icon: 'fa-solid fa-chart-line',   route: '/' },
    { id: 'clientes',     label: 'Clientes',     icon: 'fa-solid fa-users',        route: '/clientes' },
    { id: 'empleados',    label: 'Empleados',    icon: 'fa-solid fa-user-tie',     route: '/empleados' },
    { id: 'trabajos',     label: 'Trabajos',     icon: 'fa-solid fa-hammer',       route: '/trabajos' },
    { id: 'cotizaciones', label: 'Cotizaciones', icon: 'fa-solid fa-file-invoice', route: '/cotizaciones' },
    { id: 'pagos',        label: 'Pagos',        icon: 'fa-solid fa-credit-card',  route: '/pagos' },
    { id: 'inventario',   label: 'Inventario',   icon: 'fa-solid fa-boxes-stacked',route: '/inventario' },
    { id: 'catalogo',     label: 'Catálogo',     icon: 'fa-solid fa-images',       route: '/catalogo' },
    { id: 'reportes',     label: 'Reportes',     icon: 'fa-solid fa-file-chart-column', route: '/reportes' },
  ];

  setActive(id: string) {
    this.activeItemChange.emit(id);
    // Si es móvil, podrías emitir otro evento para cerrar el sidebar aquí
  }
}