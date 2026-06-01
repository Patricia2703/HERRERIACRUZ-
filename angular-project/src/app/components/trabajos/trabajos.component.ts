import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Trabajo } from '../../models/models';

@Component({
  selector: 'app-trabajos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trabajos.component.html',
  styleUrls: ['./trabajos.component.css']
})
export class TrabajosComponent implements OnInit {
  listaTrabajos = signal<Trabajo[]>([]);
  listaCotizaciones = signal<any[]>([]);
  isModalOpen = signal<boolean>(false);
  isEditMode = signal<boolean>(false);

  formTrabajo = {
    id_trabajo: null as number | null,
    cotizacion_id: null as number | null,
    estado: 'pendiente',
    fecha_inicio: '' as string | null,
    fecha_fin: '' as string | null
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarTrabajos();
    this.cargarCotizaciones();
  }

  cargarTrabajos(): void {
    this.apiService.getTrabajos().subscribe({
      next: (data) => {
        console.log('Órdenes de trabajo recibidas:', data);
        this.listaTrabajos.set(data);
      },
      error: (err) => console.error('Error al cargar órdenes de trabajo:', err)
    });
  }

  cargarCotizaciones(): void {
    this.apiService.getCotizaciones().subscribe({
      next: (data) => {
        // ESTE CONSOLE.LOG ES CLAVE: Abre la consola del navegador (F12) para ver cómo se llama el campo del cliente
        console.log('Cotizaciones recibidas del Backend:', data);
        this.listaCotizaciones.set(data);
      },
      error: (err) => console.error('Error al obtener cotizaciones:', err)
    });
  }

  // Unión reactiva optimizada con tolerancia a diferentes nombres de columnas
  trabajosConCliente = computed(() => {
    const trabajos = this.listaTrabajos();
    const cotizaciones = this.listaCotizaciones();

    return trabajos.map(trabajo => {
      const cotizacionAsociada = cotizaciones.find(c => Number(c.id_cotizacion) === Number(trabajo.cotizacion_id));
      
      let nombreDetectado = '';
      if (cotizacionAsociada) {
        // Intenta leer todas las variantes posibles que pueda tener tu backend de Flask
        nombreDetectado = cotizacionAsociada.cliente || 
                          cotizacionAsociada.nombre_cliente || 
                          cotizacionAsociada.cliente_nombre || 
                          cotizacionAsociada.nombre || 
                          '';
      }

      return {
        ...trabajo,
        // Si sigue vacío tras buscar en las variantes, mostrará "Verificar Folio #X" temporalmente
        nombre_cliente: nombreDetectado.trim() !== '' ? nombreDetectado : `Cliente de Cotización #${trabajo.cotizacion_id}`
      };
    });
  });

  cotizacionesDisponibles = computed(() => {
    const aprobadas = this.listaCotizaciones().filter(c => 
      c.estado === 'Aprobada' || c.estado === 'aprobada' || c.estatus === 'Aprobada'
    );
    const idsTrabajados = this.listaTrabajos().map(t => t.cotizacion_id);
    return aprobadas.filter(c => !idsTrabajados.includes(c.id_cotizacion));
  });

  get clienteEdicionActual(): string {
    if (!this.formTrabajo.cotizacion_id) return '';
    const cotizaciones = this.listaCotizaciones();
    const encontrada = cotizaciones.find(c => Number(c.id_cotizacion) === Number(this.formTrabajo.cotizacion_id));
    if (!encontrada) return 'Cliente Asociado';
    return encontrada.cliente || encontrada.nombre_cliente || encontrada.cliente_nombre || encontrada.nombre || 'Cliente Registrado';
  }

  obtenerFechaActualLimpia(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  }

  formatearFechaParaInput(fechaOriginal: any): string {
    if (!fechaOriginal) return '';
    return fechaOriginal.toString().split('T')[0].substring(0, 10);
  }

  onEstatusChange(): void {
    if (this.formTrabajo.estado === 'terminado') {
      this.formTrabajo.fecha_fin = this.obtenerFechaActualLimpia();
    } else {
      this.formTrabajo.fecha_fin = '';
    }
  }

  openNuevoTrabajo(): void {
    this.isEditMode.set(false);
    this.formTrabajo = { id_trabajo: null, cotizacion_id: null, estado: 'pendiente', fecha_inicio: this.obtenerFechaActualLimpia(), fecha_fin: '' };
    this.isModalOpen.set(true);
  }

  openEditarTrabajo(trabajo: Trabajo): void {
    this.isEditMode.set(true);
    this.formTrabajo = {
      id_trabajo: trabajo.id_trabajo || null,
      cotizacion_id: trabajo.cotizacion_id,
      estado: trabajo.estado,
      fecha_inicio: this.formatearFechaParaInput(trabajo.fecha_inicio) || this.obtenerFechaActualLimpia(),
      fecha_fin: this.formatearFechaParaInput(trabajo.fecha_fin)
    };
    this.isModalOpen.set(true);
  }

  guardarTrabajo(): void {
    if (!this.formTrabajo.cotizacion_id) return;
    const payload: Trabajo = {
      cotizacion_id: Number(this.formTrabajo.cotizacion_id),
      estado: this.formTrabajo.estado,
      fecha_inicio: this.formTrabajo.fecha_inicio || null,
      fecha_fin: this.formTrabajo.fecha_fin || null
    };

    if (this.isEditMode()) {
      this.apiService.actualizarTrabajo(this.formTrabajo.id_trabajo as number, payload).subscribe({
        next: () => { this.isModalOpen.set(false); this.cargarTrabajos(); }
      });
    } else {
      this.apiService.crearTrabajo(payload).subscribe({
        next: () => { this.isModalOpen.set(false); this.cargarTrabajos(); }
      });
    }
  }

  eliminarTrabajo(id: number): void {
    if (confirm('¿Deseas eliminar esta orden de trabajo?')) {
      this.apiService.eliminarTrabajo(id).subscribe({ next: () => this.cargarTrabajos() });
    }
  }
}