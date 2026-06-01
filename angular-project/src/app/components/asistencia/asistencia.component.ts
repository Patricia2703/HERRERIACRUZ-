import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistencia.component.html',
  styleUrls: ['./asistencia.component.css']
})
export class AsistenciaComponent implements OnInit {
  
  // --- Signals de Almacenamiento ---
  listaAsistencias = signal<any[]>([]);
  listaEmpleados = signal<any[]>([]);       
  listaHistorialSemanal = signal<any[]>([]); 

  // --- Signals de Modales de Flujo ---
  isModalEntradaOpen = signal<boolean>(false);
  isModalSalidaOpen = signal<boolean>(false);
  isModalNominaOpen = signal<boolean>(false);

  // --- Signals para Notificaciones y Alertas Limpias ---
  alertaOpen = signal<boolean>(false);        
  alertaMensaje = signal<string>('');         
  alertaEsExito = signal<boolean>(true);      
  confirmOpen = signal<boolean>(false);       
  asistenciaIdSeleccionada = signal<number | null>(null); 

  // --- Signals del Calendario Interactivo de Nómina ---
  matrizCalendario = signal<any[]>([]);
  fechasConAsistenciaEmpleado = signal<Set<string>>(new Set());

  // --- Modelos de Formulario ---
  formEntrada = {
    empleado_id: null,
    fecha: '',
    hora: ''
  };

  formSalida = {
    id_asistencia: null,
    hora: ''
  };

  formNomina = {
    empleado_id: null,
    fecha_inicio: '',
    fecha_fin: ''
  };

