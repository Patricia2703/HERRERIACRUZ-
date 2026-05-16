import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Trabajo, Cotizacion, Empleado } from '../../models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-trabajos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trabajos.component.html',
  styleUrl: './trabajos.component.css'
})
export class TrabajosComponent implements OnInit {
  private api = inject(ApiService);

  trabajos = signal<Trabajo[]>([]);
  cotizaciones = signal<Cotizacion[]>([]);
  empleados = signal<Empleado[]>([]);
  
  isModalOpen = signal(false);
  editingTrabajo = signal<Trabajo | null>(null);

  form: Trabajo = {
    cotizacion_id: 0,
    estado: 'pendiente',
    fecha_inicio: '',
    fecha_fin: ''
  };

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    forkJoin({
      t: this.api.getTrabajos(),
      c: this.api.getCotizaciones(),
      e: this.api.getEmpleados()
    }).subscribe(res => {
      this.trabajos.set(res.t);
      this.cotizaciones.set(res.c);
      this.empleados.set(res.e);
    });
  }

  openAdd() {
    this.editingTrabajo.set(null);
    this.form = { cotizacion_id: 0, estado: 'pendiente', fecha_inicio: '', fecha_fin: '' };
    this.isModalOpen.set(true);
  }

  save() {
    if (this.form.cotizacion_id === 0) return alert('Seleccione una cotización');

    const request = this.editingTrabajo()
      ? this.api.updateTrabajo(this.editingTrabajo()!.id_trabajo!, this.form)
      : this.api.createTrabajo(this.form);

    request.subscribe(() => {
      this.cargarDatos();
      this.isModalOpen.set(false);
    });
  }

  delete(id: number) {
    if (confirm('¿Eliminar trabajo? Se borrarán también las asignaciones de empleados.')) {
      this.api.deleteTrabajo(id).subscribe(() => this.cargarDatos());
    }
  }

  estadoBadge(estado: string): string {
    const map: Record<string, string> = {
      'terminado': 'badge-green',
      'en proceso': 'badge-blue',
      'pendiente': 'badge-yellow',
      'entregado': 'badge-purple'
    };
    return map[estado.toLowerCase()] ?? 'badge-gray';
  }
}