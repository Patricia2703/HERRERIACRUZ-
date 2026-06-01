export interface Cliente {
  id_cliente?: number;
  nombre: string;
  apellidoP: string;
  apellidoM?: string;
  correo: string;
  direccion: string;
  telefono: string;
  estado?: string; 
}

export interface Categoria {
  id_categoria: number;
  nombre: string;
}






export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  categoria: string;
  stock: number;
  stockMinimo: number;
  unidad: string;
  precioUnitario: number;
  proveedor: string;            // Asegúrate de que esté aquí
  ultimaActualizacion: string;  // Asegúrate de que esté aquí
}

export interface Empleado {
  id_empleado?: number;
  nombre: string;
  apellidoP: string;
  apellidoM: string;
  telefono: string;
  fecha_nacimiento: string; // Cambiado de fecha_contratacion
  categoria_id: number;     // Cambiado de puesto
  activo?: number;          // tinyint(1)
}



export interface Catalogo {
  id_item?: number;
  nombre_diseno: string;
  descripcion: string;
  precio_estimado: number;
  imagen_url?: string;
}
export interface Material {
    id_material?: number;
    nombre: string;
    unidad_id?: number; // Para el POST/PUT
    unidad?: string;    // Para el GET (nombre de la unidad)
    precio_unitario: number;
    stock: number;
}

export interface Unidad {
    id_unidad: number;
    nombre: string;
}

// Si tienes interfaces de Material o Cliente arriba, déjalas intactas.
// Solo asegúrate de que Cotizacion y DetalleCotizacion queden estructuradas exactamente así:

export interface Cotizacion {
  id_cotizacion?: number;
  cliente_id: number;
  categoria_id: number;
  descripcion: string;
  ancho?: number;
  alto?: number;
  largo?: number;
  descripcion_medidas?: string;
  total?: number;
  total_pagado?: number;
  estado_pago?: 'sin_pago' | 'parcial' | 'pagado';
  estado?: 'pendiente' | 'aprobada' | 'rechazada';
  fecha?: string;
  cliente?: string;
  categoria?: string;
}

export interface DetalleCotizacion {
  id_detalle?: number;
  cotizacion_id?: number;
  material_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal?: number;
  material_nombre?: string;
}
export interface Asistencia {
  id_asistencia?: number;
  empleado_id: number;
  fecha: string;
  hora_entrada: string;
  hora_salida?: string | null;
  horas_trabajadas?: number | null;
  pago_calculado?: number | null;
  nombre?: string;       // Viene del JOIN con empleados
  apellidoP?: string;    // Viene del JOIN con empleados
}

export interface RegistroEntrada {
  empleado_id: number;
  fecha: string;
  hora: string;
}

export interface RegistroSalida {
  id_asistencia: number;
  hora: string;
}
export interface Pago {
  id_pago?: number;
  trabajo_id?: number;       // Opcional para que no choque con cotizaciones
  cotizacion_id?: number;    // El nuevo campo que usamos en tu vista
  monto: number;
  tipo: string;
  metodo_pago: string;
  fecha_pago?: string;       // Opcional para que tu formulario pase limpio
  folio_cotizacion?: string; 
  cliente_nombre?: string;
}

export interface RegistroPago {
  cotizacion_id: number;
  monto: number;
  tipo: string;
  metodo_pago: string;
}
export interface Trabajo {
  id_trabajo?: number;
  cotizacion_id: number;
  estado: 'pendiente' | 'en proceso' | 'terminado' | string;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  // Campos auxiliares opcionales para la vista
  folio_cotizacion?: string;
  descripcion_trabajo?: string;
}