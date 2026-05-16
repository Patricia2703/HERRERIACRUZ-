import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Material, Unidad } from '../models/models'; // Ajusta la ruta si es necesario

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:5000'; // El puerto de tu Flask

  // ================= DASHBOARD EXTRA METHODS =================
  getTrabajos(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/trabajos`); }
  getCotizaciones(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/cotizaciones`); }

  // ================= CLIENTES =================
  getClientes(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/clientes`); }
  createCliente(data: any): Observable<any> { return this.http.post(`${this.apiUrl}/clientes`, data); }
  updateCliente(id: number, data: any): Observable<any> { return this.http.put(`${this.apiUrl}/clientes/${id}`, data); }
  deleteCliente(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/clientes/${id}`); }

  // ================= EMPLEADOS =================
  getEmpleados(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/empleados`); }
  createEmpleado(data: any): Observable<any> { return this.http.post(`${this.apiUrl}/empleados`, data); }
  updateEmpleado(id: number, data: any): Observable<any> { return this.http.put(`${this.apiUrl}/empleados/${id}`, data); }
  deleteEmpleado(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/empleados/${id}`); }

  // ================= INVENTARIO / MATERIALES =================
  getMateriales(): Observable<Material[]> { return this.http.get<Material[]>(`${this.apiUrl}/materiales`); }
  getUnidades(): Observable<Unidad[]> { return this.http.get<Unidad[]>(`${this.apiUrl}/unidades`); }
  createMaterial(material: Material): Observable<any> { return this.http.post(`${this.apiUrl}/materiales`, material); }
  updateMaterial(id: number, material: Material): Observable<any> { return this.http.put(`${this.apiUrl}/materiales/${id}`, material); }
  deleteMaterial(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/materiales/${id}`); }
}