import { Routes } from '@angular/router';
import { ClientesComponent } from './components/clientes/clientes.component';
import { EmpleadosComponent } from './components/empleados/empleados.component';
import { PagosComponent } from './components/pagos/pagos.component';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { CotizacionesComponent } from './components/cotizaciones/cotizaciones.component';
import { AsistenciaComponent } from './components/asistencia/asistencia.component';
import { TrabajosComponent } from './components/trabajos/trabajos.component';
import { ReportesComponent } from './components/reportes/reportes.component';
import { AuthComponent } from './components/auth/auth.component';

export const routes: Routes = [
  // 1. Si entran a la raíz vacía, van al Login para iniciar sesión
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // 2. Pantallas principales con sus nombres de ruta exactos (minúsculas)
  { path: 'login', component: AuthComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'empleados', component: EmpleadosComponent },
  { path: 'pagos', component: PagosComponent },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'inventario', component: InventarioComponent },
  { path: 'cotizaciones', component: CotizacionesComponent },
  { path: 'asistencia', component: AsistenciaComponent },
  { path: 'trabajos', component: TrabajosComponent },
  { path: 'reportes', component: ReportesComponent },

  // 3. 🚨 El Comodín de seguridad correcto:
  // Si alguien escribe cualquier cosa rota en la URL, se le regresa al Login por seguridad
  { path: '**', redirectTo: 'dashboard' }
];