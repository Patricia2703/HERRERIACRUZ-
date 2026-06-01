import { Component, OnInit, inject, signal, computed } from '@angular/core'; // 🟢 CORREGIDO: Cambiado a '@angular/core'
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
  private api = inject(ApiService);

  datosFinancieros = signal<{ total_ganado: number; total_pendiente: number }>({ total_ganado: 0, total_pendiente: 0 });
  materialesTop = signal<any[]>([]);
  cotizaciones = signal<any[]>([]);

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    // 🟢 CORREGIDO: Agregados los ': any' a las respuestas y errores
    this.api.getReporteFinanciero().subscribe({
      next: (data: any) => this.datosFinancieros.set(data),
      error: (err: any) => console.error('Error en reporte financiero:', err)
    });

    this.api.getReporteMateriales().subscribe({
      next: (data: any) => this.materialesTop.set(data),
      error: (err: any) => console.error('Error en reporte materiales:', err)
    });

    this.api.getCotizaciones().subscribe({
      next: (data: any) => this.cotizaciones.set(data),
      error: (err: any) => console.error('Error al cargar cotizaciones para reportes:', err)
    });
  }

  totalCotizaciones = computed(() => this.cotizaciones().length);
  
  // 🟢 CORREGIDO: Agregado el tipo '(c: any)' en los filtros de los Signals
  aprobadasCount = computed(() => 
    this.cotizaciones().filter((c: any) => c.estado?.toLowerCase() === 'aprobada' || c.estatus?.toLowerCase() === 'aprobada').length
  );
  
  pendienteCount = computed(() => 
    this.cotizaciones().filter((c: any) => c.estado?.toLowerCase() === 'pendiente' || c.estatus?.toLowerCase() === 'pendiente').length
  );

  rechazadasCount = computed(() => 
    this.cotizaciones().filter((c: any) => c.estado?.toLowerCase() === 'rechazada' || c.estatus?.toLowerCase() === 'rechazada').length
  );
}