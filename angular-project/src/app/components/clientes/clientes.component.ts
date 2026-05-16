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

  // Objeto del formulario
  form: Cliente = this.resetClienteForm();

  ngOnInit() {
    this.cargarDatos();
  }

  // Cargar lista desde Flask
  cargarDatos() {
    this.api.getClientes().subscribe({
      next: (data) => this.clientes.set(data),
      error: (err) => console.error('Error al cargar clientes:', err)
    });
  }

  // Filtrado de búsqueda
  filteredClientes = computed(() => {
    const q = this.searchTerm().toLowerCase().trim();
    return this.clientes().filter(c => 
      c.nombre.toLowerCase().includes(q) || 
      c.apellidoP.toLowerCase().includes(q) ||
      c.telefono.includes(q)
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

// ... (tus otros métodos como openAdd, openEdit, etc.)

save() {
  // 1. Limpieza de datos y Formato
  // Convertimos a MAYÚSCULAS
  this.form.nombre = this.form.nombre?.toUpperCase().trim();
  this.form.apellidoP = this.form.apellidoP?.toUpperCase().trim();
  this.form.apellidoM = this.form.apellidoM?.toUpperCase().trim();
  
  // Limpiamos el teléfono (solo números y máximo 10 dígitos)
  if (this.form.telefono) {
    this.form.telefono = this.form.telefono.replace(/\D/g, '').substring(0, 10);
  }

  // 2. Validación básica
  if (!this.form.nombre || !this.form.apellidoP || this.form.telefono?.length !== 10) {
    alert('Por favor, rellena los campos obligatorios y asegúrate de que el teléfono tenga 10 dígitos.');
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
      this.isModalOpen.set(false); // Cierra el modal
      
      // Mensaje de éxito
      if (esEdicion) {
        alert('¡Cliente actualizado exitosamente!');
      } else {
        alert('¡Cliente registrado correctamente!');
      }
      
      this.form = this.resetClienteForm(); // Limpia el formulario
    },
    error: (err) => {
      console.error(err);
      alert('Error al procesar la solicitud: ' + (err.error?.mensaje || 'Error de conexión'));
    }
  });
}

// No olvides agregar también el mensaje en la función delete
delete(id: number) {
  if (confirm('¿Estás seguro de eliminar a este cliente?')) {
    this.api.deleteCliente(id).subscribe({
      next: () => {
        this.cargarDatos();
        alert('Cliente eliminado con éxito.');
      },
      error: (err) => alert('No se pudo eliminar al cliente.')
    });
  }
}


// Función para resetear el formulario de clientes
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