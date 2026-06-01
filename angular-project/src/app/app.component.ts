import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; 
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,      
    SidebarComponent, 
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private router = inject(Router); 

  isSidebarOpen = signal(false);
  activeMenuItem = signal('dashboard');

  // Comprueba si estás en el login para ocultar el header y sidebar
  enPantallaLogin(): boolean {
    return this.router.url?.includes('/login') || false;
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  setMenuItem(id: string) {
    this.activeMenuItem.set(id);
    
    // 🎯 CORRECCIÓN HISTÓRICA: Se cambia ['/'] por ['/dashboard']
    if (id === 'dashboard') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/' + id]);
    }
  }
}