import { Component } from '@angular/core';

@Component({
  selector: 'app-reportes',
  standalone: true,
  template: '<p>Reportes en construcción</p>'
})
export class ReportesComponent {} // La clase DEBE existir y estar exportada
/*
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/delete_data.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent {
  data = inject(DataService);

  // ── KPIs generales ──
  kpis = computed(() => {
    const trabajos     = this.data.trabajos();
    const clientes     = this.data.clientes();
    const cotizaciones = this.data.cotizaciones();
    const productos    = this.data.productos();

    const ingresoTotal    = trabajos.filter(t => t.estado === 'Terminado').reduce((s,t) => s + t.precio, 0);
    const ticketPromedio  = trabajos.length > 0 ? Math.round(ingresoTotal / trabajos.filter(t=>t.estado==='Terminado').length) : 0;
    const tasaAprobacion  = cotizaciones.length > 0 ? Math.round((cotizaciones.filter(c=>c.estado==='Aprobada').length / cotizaciones.length) * 100) : 0;
    const valorInventario = productos.reduce((s,p) => s + p.stock * p.precioUnitario, 0);

    return [
      { title: 'Ingresos Totales',     value: this.data.formatPrecio(ingresoTotal),    desc: 'De trabajos terminados', icon: '💰', color: '#22c55e' },
      { title: 'Ticket Promedio',       value: this.data.formatPrecio(ticketPromedio),  desc: 'Por trabajo terminado',  icon: '📊', color: '#4682B4' },
      { title: 'Tasa de Aprobación',    value: tasaAprobacion + '%',                    desc: 'Cotizaciones aprobadas', icon: '✅', color: '#FFC107' },
      { title: 'Valor del Inventario',  value: this.data.formatPrecio(valorInventario), desc: 'En materiales y equipos', icon: '📦', color: '#f97316' },
    ];
  });

  // ── Distribución de trabajos por estado ──
  trabajosPorEstado = computed(() => {
    const ts = this.data.trabajos();
    const total = ts.length || 1;
    return [
      { label:'Terminados', count: ts.filter(t=>t.estado==='Terminado').length,  color:'#22c55e' },
      { label:'En Proceso', count: ts.filter(t=>t.estado==='En Proceso').length, color:'#4682B4' },
      { label:'Pendientes', count: ts.filter(t=>t.estado==='Pendiente').length,  color:'#FFC107' },
    ].map(r => ({ ...r, pct: Math.round((r.count/total)*100) }));
  });

  // ── Distribución de cotizaciones por estado ──
  cotizacionesPorEstado = computed(() => {
    const cs = this.data.cotizaciones();
    const total = cs.length || 1;
    return [
      { label:'Aprobadas',    count: cs.filter(c=>c.estado==='Aprobada').length,    color:'#22c55e' },
      { label:'Pendientes',   count: cs.filter(c=>c.estado==='Pendiente').length,   color:'#FFC107' },
      { label:'En Revisión',  count: cs.filter(c=>c.estado==='En Revisión').length, color:'#4682B4' },
      { label:'Rechazadas',   count: cs.filter(c=>c.estado==='Rechazada').length,   color:'#ef4444' },
    ].map(r => ({ ...r, pct: Math.round((r.count/total)*100) }));
  });

  // ── Top 5 clientes por trabajo ──
  topClientes = computed(() => {
    const map = new Map<string, { nombre: string; count: number; total: number }>();
    this.data.trabajos().forEach(t => {
      const cur = map.get(t.cliente) ?? { nombre: t.cliente, count: 0, total: 0 };
      map.set(t.cliente, { nombre: t.cliente, count: cur.count + 1, total: cur.total + t.precio });
    });
    return [...map.values()].sort((a,b) => b.total - a.total).slice(0, 5);
  });

  // ── Productos con stock crítico ──
  stockCritico = computed(() =>
    this.data.productos()
      .filter(p => p.stock <= p.stockMinimo)
      .sort((a,b) => a.stock - b.stock)
  );

  // ── Datos mensuales (simulados — conectar al API para reales) ──
  mensual = [
    { mes:'Ene', ingresos:24000, trabajos:12, cotizaciones:8 },
    { mes:'Feb', ingresos:28500, trabajos:15, cotizaciones:11 },
    { mes:'Mar', ingresos:35000, trabajos:18, cotizaciones:14 },
    { mes:'Abr', ingresos:27000, trabajos:14, cotizaciones:10 },
    { mes:'May', ingresos:42000, trabajos:22, cotizaciones:17 },
    { mes:'Jun', ingresos:38000, trabajos:19, cotizaciones:13 },
    { mes:'Jul', ingresos:48000, trabajos:25, cotizaciones:19 },
    { mes:'Ago', ingresos:41000, trabajos:21, cotizaciones:16 },
  ];

  maxMensual = Math.max(...this.mensual.map(m => m.ingresos));

  barH(v: number, max: number): number { return Math.max(4, Math.round((v/max)*100)); }
  formatPrecio(n: number): string { return this.data.formatPrecio(n); }

  exportarPDF() { alert('Exportando reporte PDF... (conectar librería jsPDF o backend)'); }
  exportarCSV() {
    const rows = [
      ['Mes','Ingresos','Trabajos','Cotizaciones'],
      ...this.mensual.map(m => [m.mes, m.ingresos, m.trabajos, m.cotizaciones])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'reporte-herreria-cruz.csv'; a.click();
    URL.revokeObjectURL(url);
  }
}
*/
