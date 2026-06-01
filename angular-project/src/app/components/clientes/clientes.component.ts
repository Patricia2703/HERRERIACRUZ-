import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Cliente } from '../../models/models';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {
  private api = inject(ApiService);

  // Signals para el estado
  clientes = signal<Cliente[]>([]);
  isModalOpen = signal(false);
  editingCliente = signal<Cliente | null>(null);
  searchTerm = signal('');

  // 🚦 SEÑALES ADICIONALES PARA COMPONENTES DE NOTIFICACIÓN BOOTSTRAP
  alertaOpen = signal<boolean>(false);        // Abre/Cierra modal de alerta
  alertaMensaje = signal<string>('');         // Mensaje dinámico
  alertaEsExito = signal<boolean>(true);      // Define si es verde (éxito) o rojo (error)

  confirmOpen = signal<boolean>(false);       // Abre/Cierra modal de confirmación
  clienteIdAEliminar = signal<number | null>(null); // Guarda temporalmente el ID a borrar

  // Objeto del formulario
  form: Cliente = this.resetClienteForm();

  ngOnInit() {
    this.cargarDatos();
  }

  // Cargar lista desde Flask
  cargarDatos() {
    this.api.getClientes().subscribe({
      next: (data) => this.clientes.set(data),
      error: (err) => {
        console.error('Error al cargar clientes:', err);
        this.mostrarAlerta('No se pudo establecer conexión para cargar la lista de clientes.', false);
      }
    });
  }

  // Filtrado de búsqueda seguro (previene errores si las propiedades vienen nulas)
  filteredClientes = computed(() => {
    const q = this.searchTerm().toLowerCase().trim();
    return this.clientes().filter(c => 
      (c.nombre || '').toLowerCase().includes(q) || 
      (c.apellidoP || '').toLowerCase().includes(q) ||
      (c.telefono || '').includes(q)
    );
  });

  // Abrir modal para nuevo
  openAdd() {
    this.editingCliente.set(null);
    this.form = this.resetClienteForm();
    this.isModalOpen.set(true);
  }

  // Abrir modal para editar
  openEdit(c: Cliente) {
    this.editingCliente.set(c);
    this.form = { ...c }; // Copia profunda para no alterar la tabla antes de guardar
    this.isModalOpen.set(true);
  }

  save() {
    // 1. Limpieza de datos y Formato
    this.form.nombre = this.form.nombre?.toUpperCase().trim() || '';
    this.form.apellidoP = this.form.apellidoP?.toUpperCase().trim() || '';
    this.form.apellidoM = this.form.apellidoM?.toUpperCase().trim() || '';
    
    // Limpiamos el teléfono (solo números y máximo 10 dígitos)
    if (this.form.telefono) {
      this.form.telefono = this.form.telefono.replace(/\D/g, '').substring(0, 10);
    }

    // 2. Validación básica estilizada
    if (!this.form.nombre || !this.form.apellidoP || this.form.telefono?.length !== 10) {
      this.mostrarAlerta('Por favor, rellena los campos obligatorios y asegúrate de que el teléfono tenga 10 dígitos.', false);
      return;
    }

    // 3. Detectar si es edición o creación
    const esEdicion = !!this.editingCliente();
    const request = esEdicion
      ? this.api.updateCliente(this.editingCliente()!.id_cliente!, this.form)
      : this.api.createCliente(this.form);

    // 4. Ejecutar petición
    request.subscribe({
      next: () => {
        this.cargarDatos(); // Recarga la tabla
        this.isModalOpen.set(false); // Cierra el modal de formulario
        
        // Mensaje de éxito Bootstrap
        if (esEdicion) {
          this.mostrarAlerta('¡Cliente actualizado exitosamente! 📝', true);
        } else {
          this.mostrarAlerta('¡Cliente registrado correctamente! 👤', true);
        }
        
        this.form = this.resetClienteForm(); // Limpia el formulario
      },
      error: (err) => {
        console.error(err);
        this.mostrarAlerta('Error al procesar la solicitud: ' + (err.error?.mensaje || 'Error de conexión con el servidor'), false);
      }
    });
  }

  // Prepara la eliminación abriendo el modal estilizado en vez del confirm() nativo
  delete(id: number) {
    this.clienteIdAEliminar.set(id);
    this.confirmOpen.set(true);
  }

  // Confirma y ejecuta el borrado físico desde el modal Bootstrap
  confirmarEliminacion() {
    const id = this.clienteIdAEliminar();
    if (id !== null) {
      this.api.deleteCliente(id).subscribe({
        next: () => {
          this.cargarDatos();
          this.confirmOpen.set(false);
          this.mostrarAlerta('Cliente eliminado con éxito del sistema.', true);
        },
        error: (err) => {
          this.confirmOpen.set(false);
          this.mostrarAlerta('No se pudo eliminar al cliente. Asegúrate de que no tenga órdenes activas vinculadas.', false);
        }
      });
    }
  }

  // ==========================================
  // 🛠️ MÉTODOS AUXILIARES (ALERTAS Y RESETS)
  // ==========================================
  mostrarAlerta(mensaje: string, esExito: boolean) {
    this.alertaMensaje.set(mensaje);
    this.alertaEsExito.set(esExito);
    this.alertaOpen.set(true);
  }

  cerrarAlerta() {
    this.alertaOpen.set(false);
  }

  private resetClienteForm(): Cliente {
    return {
      nombre: '',
      apellidoP: '',
      apellidoM: '',
      telefono: '',
      correo: '',
      direccion: ''
    };
  }
}