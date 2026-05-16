import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Cliente, Trabajo, Cotizacion } from '../../models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);

  clientes = signal<Cliente[]>([]);
  trabajos = signal<Trabajo[]>([]);
  cotizaciones = signal<Cotizacion[]>([]);
  
  message = '';
  currentSlide = 0;

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    forkJoin({
      c: this.api.getClientes(),
      t: this.api.getTrabajos(),
      cot: this.api.getCotizaciones()
    }).subscribe(res => {
      this.clientes.set(res.c);
      this.trabajos.set(res.t);
      this.cotizaciones.set(res.cot);
    });
  }

  kpis = computed(() => [
    {
      title: 'Trabajos Totales',
      value: String(this.trabajos().length),
      change: 'registrados en sistema',
      changeType: 'neutral',
      icon: 'fa-hammer',
      colorFrom: '#4682B4', colorTo: '#5a9bd5'
    },
    {
      title: 'Clientes',
      value: String(this.clientes().length),
      change: 'en base de datos',
      changeType: 'positive',
      icon: 'fa-users',
      colorFrom: '#22c55e', colorTo: '#16a34a'
    },
    {
      title: 'Cotizaciones',
      value: String(this.cotizaciones().length),
      change: 'pendientes y aprobadas',
      changeType: 'neutral',
      icon: 'fa-file-invoice-dollar',
      colorFrom: '#f97316', colorTo: '#ea580c'
    }
  ]);

  recentWorks = computed(() => 
    [...this.trabajos()].reverse().slice(0, 5)
  );

  estadoBadge(estado: string): string {
    const map: Record<string, string> = {
      'terminado': 'badge-green',
      'en proceso': 'badge-blue',
      'pendiente': 'badge-yellow',
    };
    return map[estado.toLowerCase()] ?? 'badge-gray';
  }

  formatPrecio(n: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
  }

  sendMessage() {
    if (this.message.trim()) {
      this.message = '';
    }
  }
}