import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  esLogin: boolean = true; 
  urlBase: string = 'http://127.0.0.1:5000';

  // Controladores del Modal Dinámico
  modalEsExito: boolean = true;
  modalTitulo: string = '';
  modalMensaje: string = '';
  private bootstrapModalRef: any;

  formAuth = new FormGroup({
    correo: new FormControl('', [Validators.required, Validators.email]),
    contrasena: new FormControl('', [Validators.required, Validators.minLength(4)]),
    nombre: new FormControl(''),
    apellido_paterno: new FormControl(''),
    apellido_materno: new FormControl(''),
    edad: new FormControl('')
  });

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.limpiarValidadoresRegistro();
  }

  conmutarModo() {
    this.esLogin = !this.esLogin;
    this.formAuth.reset();

    if (!this.esLogin) {
      this.formAuth.get('nombre')?.setValidators([Validators.required]);
      this.formAuth.get('apellido_paterno')?.setValidators([Validators.required]);
      this.formAuth.get('apellido_materno')?.setValidators([Validators.required]);
      this.formAuth.get('edad')?.setValidators([Validators.required, Validators.min(18)]);
    } else {
      this.limpiarValidadoresRegistro();
    }
    this.formAuth.updateValueAndValidity();
  }

  private limpiarValidadoresRegistro() {
    this.formAuth.get('nombre')?.clearValidators();
    this.formAuth.get('apellido_paterno')?.clearValidators();
    this.formAuth.get('apellido_materno')?.clearValidators();
    this.formAuth.get('edad')?.clearValidators();
    
    this.formAuth.get('nombre')?.updateValueAndValidity();
    this.formAuth.get('apellido_paterno')?.updateValueAndValidity();
    this.formAuth.get('apellido_materno')?.updateValueAndValidity();
    this.formAuth.get('edad')?.updateValueAndValidity();
  }

  mostrarNotificacion(titulo: string, mensaje: string, esExito: boolean) {
    this.modalTitulo = titulo;
    this.modalMensaje = mensaje;
    this.modalEsExito = esExito;

    const elementoModal = document.getElementById('modalRespuestaAuth');
    if (elementoModal) {
      this.bootstrapModalRef = new bootstrap.Modal(elementoModal);
      this.bootstrapModalRef.show();
    }
  }

  cerrarModalNotificacion() {
    if (this.bootstrapModalRef) {
      this.bootstrapModalRef.hide();
    }

    // 🚨 LIMPIEZA ANTIBLOQUEO: Elimina rastros grises del DOM para liberar la vista
    const backdrops = document.getElementsByClassName('modal-backdrop');
    while (backdrops.length > 0) {
      backdrops[0].remove();
    }
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    // Redirección condicionada al éxito
    if (this.modalEsExito && this.esLogin && this.modalTitulo === '¡Excelente!') {
      this.router.navigate(['/dashboard']);
    } else if (this.modalEsExito && !this.esLogin) {
      this.conmutarModo();
    }
  }

  recuperarContrasena() {
    const correoUsuario = this.formAuth.get('correo')?.value;

    if (!correoUsuario || this.formAuth.get('correo')?.invalid) {
      this.mostrarNotificacion(
        'Atención', 
        'Por favor, ingresa un correo electrónico válido en el campo correspondiente para proceder.', 
        false
      );
      return;
    }

    this.mostrarNotificacion(
      'Recuperación Enviada', 
      'Se han enviado las instrucciones de restablecimiento al correo: ' + correoUsuario, 
      true
    );
  }

  enviar() {
    if (this.formAuth.invalid) return;

    if (this.esLogin) {
      const credenciales = {
        correo: this.formAuth.value.correo,
        contrasena: this.formAuth.value.contrasena
      };

      this.http.post(this.urlBase + '/login', credenciales).subscribe({
        next: (res: any) => {
          // Guardamos con la clave unificada para evitar discrepancias
          localStorage.setItem('token_usuario', JSON.stringify(res.usuario));
          this.mostrarNotificacion(
            '¡Excelente!', 
            'Bienvenido de vuelta, ' + res.usuario.nombre + '. Accediendo al sistema...', 
            true
          );
        },
        error: (err) => {
          const mensajeError = err.error?.error || 'Las credenciales ingresadas son incorrectas.';
          this.mostrarNotificacion('Error de Acceso', mensajeError, false);
        }
      });

    } else {
      this.http.post(this.urlBase + '/registro', this.formAuth.value).subscribe({
        next: (res: any) => {
          this.mostrarNotificacion(
            '¡Registro Exitoso!', 
            'La cuenta ha sido dada de alta correctamente. Ya puedes iniciar sesión.', 
            true
          );
        },
        error: (err) => {
          const mensajeError = err.error?.error || 'No se pudo completar el registro.';
          this.mostrarNotificacion('Error de Registro', mensajeError, false);
        }
      });
    }
  }
}