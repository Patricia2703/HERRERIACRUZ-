import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Pago } from '../../models/models';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css']
})
export class PagosComponent implements OnInit {
  api = inject(ApiService);  
  router = inject(Router); 

  listaPagos = signal<Pago[]>([]);
  listaCotizaciones = signal<any[]>([]); 
  isModalOpen = signal<boolean>(false);
  isSuccessModalOpen = signal<boolean>(false); 
  cotizacionExpandida = signal<number | null>(null);

  saldoRestante: number | null = null;
  totalCotizacionSeleccionada: number = 0;
  acumuladoPagado: number = 0;
  redirigirAlCerrar: boolean = false; 

  formPago = {
    cotizacion_id: null as number | null,
    monto: 0,
    tipo: 'parcial', 
    metodo_pago: 'efectivo'
  };

  ngOnInit(): void {
    this.cargarPagos();
    this.cargarCotizaciones();
  }

  cargarPagos(): void {
    this.api.getPagos().subscribe({
      next: (data) => this.listaPagos.set(data),
      error: (err) => console.error(err)
    });
  }

  cargarCotizaciones(): void {
    this.api.getCotizaciones().subscribe({
      next: (data) => this.listaCotizaciones.set(data),
      error: (err) => console.error(err)
    });
  }

  cotizacionesConCliente = computed(() => {
    const aprobadas = this.listaCotizaciones().filter(cot => 
      cot.estado === 'Aprobada' || cot.estado === 'aprobada' || cot.estatus === 'Aprobada'
    );

    return aprobadas.map(cot => {
      const nombreDetectado = cot.cliente || cot.nombre_cliente || cot.cliente_nombre || cot.nombre || '';
      return {
        ...cot,
        nombre_cliente: nombreDetectado.trim() !== '' ? nombreDetectado : `COTIZACIÓN #${cot.id_cotizacion}`
      };
    });
  });

  toggleHistorial(cotizacionId: number): void {
    if (this.cotizacionExpandida() === cotizacionId) {
      this.cotizacionExpandida.set(null);
    } else {
      this.cotizacionExpandida.set(cotizacionId);
    }
  }

  getPagosDeCotizacion(cotizacionId: number): Pago[] {
    return this.listaPagos().filter(p => Number(p.cotizacion_id) === Number(cotizacionId));
  }

  getSumatoriaPagos(cotizacionId: number): number {
    return this.getPagosDeCotizacion(cotizacionId)
      .reduce((sum, p) => sum + Number(p.monto || 0), 0);
  }

  onCotizacionChange(): void {
    const cotId = this.formPago.cotizacion_id;
    if (!cotId) {
      this.saldoRestante = null;
      return;
    }

    const cotizacionSeleccionada = this.listaCotizaciones().find(c => Number(c.id_cotizacion) === Number(cotId));
    this.totalCotizacionSeleccionada = cotizacionSeleccionada ? Number(cotizacionSeleccionada.total || 0) : 0;
    
    this.acumuladoPagado = this.getSumatoriaPagos(cotId);
    this.saldoRestante = this.totalCotizacionSeleccionada - this.acumuladoPagado;
  }

  openNuevoPago(cotizacionId?: number): void {
    this.formPago = {
      cotizacion_id: cotizacionId || null,
      monto: 0,
      tipo: 'parcial', 
      metodo_pago: 'efectivo'
    };
    this.onCotizacionChange();
    this.isModalOpen.set(true);
  }

  exportarRemision(idCotizacion: number | undefined) {
    if (!idCotizacion) return;
    this.api.ejecutarDescargaInmediata(idCotizacion);
  }

  guardarPago() {
    const idCotizacion = this.formPago.cotizacion_id; 

    if (idCotizacion === null || idCotizacion === undefined) {
      return;
    }

    const datosDelPago: Pago = {
      cotizacion_id: Number(idCotizacion), 
      monto: this.formPago.monto,
      tipo: this.formPago.tipo,
      metodo_pago: this.formPago.metodo_pago
    };

    this.api.crearPago(datosDelPago).subscribe({
      next: (res: any) => {
        const nuevoAcumulado = this.acumuladoPagado + this.formPago.monto;
        this.redirigirAlCerrar = (this.totalCotizacionSeleccionada - nuevoAcumulado) <= 0 || (res && res.saldo_restante <= 0);

        if (this.redirigirAlCerrar) {
          this.api.ejecutarDescargaInmediata(idCotizacion);
        }

        this.cerrarModalFormulario();
        this.isSuccessModalOpen.set(true);
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  aceptarExito(): void {
    this.isSuccessModalOpen.set(false);
    this.limpiarBackdropsSueltos();

    if (this.redirigirAlCerrar) {
      this.router.navigate(['/trabajos']);
    } else {
      this.cargarPagos();
      this.cargarCotizaciones();
    }
  }

  cerrarModalFormulario(): void {
    this.isModalOpen.set(false);
    this.limpiarBackdropsSueltos();
  }

  private limpiarBackdropsSueltos(): void {
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('padding-right');
    const backdrops = document.getElementsByClassName('modal-backdrop');
    while (backdrops.length > 0) {
      backdrops[0].remove();
    }
  }

  eliminarPago(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este registro de pago?')) {
      this.api.eliminarPago(id).subscribe({
        next: () => {
          this.cargarPagos();
          this.cargarCotizaciones();
        },
        error: (err: any) => console.error(err)
      });
    }
  }
}