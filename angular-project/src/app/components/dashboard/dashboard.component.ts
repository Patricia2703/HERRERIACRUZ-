import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service'; // Tu servicio de conexión a Python
import { Cliente, Trabajo, Cotizacion } from '../../models/models'; // Tus modelos de datos
import { forkJoin, catchError, of } from 'rxjs'; // Añadidos catchError y of para el blindaje

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  usuarioNombre: string = 'Usuario';

  // Signals reactivos vacíos listos para recibir lo que venga de tu base de datos
  clientes = signal<Cliente[]>([]);
  trabajos = signal<Trabajo[]>([]);
  cotizaciones = signal<Cotizacion[]>([]);
  catalogo = signal<any[]>([]); 

  ngOnInit() {
    this.validarYSincronizarSesion();
    this.cargarDatosDesdeBD();
  }

  validarYSincronizarSesion() {
    try {
      const session = localStorage.getItem('token_usuario');
      if (!session) {
        this.router.navigate(['/login']);
        return;
      }
      const user = JSON.parse(session);
      if (user && user.nombre) {
        const nombreMayus = user.nombre.toUpperCase();
        const esMujer = nombreMayus.endsWith('A') || nombreMayus.includes('PATRICIA') || nombreMayus.includes('MARIA');
        const prefijo = esMujer ? 'Sra. ' : 'Sr. ';
        this.usuarioNombre = `${prefijo}${user.nombre} ${user.apellido_paterno || ''}`.trim();
      } else {
        this.usuarioNombre = 'Arturo Cruz';
      }
    } catch (error) {
      this.router.navigate(['/login']);
    }
  }

  // 🎯 FUNCIÓN CORREGIDA Y BLINDADA: Evita que errores de Flask tumben la sesión
  cargarDatosDesdeBD() {
    forkJoin({
      c: this.api.getClientes().pipe(catchError(err => { console.error('Error al traer Clientes:', err); return of([]); })),
      t: this.api.getTrabajos().pipe(catchError(err => { console.error('Error al traer Trabajos:', err); return of([]); })),
      cot: this.api.getCotizaciones().pipe(catchError(err => { console.error('Error al traer Cotizaciones:', err); return of([]); })),
      cat: this.api.getTrabajosCatalogo().pipe(catchError(err => { console.error('Error al traer Catálogo:', err); return of([]); }))
    }).subscribe({
      next: (res: any) => {
        // Guardamos las respuestas seguras (si algo falló, llegará como un arreglo vacío [])
        this.clientes.set(res.c || []);
        this.trabajos.set(res.t || []);
        this.cotizaciones.set(res.cot || []);
        this.catalogo.set(res.cat || []);
      },
      error: (err) => {
        // Este bloque ya no se alcanzará porque interceptamos los fallos individualmente arriba
        console.error('Error general grave en forkJoin:', err);
      }
    });
  }

  // Cálculos automáticos de los contadores basados en tus datos reales
  kpis = computed(() => [
    {
      title: 'Trabajos Totales',
      value: String(this.trabajos().length),
      change: 'registrados en sistema',
      changeType: 'neutral',
      icon: 'fa-hammer',
      colorFrom: '#2b5876', colorTo: '#4e4376'
    },
    {
      title: 'Clientes',
      value: String(this.clientes().length),
      change: 'en base de datos',
      changeType: 'positive',
      icon: 'fa-users',
      colorFrom: '#11998e', colorTo: '#38ef7d'
    },
    {
      title: 'Cotizaciones',
      value: String(this.cotizaciones().length),
      change: 'pendientes y aprobadas',
      changeType: 'neutral',
      icon: 'fa-file-invoice',
      colorFrom: '#f12711', colorTo: '#f5af19'
    }
  ]);

  // Filtra los últimos 5 trabajos reales de la base de datos para la tabla
  recentWorks = computed(() => 
    [...this.trabajos()].reverse().slice(0, 5)
  );

  // Filtra las fotos reales de tu catálogo para el carrusel
  trabajosConImagen = computed(() => {
    return this.catalogo()
      .filter(item => item && item.ruta_imagen && String(item.ruta_imagen).trim() !== '')
      .reverse()
      .slice(0, 6);
  });
}