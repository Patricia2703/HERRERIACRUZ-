import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Material, Unidad, Cotizacion, DetalleCotizacion, Pago , Trabajo} from '../models/models'; 

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://35.194.11.111:5000'; 
  getBaseUrl(): string {
    return this.apiUrl;
  }

  // ================= DASHBOARD / TRABAJOS =================
  getTrabajos(): Observable<Trabajo[]> {
    return this.http.get<Trabajo[]>(`${this.apiUrl}/trabajos`);
  }
  getTrabajoPorId(id: number): Observable<Trabajo> {
    return this.http.get<Trabajo>(`${this.apiUrl}/trabajos/${id}`);
  }
  crearTrabajo(trabajo: Trabajo): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/trabajos`, trabajo);
  }
  actualizarTrabajo(id: number, trabajo: Trabajo): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.apiUrl}/trabajos/${id}`, trabajo);
  }
  eliminarTrabajo(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/trabajos/${id}`);
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

  // ================= DETALLES DE COTIZACION =================
  getDetallesCotizacion(): Observable<DetalleCotizacion[]> {
    return this.http.get<DetalleCotizacion[]>(`${this.apiUrl}/detalle_cotizacion`);
  }
  createDetalleCotizacion(data: DetalleCotizacion): Observable<any> {
    return this.http.post(`${this.apiUrl}/detalle_cotizacion`, data);
  }
  deleteDetalleCotizacion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/detalle_cotizacion/${id}`);
  }

  // ================= CATEGORIAS =================
  getCcategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categorias`);
  }
  createCategoria(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categorias`, data);
  }   

  // ================= PAGOS =================
  getPagos(): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.apiUrl}/pagos`);
  }
  crearPago(pago: Pago): Observable<any> {
    return this.http.post(`${this.apiUrl}/pagos`, pago);
  }
  actualizarPago(id: number, pago: Pago): Observable<any> {
    return this.http.put(`${this.apiUrl}/pagos/${id}`, pago);
  }
  eliminarPago(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/pagos/${id}`);
  }

// ================= ASISTENCIAS Y NÓMINA =================
getAsistencias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/asistencias`);
  }

  // 2. Registrar nueva entrada (POST) -> Apunta al nuevo /asistencias/entrada de Flask
  registrarEntrada(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/asistencias/entrada`, datos);
  }

  // 3. Registrar salida (POST) -> Apunta a /asistencias/salida de Flask
  registrarSalida(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/asistencias/salida`, datos);
  }

  // 4. Eliminar registro (DELETE) -> Apunta a /asistencias/:id de Flask
  eliminarAsistencia(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/asistencias/${id}`);
  }

  // 5. Historial de Lunes a Domingo (GET)
  getHistorialSemanal(semana: number, anio: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/asistencias/historial-semanal?semana=${semana}&anio=${anio}`);
  }

  // 6. Calcular Raya Semanal (POST)
  calcularNominaSemanal(filtros: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/nomina/calcular`, filtros);
  }
// ================= DESCARGA DE REMISIÓN (BLOB) =================
  descargarRemisionBlob(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/cotizaciones/${id}/remision`, {
      responseType: 'blob'
    });
  }
  ejecutarDescargaInmediata(id: number): void {
    this.descargarRemisionBlob(id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Remision_Folio_R${id}_HerreriaCruz.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Error al bajar el PDF automático:', err)
    });
  }

  // ================= ESTADÍSTICAS / REPORTES =================
  getReporteFinanciero(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reportes/financiero`);
  }

  getReporteMateriales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reportes/materiales-top`);
  }

  // ================= CATÁLOGO DE TRABAJOS =================
  getTrabajosCatalogo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/catalogo`);
  }

  // Usamos FormData para que Angular pueda empaquetar la foto física
  crearTrabajoCatalogo(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/catalogo`, formData);
  }

  descargarCatalogoPdf(): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/catalogo/pdf`, { responseType: 'blob' });
}
registrarUsuario(datosUsuario: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/registro', datosUsuario);
  }

  iniciarSesion(credenciales: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/login', credenciales);
  }
}