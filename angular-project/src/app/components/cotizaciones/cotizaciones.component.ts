    import { Component, OnInit, inject, signal, computed } from '@angular/core';
    import { CommonModule } from '@angular/common';
    import { FormsModule } from '@angular/forms';
    import { ApiService } from '../../services/api.service';
    import { Cotizacion, DetalleCotizacion, Material } from '../../models/models';

    @Component({
      selector: 'app-cotizaciones',
      standalone: true,
      imports: [CommonModule, FormsModule],
      templateUrl: './cotizaciones.component.html'
    })
    export class CotizacionesComponent implements OnInit {
      private api = inject(ApiService);

      // Listas de datos remotos
      cotizaciones = signal<Cotizacion[]>([]);
      clientes = signal<any[]>([]);
      categorias = signal<any[]>([]); // Categorías generales de herrería (ej. Portones, Puertas)
      materialesDisponibles = signal<Material[]>([]);

      // Control de UI
      searchTerm = signal('');
      isModalOpen = signal(false);
      isDetalleModalOpen = signal(false);
      selectedCotizacionId = signal<number | null>(null);

      // Formularios
      formCotizacion: Cotizacion = this.resetCotizacionForm();
      formDetalle: DetalleCotizacion = this.resetDetalleForm();
      detallesActuales = signal<DetalleCotizacion[]>([]); // Para mostrar los materiales de la cotización seleccionada

      ngOnInit() {
        this.cargarDatos();
        this.cargarCatalogos();
      }

      cargarDatos() {
        this.api.getCotizaciones().subscribe((data: any) => this.cotizaciones.set(data));
      }

      cargarCatalogos() {
        this.api.getClientes().subscribe((data: any) => this.clientes.set(data));
        this.api.getMateriales().subscribe((data: any) => this.materialesDisponibles.set(data));
        // Asumiendo que tienes una ruta general para categorías de trabajos
        this.api.getUnidades().subscribe(); // Ajustar según tus necesidades de categorías generales
      }

      filteredCotizaciones = computed(() => {
        const q = this.searchTerm().toLowerCase();
        return this.cotizaciones().filter(c => 
          c.descripcion?.toLowerCase().includes(q) || 
          c.id_cotizacion?.toString() === q
        );
      });

      // ================= ACCIONES COTIZACIÓN =================
      openAddCotizacion() {
        this.formCotizacion = this.resetCotizacionForm();
        this.isModalOpen.set(true);
      }

      saveCotizacion() {
        this.api.createCotizacion(this.formCotizacion).subscribe({
          next: () => {
            this.cargarDatos();
            this.isModalOpen.set(false);
            alert('Cotización base creada con éxito. Ahora puedes añadir materiales.');
          },
          error: (err: any) => alert('Error: ' + err.error?.mensaje)
        });
      }
      exportarPDF(idCotizacion: number) {
  window.open(`http://127.0.0.1:5000/cotizaciones/${idCotizacion}/pdf`, '_blank');
}

      cambiarEstado(c: Cotizacion, nuevoEstado: 'pendiente' | 'aprobada' | 'rechazada') {
        const copia = { ...c, estado: nuevoEstado };
        this.api.updateCotizacion(c.id_cotizacion!, copia).subscribe({
          next: () => {
            this.cargarDatos();
            alert(`Cotización marcada como: ${nuevoEstado}`);
          },
          error: (err: any) => {
            // Captura el SIGNAL de MySQL si no hay suficiente stock
            alert('Error: ' + (err.error?.mensaje || 'Stock insuficiente en almacén para procesar esta aprobación.'));
          }
        });
      }

      // ================= GESTIÓN DE MATERIALES (DETALLES) =================
      openGestionMateriales(id: number) {
        this.selectedCotizacionId.set(id);
        this.formDetalle = this.resetDetalleForm();
        this.actualizarListaDetalles(id);
        this.isDetalleModalOpen.set(true);
      }

      actualizarListaDetalles(cotizacionId: number) {
        this.api.getDetallesCotizacion().subscribe((todos: any[]) => {
          // Filtramos en el cliente los detalles que pertenecen a esta cotización
          const filtrados = todos.filter(d => d.cotizacion_id === cotizacionId).map(d => {
            const mat = this.materialesDisponibles().find(m => m.id_material === d.material_id);
            return { ...d, material_nombre: mat ? mat.nombre : 'Desconocido' };
          });
          this.detallesActuales.set(filtrados);
          // Recargamos el listado general para actualizar los totales modificados por los Triggers
          this.cargarDatos(); 
        });
      }

      onMaterialSelect(materialId: any) {
        const mat = this.materialesDisponibles().find(m => m.id_material === Number(materialId));
        if (mat) {
          this.formDetalle.precio_unitario = mat.precio_unitario;
        }
      }

      agregarMaterial() {
        this.formDetalle.cotizacion_id = this.selectedCotizacionId()!;
        this.api.createDetalleCotizacion(this.formDetalle).subscribe({
          next: () => {
            this.actualizarListaDetalles(this.selectedCotizacionId()!);
            this.formDetalle = this.resetDetalleForm();
          },
          error: (err: any) => alert('Error al agregar material')
        });
      }

      eliminarMaterial(idDetalle: number) {
        if (confirm('¿Retirar este material del presupuesto?')) {
          this.api.deleteDetalleCotizacion(idDetalle).subscribe(() => {
            this.actualizarListaDetalles(this.selectedCotizacionId()!);
          });
        }
      }

      // ================= RESET FORMS =================
      private resetCotizacionForm(): Cotizacion {
        return { cliente_id: 1, categoria_id: 1, descripcion: '', ancho: 0, alto: 0, largo: 0, descripcion_medidas: '' };
      }

      private resetDetalleForm(): DetalleCotizacion {
        return { material_id: 1, cantidad: 1, precio_unitario: 0 };
      }
    }