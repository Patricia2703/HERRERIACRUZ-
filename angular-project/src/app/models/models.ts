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



export interface Trabajo {
  id_trabajo?: number;   // Usa el mismo nombre que en tu HTML y DB
  cotizacion_id: number;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
  // Si tu Back-end NO manda descripción ni precio en "Trabajos", bórralos de aquí.
  // Si los manda, asegúrate de que el formulario los tenga.
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

export interface Pago {
  id_pago?: number;
  trabajo_id: number;
  monto: number;
  fecha_pago: string;
  metodo_pago: string; // Ej: Efectivo, Transferencia
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