import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Cotizacion, Cliente, Categoria } from '../../models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-cotizaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cotizaciones.component.html',
  styleUrl: './cotizaciones.component.css' // Asegúrate que el archivo exista
})
export class CotizacionesComponent implements OnInit {
  private api = inject(ApiService);

  // Signals para estado reactivo
  cotizaciones = signal<Cotizacion[]>([]);
  clientes = signal<Cliente[]>([]);
  categorias = signal<Categoria[]>([]);
  
  filterEstado = signal('Todas');
  isModalOpen = signal(false);
  editingQuote = signal<Cotizacion | null>(null);

  // Búsqueda de cliente en el formulario
  clienteSearch = signal('');
  showSuggestions = signal(false);

  // Formulario alineado a tu DB
  form: Cotizacion = {
    cliente_id: 0,
    categoria_id: 0,
    descripcion: '',
    ancho: 0,
    alto: 0,
    largo: 0,
    descripcion_medidas: '',
    estado: 'pendiente'
  };

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    forkJoin({
      cot: this.api.getCotizaciones(),
      cli: this.api.getClientes(),
      cat: this.api.getCategorias()
    }).subscribe({
      next: (res) => {
        this.cotizaciones.set(res.cot);
        this.clientes.set(res.cli);
        this.categorias.set(res.cat);
      },
      error: (err) => console.error('Error cargando datos:', err)
    });
  }

  // Filtrado reactivo para la tabla
  filteredQuotations = computed(() => {
    const f = this.filterEstado();
    return f === 'Todas' ? this.cotizaciones() : this.cotizaciones().filter(c => c.estado === f);
  });

  // Sugerencias de clientes por nombre o apellido
  clienteSuggestions = computed(() => {
    const q = this.clienteSearch().toLowerCase().trim();
    if (!q) return [];
    return this.clientes().filter(c => 
      c.nombre.toLowerCase().includes(q) || 
      c.apellidoP.toLowerCase().includes(q)
    ).slice(0, 5);
  });

  openAdd() {
    this.editingQuote.set(null);
    this.resetForm();
    this.isModalOpen.set(true);
  }

  openEdit(q: Cotizacion) {
    this.editingQuote.set(q);
    this.form = { ...q };
    // Buscar nombre del cliente para el input de búsqueda
    const cliente = this.clientes().find(c => c.id_cliente === q.cliente_id);
    this.clienteSearch.set(cliente ? `${cliente.nombre} ${cliente.apellidoP}` : '');
    this.isModalOpen.set(true);
  }

  resetForm() {
    this.form = { 
      cliente_id: 0, 
      categoria_id: 0, 
      descripcion: '', 
      ancho: 0, 
      alto: 0, 
      largo: 0, 
      descripcion_medidas: '', 
      estado: 'pendiente' 
    };
    this.clienteSearch.set('');
  }

  selectCliente(c: Cliente) {
    this.form.cliente_id = c.id_cliente!;
    this.clienteSearch.set(`${c.nombre} ${c.apellidoP}`);
    this.showSuggestions.set(false);
  }

  save() {
    if (this.form.cliente_id === 0 || this.form.categoria_id === 0) {
      return alert('Selecciona cliente y categoría');
    }
    
    const request = this.editingQuote() 
      ? this.api.updateCotizacion(this.editingQuote()!.id_cotizacion!, this.form)
      : this.api.createCotizacion(this.form);

    request.subscribe(() => {
      this.cargarDatos();
      this.isModalOpen.set(false);
      this.resetForm();
    });
  }

  delete(id: number) {
    if (confirm('¿Eliminar cotización definitiva?')) {
      this.api.deleteCotizacion(id).subscribe(() => this.cargarDatos());
    }
  }

  estadoBadge(estado: string): string {
    const map: Record<string, string> = { 
      'aprobada': 'bg-success', 
      'pendiente': 'bg-warning', 
      'rechazada': 'bg-danger' 
    };
    return `badge ${map[estado.toLowerCase()] || 'bg-secondary'}`;
  }
}