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

  // 🚦 SEÑALES ADICIONALES PARA COMPONENTES DE NOTIFICACIÓN BOOTSTRAP
  alertaOpen = signal<boolean>(false);        // Abre/Cierra modal de alerta
  alertaMensaje = signal<string>('');         // Mensaje dinámico de la alerta
  alertaEsExito = signal<boolean>(true);      // Define si es verde (éxito) o rojo (error)

  confirmOpen = signal<boolean>(false);       // Abre/Cierra modal de confirmación de estado o borrado
  empleadoSeleccionado = signal<Empleado | null>(null); // Temporal para guardar la referencia activa
  modoConfirmacion = signal<'toggle' | 'delete'>('toggle'); // Qué tipo de confirmación se está haciendo

  // Formulario vinculado a la interfaz Empleado
  form: Empleado = this.resetForm();

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.api.getEmpleados().subscribe({
      next: (data) => this.empleados.set(data),
      error: (err) => {
        console.error('Error al cargar empleados:', err);
        this.mostrarAlerta('No se pudo establecer conexión para cargar la lista de personal.', false);
      }
    });
  }

  // Filtro inteligente (Busca por nombre o apellido paterno de forma segura)
  filteredEmpleados = computed(() => {
    const q = this.searchTerm().toLowerCase().trim();
    return this.empleados().filter(e => 
      (e.nombre || '').toLowerCase().includes(q) || 
      (e.apellidoP || '').toLowerCase().includes(q)
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
    // 1. Validaciones básicas estilizadas
    if (!this.form.categoria_id) {
      this.mostrarAlerta('Por favor seleccione una categoría o puesto válido.', false);
      return;
    }

    if (!this.form.telefono || this.form.telefono.replace(/\D/g, '').length !== 10) {
      this.mostrarAlerta('El número de teléfono debe contener exactamente 10 dígitos.', false);
      return;
    }

    // 2. Limpieza de datos y Formato (Mayúsculas y Teléfono)
    this.form.nombre = this.form.nombre?.toUpperCase().trim() || '';
    this.form.apellidoP = this.form.apellidoP?.toUpperCase().trim() || '';
    this.form.apellidoM = this.form.apellidoM?.toUpperCase().trim() || '';
    this.form.telefono = this.form.telefono.replace(/\D/g, '').substring(0, 10);

    // --- CORRECCIÓN DE FORMATO DE FECHA PARA MYSQL ---
    if (this.form.fecha_nacimiento) {
      const fecha = new Date(this.form.fecha_nacimiento);
      this.form.fecha_nacimiento = fecha.toISOString().split('T')[0];
    }

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
          this.mostrarAlerta('¡Registro de personal actualizado exitosamente! 📝', true);
        } else {
          this.mostrarAlerta('¡Nuevo colaborador registrado correctamente! 🛠️', true);
        }
        
        this.form = this.resetForm();
      },
      error: (err: any) => {
        console.error(err);
        this.mostrarAlerta('Error al procesar la solicitud: ' + (err.error?.message || 'Error de comunicación'), false);
      }
    });
  }

  // Prepara el cambio de estado (Activo/Inactivo) usando el modal Bootstrap
  toggleActivo(e: Empleado) {
    this.empleadoSeleccionado.set(e);
    this.modoConfirmacion.set('toggle');
    this.confirmOpen.set(true);
  }

  // Prepara el borrado físico de la base de datos usando el modal Bootstrap
  delete(id: number) {
    const emp = this.empleados().find(e => e.id_empleado === id);
    if (emp) {
      this.empleadoSeleccionado.set(emp);
      this.modoConfirmacion.set('delete');
      this.confirmOpen.set(true);
    }
  }

  // Manejador unificado de las confirmaciones del modal
  ejecutarConfirmacion() {
    const e = this.empleadoSeleccionado();
    if (!e) return;

    if (this.modoConfirmacion() === 'toggle') {
      const nuevoEstado = e.activo === 1 ? 0 : 1;
      const empleadoEditado = { ...e, activo: nuevoEstado };

      if (empleadoEditado.fecha_nacimiento) {
        const fecha = new Date(empleadoEditado.fecha_nacimiento);
        empleadoEditado.fecha_nacimiento = fecha.toISOString().split('T')[0];
      }

      this.api.updateEmpleado(e.id_empleado!, empleadoEditado).subscribe({
        next: () => {
          this.cargarDatos();
          this.confirmOpen.set(false);
          this.mostrarAlerta(`Empleado ${nuevoEstado === 1 ? 'reactivado' : 'desactivado'} correctamente.`, true);
        },
        error: (err) => {
          console.error('Error al cambiar el estado:', err);
          this.confirmOpen.set(false);
          this.mostrarAlerta('Error al modificar el estado del empleado en el servidor.', false);
        }
      });

    } else if (this.modoConfirmacion() === 'delete') {
      this.api.deleteEmpleado(e.id_empleado!).subscribe({
        next: () => {
          this.cargarDatos();
          this.confirmOpen.set(false);
          this.mostrarAlerta('Registro eliminado permanentemente de la base de datos.', true);
        },
        error: (err: any) => {
          console.error(err);
          this.confirmOpen.set(false);
          this.mostrarAlerta('No se pudo borrar al empleado. Es posible que tenga registros históricos asociados.', false);
        }
      });
    }
  }

 
  mostrarAlerta(mensaje: string, esExito: boolean) {
    this.alertaMensaje.set(mensaje);
    this.alertaEsExito.set(esExito);
    this.alertaOpen.set(true);
  }

  cerrarAlerta() {
    this.alertaOpen.set(false);
  }

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