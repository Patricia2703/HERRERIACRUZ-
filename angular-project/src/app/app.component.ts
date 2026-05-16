import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // Asegúrate de importar Router y RouterModule
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,      // <--- Esto quita el error NG8001 del router-outlet
    SidebarComponent, 
    HeaderComponent
    // Nota: DashboardComponent, ClientesComponent, etc. ya NO van aquí
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private router = inject(Router); // Inyectamos el router para la navegación

  isSidebarOpen = signal(false);
  activeMenuItem = signal('dashboard');

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  setMenuItem(id: string) {
    this.activeMenuItem.set(id);
    
    // Navegación automática según el ID del menú
    if (id === 'dashboard') {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/' + id]);
    }
  }
}