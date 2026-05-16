import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cliente, Trabajo, Cotizacion } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3000/api'; // Cambia esto a tu URL de Back-end

  // Solo lo que ya tienes hecho
  public clientes = signal<Cliente[]>([]);
  public trabajos = signal<Trabajo[]>([]);
  public cotizaciones = signal<Cotizacion[]>([]);

  constructor(private http: HttpClient) { }

  // Métodos auxiliares que tus componentes actuales piden
  today() {
    return new Date().toISOString().split('T')[0];
  }

  formatPrecio(n: number): string {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(n);
  }
}