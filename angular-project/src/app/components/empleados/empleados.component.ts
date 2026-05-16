import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Empleado } from '../../models/models';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleados.component.html',
  styleUrl: './empleados.component.css'
})
export class EmpleadosComponent implements OnInit {
  private api = inject(ApiService);

  // Signals para estado reactivo
  empleados = signal<Empleado[]>([]);
  isModalOpen = signal(false);
  editingEmpleado = signal<Empleado | null>(null);
  searchTerm = signal('');

  // Formulario vinculado a la interfaz Empleado
  form: Empleado = this.resetForm();

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.api.getEmpleados().subscribe({
      next: (data) => this.empleados.set(data),
      error: (err) => console.error('Error al cargar empleados:', err)
    });
  }

  // Filtro inteligente (Busca por nombre o apellido paterno)
  filteredEmpleados = computed(() => {
    const q = this.searchTerm().toLowerCase().trim();
    return this.empleados().filter(e => 
      e.nombre.toLowerCase().includes(q) || 
      e.apellidoP.toLowerCase().includes(q)
    );
  });

  openAdd() {
    this.editingEmpleado.set(null);
    this.form = this.resetForm();
    this.isModalOpen.set(true);
  }

  openEdit(e: Empleado) {
    this.editingEmpleado.set(e);
    this.form = { ...e };
    this.isModalOpen.set(true);
  }

save() {
    // 1. Validaciones básicas
    if (!this.form.categoria_id) {
      alert('Por favor seleccione una categoría');
      return;
    }

    if (this.form.telefono.replace(/\D/g, '').length !== 10) {
      alert('El teléfono debe tener 10 dígitos');
      return;
    }

    // 2. Limpieza de datos y Formato (Mayúsculas y Teléfono)
    this.form.nombre = this.form.nombre.toUpperCase();
    this.form.apellidoP = this.form.apellidoP.toUpperCase();
    this.form.apellidoM = this.form.apellidoM.toUpperCase();
    this.form.telefono = this.form.telefono.replace(/\D/g, '').substring(0, 10);

    // --- NUEVO: CORRECCIÓN DE FORMATO DE FECHA PARA MYSQL ---
    if (this.form.fecha_nacimiento) {
      // Forzamos que la fecha sea una cadena en formato YYYY-MM-DD
      const fecha = new Date(this.form.fecha_nacimiento);
      this.form.fecha_nacimiento = fecha.toISOString().split('T')[0];
    }
    // --------------------------------------------------------

    // 3. Detectar si es edición o creación
    const esEdicion = !!this.editingEmpleado();
    const request = esEdicion
      ? this.api.updateEmpleado(this.editingEmpleado()!.id_empleado!, this.form)
      : this.api.createEmpleado(this.form);

    // 4. Ejecutar petición
    request.subscribe({
      next: () => {
        this.cargarDatos();
        this.isModalOpen.set(false);
        
        if (esEdicion) {
          alert('¡Empleado actualizado exitosamente!');
        } else {
          alert('¡Empleado registrado correctamente!');
        }
        
        this.form = this.resetForm();
      },
    error: (err: any) => {  // <-- Agrega el : any aquí
      console.error(err);
      alert('Error al guardar: ' + (err.error?.message || 'Error de conexión'));
    }
    });
  }

toggleActivo(e: Empleado) {
  const nuevoEstado = e.activo === 1 ? 0 : 1;
  const accion = nuevoEstado === 1 ? 'reactivar' : 'desactivar';

  if (confirm(`¿Desea ${accion} a este empleado?`)) {
    // 1. Creamos la copia del empleado
    const empleadoEditado = { ...e, activo: nuevoEstado };

    // 2. CORRECCIÓN CRÍTICA: Limpiamos la fecha antes de enviar
    if (empleadoEditado.fecha_nacimiento) {
      const fecha = new Date(empleadoEditado.fecha_nacimiento);
      // Esto convierte 'Thu, 10 May...' en '1990-05-10'
      empleadoEditado.fecha_nacimiento = fecha.toISOString().split('T')[0];
    }

    // 3. Enviamos la petición
    this.api.updateEmpleado(e.id_empleado!, empleadoEditado).subscribe({
      next: () => {
        this.cargarDatos();
        alert(`Empleado ${nuevoEstado === 1 ? 'reactivado' : 'desactivado'} correctamente.`);
      },
      error: (err) => {
        console.error('Error detallado:', err);
        alert('Error al cambiar el estado: Formato de fecha no válido en el servidor.');
      }
    });
  }
}

  // --- FUNCIÓN DE BORRADO FÍSICO (Opcional) ---
  delete(id: number) {
    if (confirm('¿Desea eliminar permanentemente este registro? (No recomendado si tiene historial)')) {
      this.api.deleteEmpleado(id).subscribe({
        next: () => {
          this.cargarDatos();
          alert('Registro eliminado de la base de datos.');
        },
    error: (err: any) => {  // <-- Agrega el : any aquí
      console.error(err);
      alert('Error al guardar: ' + (err.error?.message || 'Error de conexión'));
    }
      });
    }
  }

  // Reseteo del formulario con los campos de tu base de datos
  private resetForm(): Empleado {
    return {
      nombre: '',
      apellidoP: '',
      apellidoM: '',
      telefono: '',
      fecha_nacimiento: new Date().toISOString().split('T')[0],
      categoria_id: 1, 
      activo: 1
    };
  }
}