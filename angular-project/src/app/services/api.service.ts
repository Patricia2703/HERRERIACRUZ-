import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Material, Unidad, Cotizacion, DetalleCotizacion } from '../models/models'; // Todos los modelos importados juntos

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:5000'; // Mantenemos tu IP local por defecto

  // ================= DASHBOARD EXTRA METHODS =================
  getTrabajos(): Observable<any[]> { 
    return this.http.get<any[]>(`${this.apiUrl}/trabajos`); 
  }

  // ================= CLIENTES =================
  getClientes(): Observable<any[]> { 
    return this.http.get<any[]>(`${this.apiUrl}/clientes`); 
  }
  createCliente(data: any): Observable<any> { 
    return this.http.post(`${this.apiUrl}/clientes`, data); 
  }
  updateCliente(id: number, data: any): Observable<any> { 
    return this.http.put(`${this.apiUrl}/clientes/${id}`, data); 
  }
  deleteCliente(id: number): Observable<any> { 
    return this.http.delete(`${this.apiUrl}/clientes/${id}`); 
  }

  // ================= EMPLEADOS =================
  getEmpleados(): Observable<any[]> { 
    return this.http.get<any[]>(`${this.apiUrl}/empleados`); 
  }
  createEmpleado(data: any): Observable<any> { 
    return this.http.post(`${this.apiUrl}/empleados`, data); 
  }
  updateEmpleado(id: number, data: any): Observable<any> { 
    return this.http.put(`${this.apiUrl}/empleados/${id}`, data); 
  }
  deleteEmpleado(id: number): Observable<any> { 
    return this.http.delete(`${this.apiUrl}/empleados/${id}`); 
  }

  // ================= INVENTARIO / MATERIALES =================
  getMateriales(): Observable<Material[]> { 
    return this.http.get<Material[]>(`${this.apiUrl}/materiales`); 
  }
  getUnidades(): Observable<Unidad[]> { 
    return this.http.get<Unidad[]>(`${this.apiUrl}/unidades`); 
  }
  createMaterial(material: Material): Observable<any> { 
    return this.http.post(`${this.apiUrl}/materiales`, material); 
  }
  updateMaterial(id: number, material: Material): Observable<any> { 
    return this.http.put(`${this.apiUrl}/materiales/${id}`, material); 
  }
  deleteMaterial(id: number): Observable<any> { 
    return this.http.delete(`${this.apiUrl}/materiales/${id}`); 
  }

  // ================= COTIZACIONES =================
  getCotizaciones(): Observable<Cotizacion[]> {
    return this.http.get<Cotizacion[]>(`${this.apiUrl}/cotizaciones`);
  }

  getCotizacion(id: number): Observable<Cotizacion> {
    return this.http.get<Cotizacion>(`${this.apiUrl}/cotizaciones/${id}`);
  }

  createCotizacion(data: Cotizacion): Observable<any> {
    return this.http.post(`${this.apiUrl}/cotizaciones`, data);
  }

  updateCotizacion(id: number, data: Cotizacion): Observable<any> {
    return this.http.put(`${this.apiUrl}/cotizaciones/${id}`, data);
  }

  deleteCotizacion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cotizaciones/${id}`);
  }

  // ================= DETALLES DE MATERIALES =================
  getDetallesCotizacion(): Observable<DetalleCotizacion[]> {
    return this.http.get<DetalleCotizacion[]>(`${this.apiUrl}/detalle_cotizacion`);
  }

  createDetalleCotizacion(data: DetalleCotizacion): Observable<any> {
    return this.http.post(`${this.apiUrl}/detalle_cotizacion`, data);
  }

  deleteDetalleCotizacion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/detalle_cotizacion/${id}`);
  }

  // PARA GESTIONAR NUEVAS CATEGORIAS DE TRABAJOS
  getCcategorias(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/categorias`);
}
createCategoria(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/categorias`, data);
}         
}