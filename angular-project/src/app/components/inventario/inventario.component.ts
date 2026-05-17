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

  materiales = signal<Material[]>([]);
  unidades = signal<Unidad[]>([]);
  isModalOpen = signal(false);
  editingMaterial = signal<Material | null>(null);
  searchTerm = signal('');

  form: Material = this.resetForm();

  ngOnInit() {
    this.cargarDatos();
    this.cargarUnidades();
  }

  cargarDatos() {
    this.api.getMateriales().subscribe({
    next: (data: any) => this.materiales.set(data),
    error: (err: any) => console.error(err)
    });
  }

cargarUnidades() {
  this.api.getUnidades().subscribe({
    next: (data: any) => {
      console.log('Unidades desde Flask:', data); // Esto te ayudará a ver en la consola de F12 si llegan bien
      this.unidades.set(data); // Asegúrate de que use "this.unidades" y no otra variable
    },
    error: (err: any) => console.error('Error al cargar unidades:', err)
  });
}

  filteredMateriales = computed(() => {
    const q = this.searchTerm().toLowerCase().trim();
    return this.materiales().filter(m => m.nombre.toLowerCase().includes(q));
  });

  openAdd() {
    this.editingMaterial.set(null);
    this.form = this.resetForm();
    this.isModalOpen.set(true);
  }

  openEdit(m: Material) {
    this.editingMaterial.set(m);
    // Para editar necesitamos el unidad_id, si tu API no lo manda en el GET general, 
    // podrías necesitar buscar el ID basado en el nombre de la unidad o ajustar el GET de Flask.
    this.form = { ...m };
    this.isModalOpen.set(true);
  }

  save() {
    // 1. Formato
    this.form.nombre = this.form.nombre.toUpperCase().trim();

    // 2. Determinar acción
    const esEdicion = !!this.editingMaterial();
    const id = this.editingMaterial()?.id_material;

    const request = esEdicion
      ? this.api.updateMaterial(id!, this.form)
      : this.api.createMaterial(this.form);

    request.subscribe({
      next: () => {
        this.cargarDatos();
        this.isModalOpen.set(false);
        alert(esEdicion ? 'Material actualizado' : 'Material registrado');
      },
      error: (err: any) => {
  alert('Error: ' + (err.error?.mensaje || 'No se pudo guardar'));
}
    });
  }

  delete(id: number) {
    if (confirm('¿Desea eliminar este material del inventario?')) {
      this.api.deleteMaterial(id).subscribe(() => {
        this.cargarDatos();
        alert('Material eliminado');
      });
    }
  }

  private resetForm(): Material {
    return {
      nombre: '',
      unidad_id: 1, // Por defecto la primera unidad
      precio_unitario: 0,
      stock: 0
    };
  }
}