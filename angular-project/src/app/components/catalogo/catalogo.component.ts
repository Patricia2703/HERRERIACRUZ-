import { Component, OnInit, inject, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css']
})
export class CatalogoComponent implements OnInit {
  private api = inject(ApiService);

  listaTrabajos = signal<any[]>([]);          
  ordenesDisponibles = signal<any[]>([]);     
  modalSistemaOpen = signal<boolean>(false);  
  modalLibreOpen = signal<boolean>(false);    
  
  alertaOpen = signal<boolean>(false);        
  alertaMensaje = signal<string>('');         
  alertaEsExito = signal<boolean>(true);      
  
  imagenSeleccionada: File | null = null;     
  urlBase = 'http://35.194.11.111:5000';          

  formCatalogo = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    fecha_elaboracion: new FormControl('', [Validators.required]),
    trabajo_id: new FormControl(''),          
    foto: new FormControl<any>(null)          
  });

  ngOnInit() {
    this.obtenerCatalogoCompleto();
    this.cargarOrdenesDisponibles();
  }

  descargarPDF() {
    this.api.descargarCatalogoPdf().subscribe({
      next: (res: Blob) => {
        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Catalogo_Herreria_Cruz.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al bajar el catálogo:', err);
        this.mostrarAlerta('No se pudo generar el documento PDF desde el servidor.', false);
      }
    });
  }

  obtenerCatalogoCompleto() {
    this.api.getTrabajosCatalogo().subscribe({
      next: (data) => this.listaTrabajos.set(data),
      error: (err) => {
        console.error('Error al obtener el catálogo:', err);
        this.mostrarAlerta('No se pudo cargar el catálogo desde el servidor backend.', false);
      }
    });
  }

  cargarOrdenesDisponibles() {
    this.api.getTrabajosCatalogo().subscribe({
      next: (data) => {
        this.ordenesDisponibles.set(data);
      },
      error: (err) => {
        console.error('No se pudieron cargar las órdenes:', err);
      }
    });
  }

  onOrdenChange(event: any) {
    const idTrabajo = event.target.value;
    if (!idTrabajo) {
      this.formCatalogo.patchValue({ nombre: '', fecha_elaboracion: '' });
      return;
    }

    const orden = this.ordenesDisponibles().find(o => 
      o.id_trabajo == idTrabajo || o.id == idTrabajo || o.id_cotizacion == idTrabajo
    );
    
    if (orden) {
      const nombreProyecto = orden.nombre_proyecto || orden.descripcion || orden.nombre || `Orden #${idTrabajo}`;
      this.formCatalogo.patchValue({ nombre: nombreProyecto });
      
      if (orden.fecha_fin) {
        const fechaObj = new Date(orden.fecha_fin);
        if (!isNaN(fechaObj.getTime())) {
          const yyyy = fechaObj.getFullYear();
          const mm = String(fechaObj.getMonth() + 1).padStart(2, '0');
          const dd = String(fechaObj.getDate()).padStart(2, '0');
          this.formCatalogo.patchValue({ fecha_elaboracion: `${yyyy}-${mm}-${dd}` });
        } else {
          this.formCatalogo.patchValue({ fecha_elaboracion: orden.fecha_fin.substring(0, 10) });
        }
      }
    }
  }

  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.imagenSeleccionada = file; 
      this.formCatalogo.patchValue({ foto: file });
      this.formCatalogo.get('foto')?.updateValueAndValidity();
    }
  }

  guardarEnCatalogo() {
    if (this.formCatalogo.invalid || !this.imagenSeleccionada) {
      this.mostrarAlerta('Por favor, rellena todos los campos requeridos y selecciona una imagen.', false);
      return;
    }

    const formData = new FormData();
    formData.append('nombre', this.formCatalogo.get('nombre')?.value || '');
    formData.append('fecha_elaboracion', this.formCatalogo.get('fecha_elaboracion')?.value || '');
    
    const idTrabajo = this.formCatalogo.get('trabajo_id')?.value;
    formData.append('trabajo_id', idTrabajo ? idTrabajo.toString() : '');
    formData.append('foto', this.imagenSeleccionada, this.imagenSeleccionada.name);

    this.api.crearTrabajoCatalogo(formData).subscribe({
      next: () => {
        this.cerrarModales();
        this.obtenerCatalogoCompleto();
        this.mostrarAlerta('¡Trabajo guardado con éxito en el catálogo! 🎉', true);
      },
      error: (err) => {
        console.error('Error en subida:', err);
        const errorMsg = err.error?.error || 'Excepción interna en el servidor Flask';
        this.mostrarAlerta('Error en el servidor: ' + errorMsg, false);
      }
    });
  }

  mostrarAlerta(mensaje: string, esExito: boolean) {
    this.alertaMensaje.set(mensaje);
    this.alertaEsExito.set(esExito);
    this.alertaOpen.set(true);
  }

  cerrarAlerta() {
    this.alertaOpen.set(false);
  }

  openModalTrabajoSistema() {
    this.cerrarModales();
    this.formCatalogo.get('trabajo_id')?.setValidators([Validators.required]);
    this.formCatalogo.get('trabajo_id')?.updateValueAndValidity();
    this.modalSistemaOpen.set(true);
  }

  openModalTrabajoLibre() {
    this.cerrarModales();
    this.formCatalogo.get('trabajo_id')?.clearValidators();
    this.formCatalogo.get('trabajo_id')?.updateValueAndValidity();
    this.formCatalogo.patchValue({ trabajo_id: '' });
    this.modalLibreOpen.set(true);
  }

  cerrarModales() {
    this.modalSistemaOpen.set(false);
    this.modalLibreOpen.set(false);
    this.formCatalogo.reset();
    this.formCatalogo.patchValue({ trabajo_id: '' });
    this.imagenSeleccionada = null;
  }
}