  resultadoNomina = signal<any>(null);

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarAsistenciasNormales();
    this.cargarEmpleadosMaestros(); 
    this.cargarHistorialSemanal();
  }

  // --- Métodos de Carga (API) ---
  cargarAsistenciasNormales(): void {
    this.apiService.getAsistencias().subscribe({
      next: (data) => this.listaAsistencias.set(data),
      error: (err) => console.error('Error al traer asistencias diarias:', err)
    });
  }

  cargarEmpleadosMaestros(): void {
    this.apiService.getEmpleados().subscribe({
      next: (data) => {
        const formateados = data.map((e: any) => ({
          id_empleado: e.id_empleado,
          nombre: `${e.nombre} ${e.apellidoP || ''}`
        }));
        this.listaEmpleados.set(formateados);
      },
      error: (err) => {
        console.warn('Fallo getEmpleados(), extrayendo fallback de asistencias:', err);
        this.apiService.getAsistencias().subscribe({
          next: (data) => {
            const unicos: any[] = [];
            const mapeado = new Set();
            for (const item of data) {
              if (!mapeado.has(item.empleado_id)) {
                mapeado.add(item.empleado_id);
                unicos.push({ id_empleado: item.empleado_id, nombre: item.nombre_empleado });
              }
            }
            this.listaEmpleados.set(unicos);
          }
        });
      }
    });
  }

  cargarHistorialSemanal(): void {
    const semanaActual = 22; 
    const anioActual = 2026;

    this.apiService.getHistorialSemanal(semanaActual, anioActual).subscribe({
      next: (data) => this.listaHistorialSemanal.set(data),
      error: (err) => console.error('Error al construir grilla semanal:', err)
    });
  }

  // --- Controladores de Modales con Valores Automáticos ---
  abrirModalEntrada(): void {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');

    this.formEntrada.empleado_id = null;
    this.formEntrada.fecha = `${anio}-${mes}-${dia}`;
    this.formEntrada.hora = `${horas}:${minutos}`;
    
    this.isModalEntradaOpen.set(true);
  }

  abrirModalSalida(asistencia: any): void {
    this.formSalida.id_asistencia = asistencia.id_asistencia;
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    this.formSalida.hora = `${horas}:${minutos}`;
    
    this.isModalSalidaOpen.set(true);
  }

  abrirModalNomina(): void {
    this.formNomina.empleado_id = null;
    this.formNomina.fecha_inicio = '';
    this.formNomina.fecha_fin = '';
    this.resultadoNomina.set(null);
    this.generarMatrizCalendario(5, 2026); 
    this.isModalNominaOpen.set(true);
  }

  // --- Lógica del Calendario Interactivo ---
  onEmpleadoNominaChange(): void {
    this.resultadoNomina.set(null); 
    this.formNomina.fecha_inicio = '';
    this.formNomina.fecha_fin = '';
    
    const empId = this.formNomina.empleado_id;
    if (!empId) return;

    const fechasSet = new Set<string>();
    this.listaAsistencias().forEach(asistencia => {
      if (asistencia.empleado_id === empId) {
        fechasSet.add(asistencia.fecha); 
      }
    });
    
    this.fechasConAsistenciaEmpleado.set(fechasSet);
    this.generarMatrizCalendario(5, 2026); 
  }

  generarMatrizCalendario(mes: number, anio: number): void {
    const diasArr: any[] = [];
    const primerDiaFecha = new Date(anio, mes - 1, 1);
    let diaSemanaInicial = primerDiaFecha.getDay(); 
    if (diaSemanaInicial === 0) diaSemanaInicial = 7; 
    
    const totalDiasMes = new Date(anio, mes, 0).getDate();

    for (let i = 1; i < diaSemanaInicial; i++) {
      diasArr.push({ numeroDia: 0, esMesActual: false, fechaStr: '' });
    }

    for (let d = 1; d <= totalDiasMes; d++) {
      const mesStr = String(mes).padStart(2, '0');
      const diaStr = String(d).padStart(2, '0');
      const fullFechaStr = `${anio}-${mesStr}-${diaStr}`;

      diasArr.push({
        numeroDia: d,
        esMesActual: true,
        fechaStr: fullFechaStr,
        tieneAsistencia: this.fechasConAsistenciaEmpleado().has(fullFechaStr)
      });
    }
    this.matrizCalendario.set(diasArr);
  }

  seleccionarFechaCalendario(fechaSeleccionada: string): void {
    this.resultadoNomina.set(null);
    
    if (!this.formNomina.fecha_inicio || (this.formNomina.fecha_inicio && this.formNomina.fecha_fin)) {
      this.formNomina.fecha_inicio = fechaSeleccionada;
      this.formNomina.fecha_fin = '';
    } else if (this.formNomina.fecha_inicio && !this.formNomina.fecha_fin) {
      if (fechaSeleccionada >= this.formNomina.fecha_inicio) {
        this.formNomina.fecha_fin = fechaSeleccionada;
      } else {
        this.formNomina.fecha_inicio = fechaSeleccionada;
      }
    }
  }

  obtenerClaseEstiloDia(dia: any): string {
    const f = dia.fechaStr;
    const inicio = this.formNomina.fecha_inicio;
    const fin = this.formNomina.fecha_fin;

    if (f === inicio) return 'btn-primary text-white shadow-sm'; 
    if (f === fin) return 'btn-info text-dark shadow-sm fw-bold'; 
    if (inicio && fin && f > inicio && f < fin) {
      return 'btn-primary-subtle text-primary text-decoration-underline fw-bold'; 
    }
    if (dia.tieneAsistencia) {
      return 'btn-white border-success text-success bg-success-subtle bg-opacity-50'; 
    }
    return 'btn-white text-dark border'; 
  }

  // --- Operaciones con el Servidor ---
  guardarEntrada(): void {
    if (!this.formEntrada.empleado_id || !this.formEntrada.fecha || !this.formEntrada.hora) {
      this.mostrarAlerta('Por favor, selecciona un trabajador y llena todos los campos.', false);
      return;
    }

    this.apiService.registrarEntrada(this.formEntrada).subscribe({
      next: () => {
        this.isModalEntradaOpen.set(false);
        this.cargarAsistenciasNormales();
        this.cargarHistorialSemanal();
        this.mostrarAlerta('¡Entrada registrada con éxito! 📝', true);
      },
      error: (err) => this.mostrarAlerta('Error al registrar entrada: ' + (err.error?.error || err.message), false)
    });
  }

  guardarSalida(): void {
    if (!this.formSalida.id_asistencia || !this.formSalida.hora) {
      this.mostrarAlerta('Por favor introduce una hora de salida válida.', false);
      return;
    }

    this.apiService.registrarSalida(this.formSalida).subscribe({
      next: () => {
        this.isModalSalidaOpen.set(false);
        this.cargarAsistenciasNormales();
        this.cargarHistorialSemanal();
        this.mostrarAlerta('¡Salida procesada y horas calculadas correctamente! ⏱️', true);
      },
      error: (err) => this.mostrarAlerta('Error al registrar salida: ' + (err.error?.error || err.message), false)
    });
  }

  eliminarAsistencia(id: number): void {
    this.asistenciaIdSeleccionada.set(id);
    this.confirmOpen.set(true);
  }

  ejecutarEliminacion(): void {
    const id = this.asistenciaIdSeleccionada();
    if (!id) return;

    this.apiService.eliminarAsistencia(id).subscribe({
      next: () => {
        this.confirmOpen.set(false);
        this.cargarAsistenciasNormales();
        this.cargarHistorialSemanal();
        this.mostrarAlerta('Registro de asistencia eliminado correctamente.', true);
      },
      error: (err) => {
        this.confirmOpen.set(false);
        this.mostrarAlerta('Error al eliminar el registro: ' + err.message, false);
      }
    });
  }

  calcularNomina(): void {
    if (!this.formNomina.empleado_id || !this.formNomina.fecha_inicio || !this.formNomina.fecha_fin) {
      this.mostrarAlerta('Completa los filtros de rango de fechas usando el calendario.', false);
      return;
    }

    this.apiService.calcularNominaSemanal(this.formNomina).subscribe({
      next: (res) => this.resultadoNomina.set(res),
      error: (err) => this.mostrarAlerta('Error en cálculo de nómina: ' + (err.error?.error || err.message), false)
    });
  }

  // --- Auxiliares ---
  mostrarAlerta(mensaje: string, esExito: boolean) {
    this.alertaMensaje.set(mensaje);
    this.alertaEsExito.set(esExito);
    this.alertaOpen.set(true);
  }

  cerrarAlerta() {
    this.alertaOpen.set(false);
  }
}