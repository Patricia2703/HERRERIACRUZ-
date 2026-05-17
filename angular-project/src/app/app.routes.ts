import { Routes } from '@angular/router';
import { ClientesComponent } from './components/clientes/clientes.component';
import { EmpleadosComponent } from './components/empleados/empleados.component';
import { PagosComponent } from './components/pagos/pagos.component';
import { CatalogoComponent } from './components/catalogo/catalogo.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { CotizacionesComponent } from './components/cotizaciones/cotizaciones.component';


export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'empleados', component: EmpleadosComponent },
  { path: 'pagos', component: PagosComponent },
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'inventario', component: InventarioComponent },
    { path: 'cotizaciones', component: CotizacionesComponent },
  { path: '**', redirectTo: '' } // Redirige a inicio si la ruta no existe
];