import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Material, Unidad } from '../../models/models';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html'
})
export class InventarioComponent implements OnInit {
  private api = inject(ApiService);

  // Señales de datos de Herrería Cruz
  materiales = signal<Material[]>([]);
  unidades = signal<Unidad[]>([]);
  isModalOpen = signal(false);
  editingMaterial = signal<Material | null>(null);
  searchTerm = signal('');

  // Control de la ventana de confirmación de eliminación estilizada
  isDeleteModalOpen = signal(false);
  idMaterialAEliminar = signal<number | null>(null);

  // Mensaje flotante tipo rectángulo inferior (Éxito o Error)
  banner = signal<{ message: string; type: 'success' | 'danger' } | null>(null);

  form: Material = this.resetForm();

  ngOnInit() {
    this.cargarDatos();
    this.cargarUnidades();
  }

  cargarDatos() {
    this.api.getMateriales().subscribe({
      next: (data: any) => this.materiales.set(data),
      error: (err: any) => {
        console.error(err);
        this.lanzarBanner('Error al obtener materiales del servidor', 'danger');
      }
    });
  }

  cargarUnidades() {
    this.api.getUnidades().subscribe({
      next: (data: any) => this.unidades.set(data),
      error: (err: any) => console.error('Error al cargar unidades:', err)
    });
  }

  filteredMateriales = computed(() => {
    const q = this.searchTerm().toLowerCase().trim();
    return this.materiales().filter(m => m.nombre.toLowerCase().includes(q));
  });

  // Temporizador dinámico para limpiar la alerta automática tras 1.5 segundos
  lanzarBanner(mensaje: string, tipo: 'success' | 'danger' = 'success') {
    this.banner.set({ message: mensaje, type: tipo });
    setTimeout(() => {
      this.banner.set(null);
    }, 1500); 
  }

  openAdd() {
    this.editingMaterial.set(null);
    this.form = this.resetForm();
    this.isModalOpen.set(true);
  }

  openEdit(m: Material) {
    this.editingMaterial.set(m);
    this.form = { ...m };
    this.isModalOpen.set(true);
  }

  save() {
    this.form.nombre = this.form.nombre.toUpperCase().trim();
    const esEdicion = !!this.editingMaterial();
    const id = this.editingMaterial()?.id_material;

    const request = esEdicion
      ? this.api.updateMaterial(id!, this.form)
      : this.api.createMaterial(this.form);

    request.subscribe({
      next: () => {
        this.cargarDatos();
        this.isModalOpen.set(false);
        this.lanzarBanner(
          esEdicion ? '¡Material modificado con éxito! ' : '¡Material registrado con éxito! ', 
          'success'
        );
      },
      error: (err: any) => {
        const msg = err.error?.mensaje || 'Error al procesar la solicitud';
        this.lanzarBanner(msg, 'danger');
      }
    });
  }

  // Abre el modal de confirmación personalizado en lugar del alert nativo
  solicitarConfirmacionEliminar(id: number) {
    this.idMaterialAEliminar.set(id);
    this.isDeleteModalOpen.set(true);
  }

  // Ejecuta la baja lógica/física desde la ventana confirmada
  confirmarEliminacion() {
    const id = this.idMaterialAEliminar();
    if (id !== null) {
      this.api.deleteMaterial(id).subscribe({
        next: () => {
          this.cargarDatos();
          this.isDeleteModalOpen.set(false);
          this.idMaterialAEliminar.set(null);
          this.lanzarBanner('Material removido del inventario correctamente ', 'success');
        },
        error: () => {
          this.isDeleteModalOpen.set(false);
          this.lanzarBanner('No se pudo eliminar el insumo seleccionado', 'danger');
        }
      });
    }
  }

  cancelarEliminacion() {
    this.isDeleteModalOpen.set(false);
    this.idMaterialAEliminar.set(null);
  }

  private resetForm(): Material {
    return {
      nombre: '',
      unidad_id: 1,
      precio_unitario: 0,
      stock: 0
    };
  }
}