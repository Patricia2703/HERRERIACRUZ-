import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  usuarioLogueado: any = null;
  inicialNombre: string = 'U';

  constructor(private router: Router) {}

  ngOnInit() {
    // Recuperamos los datos que guardó el AuthComponent al loguearse
    const datosSesion = localStorage.getItem('token_usuario');
    if (datosSesion) {
      this.usuarioLogueado = JSON.parse(datosSesion);
      // Extraemos la primera letra del nombre para el círculo amarillo
      if (this.usuarioLogueado.nombre) {
        this.inicialNombre = this.usuarioLogueado.nombre.charAt(0).toUpperCase();
      }
    } else {
      // Si por alguna razón no hay sesión y está dentro, lo regresamos al login
      this.router.navigate(['/login']);
    }
  }

  logout() {
    // Limpiamos los datos del usuario y lo mandamos al Login de inmediato
    localStorage.removeItem('token_usuario');
    this.router.navigate(['/login']);
  }
}