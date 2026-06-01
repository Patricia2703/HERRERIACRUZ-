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
  categorias = signal<any[]>([]); 
  materialesDisponibles = signal<Material[]>([]);

  // Control de UI
  searchTerm = signal('');
  isModalOpen = signal(false);
  isDetalleModalOpen = signal(false);
  selectedCotizacionId = signal<number | null>(null);

  // 🚦 SEÑALES PARA REEMPLAZAR ALERTS Y CONFIRMS CON MODALES BOOTSTRAP
  alertaOpen = signal<boolean>(false);        // Abre/Cierra modal de alertas
  alertaMensaje = signal<string>('');         // Mensaje dinámico de la alerta
  alertaEsExito = signal<boolean>(true);      // Define si es verde (éxito) o rojo (error)

  confirmOpen = signal<boolean>(false);       // Abre/Cierra modal de confirmación
  detalleIdAEliminar = signal<number | null>(null); // Guarda temporalmente el id de material a retirar

  // Formularios
  formCotizacion: Cotizacion = this.resetCotizacionForm();
  formDetalle: DetalleCotizacion = this.resetDetalleForm();
  detallesActuales = signal<DetalleCotizacion[]>([]); 

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
    
    if ((this.api as any).getCcategorias) {
      (this.api as any).getCcategorias().subscribe((data: any) => this.categorias.set(data));
    }
    if (this.api.getUnidades) {
      this.api.getUnidades().subscribe(); 
    }
  }

  filteredCotizaciones = computed(() => {
    const q = this.searchTerm().toLowerCase().trim();
    if (!q) return this.cotizaciones();
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
        this.mostrarAlerta('Cotización base creada con éxito. Ahora puedes añadir los materiales necesarios.', true);
      },
      error: (err: any) => {
        this.mostrarAlerta('Error: ' + (err.error?.mensaje || 'No se pudo estructurar la cotización.'), false);
      }
    });
  }

  // Descarga directa al servidor Flask usando la ruta exacta (/remision)
  exportarRemision(idCotizacion: number | undefined) {
    if (!idCotizacion) return;
    const urlBase = this.api.getBaseUrl ? this.api.getBaseUrl() : 'http://127.0.0.1:5000';
    window.open(`${urlBase}/cotizaciones/${idCotizacion}/remision`, '_blank');
  }

  cambiarEstado(c: Cotizacion, nuevoEstado: 'pendiente' | 'aprobada' | 'rechazada') {
    const copia = { ...c, estado: nuevoEstado };
    this.api.updateCotizacion(c.id_cotizacion!, copia).subscribe({
      next: () => {
        this.cargarDatos();
        this.mostrarAlerta(`La cotización ha sido marcada como: ${nuevoEstado.toUpperCase()} correctamente.`, true);
      },
      error: (err: any) => {
        this.mostrarAlerta('Error de inventario: ' + (err.error?.mensaje || 'Stock insuficiente en almacén para procesar esta aprobación.'), false);
      }
    });
  }

  // ================= GESTIÓN DE MATERIALES (DETALLES) =================
  openGestionMateriales(id: number | undefined) {
    if (id === undefined || id === null) return;
    this.selectedCotizacionId.set(id);
    this.formDetalle = this.resetDetalleForm();
    this.actualizarListaDetalles(id);
    this.isDetalleModalOpen.set(true);
  }

  actualizarListaDetalles(cotizacionId: number) {
    this.api.getDetallesCotizacion().subscribe((todos: any[]) => {
      const filtrados = todos.filter(d => d.cotizacion_id === cotizacionId).map(d => {
        const mat = this.materialesDisponibles().find(m => m.id_material === d.material_id);
        return { ...d, material_nombre: mat ? mat.nombre : 'Desconocido' };
      });
      this.detallesActuales.set(filtrados);
      this.cargarDatos(); 
    });
  }

  onMaterialSelect(materialId: any) {
    const mat = this.materialesDisponibles().find(m => m.id_material === Number(materialId));
    if (mat) {
      const mAny = mat as any;
      this.formDetalle.precio_unitario = mAny.precio || mAny.precio_unitario || 0;
    }
  }

  agregarMaterial() {
    const id = this.selectedCotizacionId();
    if (!id) return;

    this.formDetalle.cotizacion_id = id;
    this.api.createDetalleCotizacion(this.formDetalle).subscribe({
      next: () => {
        this.actualizarListaDetalles(id);
        this.formDetalle = this.resetDetalleForm();
      },
      error: (err: any) => {
        console.error(err);
        this.mostrarAlerta('No se pudo añadir el material seleccionado.', false);
      }
    });
  }

  // Reemplazo del confirm() nativo
  eliminarMaterial(idDetalle: number | undefined) {
    if (!idDetalle) return;
    this.detalleIdAEliminar.set(idDetalle);
    this.confirmOpen.set(true);
  }

  confirmarRetirarMaterial() {
    const idDetalle = this.detalleIdAEliminar();
    const idCotizacion = this.selectedCotizacionId();

    if (idDetalle) {
      this.api.deleteDetalleCotizacion(idDetalle).subscribe({
        next: () => {
          this.confirmOpen.set(false);
          if (idCotizacion) this.actualizarListaDetalles(idCotizacion);
        },
        error: (err: any) => {
          console.error(err);
          this.confirmOpen.set(false);
          this.mostrarAlerta('No se pudo retirar el material de la cotización.', false);
        }
      });
    }
  }

  // ================= MÉTODOS AUXILIARES DE ALERTA BOOTSTRAP =================
  mostrarAlerta(mensaje: string, esExito: boolean) {
    this.alertaMensaje.set(mensaje);
    this.alertaEsExito.set(esExito);
    this.alertaOpen.set(true);
  }

  cerrarAlerta() {
    this.alertaOpen.set(false);
  }

  // ================= MÉTODOS DE INICIALIZACIÓN (RESET) =================
  private resetCotizacionForm(): Cotizacion {
    return {
      cliente_id: 0,
      categoria_id: 0,
      descripcion: '',
      alto: 0,
      ancho: 0,
      largo: 0,
      descripcion_medidas: '',
      estado: 'pendiente'
    };
  }

  private resetDetalleForm(): DetalleCotizacion {
    return {
      cotizacion_id: 0,
      material_id: 0,
      cantidad: 1,
      precio_unitario: 0
    };
  }
}