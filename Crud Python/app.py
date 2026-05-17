
from flask import send_file
import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from flask import Flask, request, jsonify
from config import get_connection
from flask_cors import CORS  #Importar CORS
app = Flask(__name__)
CORS(app) #permite que angular conecte 

#============================================= CLIENTES ==========================================#
@app.route('/clientes', methods=['POST'])
def crear_cliente():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""import py
        INSERT INTO clientes (nombre, apellidoP, apellidoM, telefono, direccion, correo)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        data['nombre'],
        data['apellidoP'],
        data['apellidoM'],
        data['telefono'],
        data['direccion'],
        data['correo']
    ))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Cliente creado'}), 201

@app.route('/clientes', methods=['GET'])
def obtener_clientes():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id_cliente, nombre, apellidoP, apellidoM, telefono, correo
        FROM clientes
    """)

    clientes = []
    for row in cursor.fetchall():
        clientes.append({
            'id_cliente': row[0],
            'nombre': row[1],
            'apellidoP': row[2],
            'apellidoM': row[3],
            'telefono': row[4],
            'correo': row[5]
        })

    conn.close()
    return jsonify(clientes)

@app.route('/clientes/<int:id_cliente>', methods=['GET'])
def obtener_cliente(id_cliente):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id_cliente, nombre, apellidoP, apellidoM, telefono, direccion, correo
        FROM clientes
        WHERE id_cliente = ?
    """, (id_cliente,))

    row = cursor.fetchone()
    conn.close()

    if row:
        return jsonify({
            'id_cliente': row[0],
            'nombre': row[1],
            'apellidoP': row[2],
            'apellidoM': row[3],
            'telefono': row[4],
            'direccion': row[5],
            'correo': row[6]
        })

    return jsonify({'mensaje': 'Cliente no encontrado'}), 404


@app.route('/clientes/<int:id_cliente>', methods=['PUT'])
def actualizar_cliente(id_cliente):
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE clientes
        SET nombre = ?, apellidoP = ?, apellidoM = ?, telefono = ?, direccion = ?, correo = ?
        WHERE id_cliente = ?
    """, (
        data['nombre'],
        data['apellidoP'],
        data['apellidoM'],
        data['telefono'],
        data['direccion'],
        data['correo'],
        id_cliente
    ))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Cliente actualizado'})

@app.route('/clientes/<int:id_cliente>', methods=['DELETE'])
def eliminar_cliente(id_cliente):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM clientes WHERE id_cliente = ?", (id_cliente,))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Cliente eliminado'})


# =================================================== CATEGORIAS ==========================================
# CREATE
@app.route('/categorias', methods=['POST'])
def crear_categoria():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("INSERT INTO categorias (nombre) VALUES (?)", (data['nombre'],))
    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Categoria creada'})


# READ ALL
@app.route('/categorias', methods=['GET'])
def obtener_categorias():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM categorias")
    datos = [dict(zip([col[0] for col in cursor.description], row)) for row in cursor.fetchall()]

    conn.close()
    return jsonify(datos)


# READ ONE
@app.route('/categorias/<int:id>', methods=['GET'])
def obtener_categoria(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM categorias WHERE id_categoria = ?", (id,))
    row = cursor.fetchone()
    conn.close()

    if row:
        return jsonify(dict(zip([col[0] for col in cursor.description], row)))

    return jsonify({'mensaje': 'No encontrado'}), 404


@app.route('/categorias/<int:id>', methods=['PUT'])
def actualizar_categoria(id):
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("UPDATE categorias SET nombre=? WHERE id_categoria=?", (data['nombre'], id))
        conn.commit()
        return jsonify({'mensaje': 'Actualizado'}), 200
    except Exception as e:
        conn.rollback()  # libera el lock si algo falla
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()



# DELETE
@app.route('/categorias/<int:id>', methods=['DELETE'])
def eliminar_categoria(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM categorias WHERE id_categoria=?", (id,))
    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Eliminado'})
# =================================================== EMPLEADOS  ==========================================

@app.route('/empleados', methods=['POST'])
def crear_empleado():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO empleados (nombre, apellidoP, apellidoM, telefono, fecha_nacimiento, categoria_id)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        data['nombre'],
        data['apellidoP'],
        data['apellidoM'],
        data['telefono'],
        data['fecha_nacimiento'],
        data['categoria_id']
    ))

    conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Empleado creado'})


@app.route('/empleados', methods=['GET'])
def obtener_empleados():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM empleados")
    datos = [dict(zip([col[0] for col in cursor.description], row)) for row in cursor.fetchall()]

    conn.close()
    return jsonify(datos)


@app.route('/empleados/<int:id>', methods=['GET'])
def obtener_empleado(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM empleados WHERE id_empleado=?", (id,))
    row = cursor.fetchone()
    conn.close()

    if row:
        return jsonify(dict(zip([col[0] for col in cursor.description], row)))

    return jsonify({'mensaje': 'No encontrado'}), 404


@app.route('/empleados/<int:id_empleado>', methods=['PUT'])
def actualizar_empleado(id_empleado):
    try:
        data = request.get_json()
        conn = get_connection() # Obtenemos la conexión igual que en tus otros CRUDS
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE empleados
            SET nombre = ?, 
                apellidoP = ?, 
                apellidoM = ?, 
                telefono = ?, 
                fecha_nacimiento = ?, 
                categoria_id = ?, 
                activo = ?
            WHERE id_empleado = ?
        """, (
            data['nombre'],
            data['apellidoP'],
            data['apellidoM'],
            data['telefono'],
            data['fecha_nacimiento'],
            data['categoria_id'],
            data['activo'],
            id_empleado
        ))

        conn.commit() # Esto guarda los cambios y libera el "Lock wait timeout"
        conn.close()

        return jsonify({'mensaje': 'Empleado actualizado correctamente'}), 200

    except Exception as e:
        print(f"Error al actualizar: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/empleados/<int:id>', methods=['DELETE'])
def eliminar_empleado(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM empleados WHERE id_empleado=?", (id,))
    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Eliminado'})


# ======================================= categoria empleados ========================
@app.route('/categorias_empleado', methods=['POST'])
def crear_categoria_empleado():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO categorias_empleado (nombre, tarifa_hora)
        VALUES (?, ?)
    """, (
        data['nombre'],
        data['tarifa_hora']
    ))

    conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Categoria empleado creada'}),201

@app.route('/categorias_empleado', methods=['GET'])
def obtener_categorias_empleado():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM categorias_empleado")

    datos = [dict(zip([col[0] for col in cursor.description], row)) for row in cursor.fetchall()]
    conn.close()

    return jsonify(datos)

@app.route('/categorias_empleado/<int:id>', methods=['GET'])
def obtener_categoria_empleado(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM categorias_empleado WHERE id_categoria_empleado=?", (id,))
    row = cursor.fetchone()
    conn.close()

    if row:
        return jsonify(dict(zip([col[0] for col in cursor.description], row)))

    return jsonify({'mensaje': 'No encontrado'}), 404

@app.route('/categorias_empleado/<int:id>', methods=['PUT'])
def actualizar_categoria_empleado(id):
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE categorias_empleado
        SET nombre=?, tarifa_hora=?
        WHERE id_categoria_empleado=?
    """, (
        data['nombre'],
        data['tarifa_hora'],
        id
    ))

    conn.commit()
    conn.close()
    return jsonify({'mensaje': 'Actualizado'})

@app.route('/categorias_empleado/<int:id>', methods=['DELETE'])
def eliminar_categoria_empleado(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM categorias_empleado WHERE id_categoria_empleado=?", (id,))
    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Eliminado'})

#=================================================== MATERIALES =======================================#
@app.route('/materiales', methods=['POST'])
def crear_material():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO materiales (nombre, unidad_id, precio_unitario, stock)
        VALUES (?, ?, ?, ?)
    """, (
        data['nombre'],
        data['unidad_id'],
        data['precio_unitario'],
        data['stock']
    ))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Material creado'})

@app.route('/materiales', methods=['GET'])
def obtener_materiales():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            m.id_material,
            m.nombre,
            u.nombre AS unidad,
            m.precio_unitario,
            m.stock,
            m.unidad_id
        FROM materiales m
        JOIN unidades u ON u.id_unidad = m.unidad_id
    """) # <-- Coma eliminada con éxito

    datos = []
    for row in cursor.fetchall():
        datos.append({
            'id_material': row[0],
            'nombre': row[1],
            'unidad': row[2],
            'precio_unitario': float(row[3]),
            'stock': float(row[4]),
            'unidad_id': row[5] # <-- Lo agregamos aquí también para Angular
        })

    conn.close()
    return jsonify(datos)
@app.route('/materiales/<int:id>', methods=['GET'])
def obtener_material(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            m.id_material,
            m.nombre,
            u.nombre AS unidad,
            m.precio_unitario,
            m.stock
        FROM materiales m
        JOIN unidades u ON u.id_unidad = m.unidad_id
        WHERE m.id_material = ?
    """, (id,))

    row = cursor.fetchone()
    conn.close()

    if row:
        return jsonify({
            'id_material': row[0],
            'nombre': row[1],
            'unidad': row[2],
            'precio_unitario': float(row[3]),
            'stock': float(row[4])
        })

    return jsonify({'mensaje': 'Material no encontrado'}), 404


@app.route('/materiales/<int:id>', methods=['PUT'])
def actualizar_material(id):
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE materiales
        SET nombre = ?, unidad_id = ?, precio_unitario = ?, stock = ?
        WHERE id_material = ?
    """, (
        data['nombre'],
        data['unidad_id'],
        data['precio_unitario'],
        data['stock'],
        id
    ))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Material actualizado'})


@app.route('/materiales/<int:id>', methods=['DELETE'])
def eliminar_material(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM materiales WHERE id_material = ?", (id,))
    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Material eliminado'})

# ================================== UNIDADES ================================#
@app.route('/unidades', methods=['POST'])
def crear_unidad():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO unidades (nombre)
        VALUES (?)
    """, (data['nombre'],))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Unidad creada'})

@app.route('/unidades', methods=['GET'])
def obtener_unidades():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id_unidad, nombre FROM unidades")

    datos = []
    for row in cursor.fetchall():
        datos.append({
            'id_unidad': row[0],
            'nombre': row[1]
        })

    conn.close()
    return jsonify(datos)
@app.route('/unidades/<int:id>', methods=['GET'])
def obtener_unidad(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id_unidad, nombre FROM unidades WHERE id_unidad = ?", (id,))
    row = cursor.fetchone()

    conn.close()

    if row:
        return jsonify({
            'id_unidad': row[0],
            'nombre': row[1]
        })

    return jsonify({'mensaje': 'Unidad no encontrada'}), 404

@app.route('/unidades/<int:id>', methods=['PUT'])
def actualizar_unidad(id):
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE unidades
        SET nombre = ?
        WHERE id_unidad = ?
    """, (data['nombre'], id))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Unidad actualizada'})

@app.route('/unidades/<int:id>', methods=['DELETE'])
def eliminar_unidad(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM unidades WHERE id_unidad = ?", (id,))
    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Unidad eliminada'})

# ============================ ASISTENCIA ============================ #

# 🔧 FUNCIÓN AUXILIAR (OBLIGATORIA)
def convertir_fila(cursor, row):
    resultado = {}
    for i, col in enumerate(cursor.description):
        valor = row[i]

        if valor is None:
            resultado[col[0]] = None
        elif hasattr(valor, 'isoformat'):  # DATE / DATETIME
            resultado[col[0]] = valor.isoformat()
        elif hasattr(valor, 'strftime'):   # TIME
            resultado[col[0]] = valor.strftime('%H:%M:%S')
        else:
            resultado[col[0]] = valor

    return resultado


# ================= CREATE (ENTRADA) =================
@app.route('/asistencia/entrada', methods=['POST'])
def registrar_entrada():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("CALL sp_registrar_entrada(?, ?, ?)", (
        data['empleado_id'],
        data['fecha'],
        data['hora']
    ))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Entrada registrada'})


# ================= READ ALL =================
@app.route('/asistencia', methods=['GET'])
def obtener_asistencia():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM asistencia")
    rows = cursor.fetchall()

    datos = [convertir_fila(cursor, row) for row in rows]

    conn.close()
    return jsonify(datos)


# ================= READ ONE =================
@app.route('/asistencia/<int:id>', methods=['GET'])
def obtener_asistencia_id(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM asistencia WHERE id_asistencia = ?", (id,))
    row = cursor.fetchone()

    if row:
        resultado = convertir_fila(cursor, row)
        conn.close()
        return jsonify(resultado)

    conn.close()
    return jsonify({'mensaje': 'No encontrada'}), 404


# ================= UPDATE (SALIDA) =================
@app.route('/asistencia/salida', methods=['PUT'])
def registrar_salida():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("CALL sp_registrar_salida(?, ?)", (
        data['id_asistencia'],
        data['hora']
    ))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Salida registrada'})


# ================= DELETE =================
@app.route('/asistencia/<int:id>', methods=['DELETE'])
def eliminar_asistencia(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM asistencia WHERE id_asistencia = ?", (id,))
    
    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Asistencia eliminada'})

# ============================ COTIZACIONES ============================ #

# ================= CREATE =================
@app.route('/cotizaciones', methods=['POST'])
def crear_cotizacion():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO cotizaciones (
            cliente_id,
            categoria_id,
            descripcion,
            ancho,
            alto,
            largo,
            descripcion_medidas
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        data['cliente_id'],
        data.get('categoria_id', 1),  # <-- Si Angular no la manda, por defecto será una 'Puerta' (ID 1)
        data.get('descripcion'),
        data.get('ancho'),
        data.get('alto'),
        data.get('largo'),
        data.get('descripcion_medidas')
    ))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Cotización creada'})


# ================= READ ALL =================
@app.route('/cotizaciones', methods=['GET'])
def obtener_cotizaciones():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM cotizaciones")
    rows = cursor.fetchall()

    datos = [convertir_fila(cursor, row) for row in rows]

    conn.close()
    return jsonify(datos)


# ================= READ ONE =================
@app.route('/cotizaciones/<int:id>', methods=['GET'])
def obtener_cotizacion(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM cotizaciones WHERE id_cotizacion = ?", (id,))
    row = cursor.fetchone()

    if row:
        resultado = convertir_fila(cursor, row)
        conn.close()
        return jsonify(resultado)

    conn.close()
    return jsonify({'mensaje': 'No encontrada'}), 404


# ================= UPDATE =================
@app.route('/cotizaciones/<int:id>', methods=['PUT'])
def actualizar_cotizacion(id):
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE cotizaciones
        SET cliente_id = ?,
            categoria_id = ?,
            descripcion = ?,
            ancho = ?,
            alto = ?,
            largo = ?,
            descripcion_medidas = ?,
            estado = ?
        WHERE id_cotizacion = ?
    """, (
        data['cliente_id'],
        data['categoria_id'],
        data.get('descripcion'),
        data.get('ancho'),
        data.get('alto'),
        data.get('largo'),
        data.get('descripcion_medidas'),
        data.get('estado', 'pendiente'),
        id
    ))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Cotización actualizada'})


# ================= DELETE =================
@app.route('/cotizaciones/<int:id>', methods=['DELETE'])
def eliminar_cotizacion(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM cotizaciones WHERE id_cotizacion = ?", (id,))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Cotización eliminada'})


# ================= DETALLE MATERIALES COTIZACION ================= #

# ================= CREATE =================
@app.route('/detalle_cotizacion', methods=['POST'])
def crear_detalle():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO detalle_materiales_cotizacion (
            cotizacion_id,
            material_id,
            cantidad,
            precio_unitario
        )
        VALUES (?, ?, ?, ?)
    """, (
        data['cotizacion_id'],
        data['material_id'],
        data['cantidad'],
        data['precio_unitario']
    ))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Detalle agregado'})


# ================= READ ALL =================
@app.route('/detalle_cotizacion', methods=['GET'])
def obtener_detalles():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM detalle_materiales_cotizacion")
    rows = cursor.fetchall()

    datos = [convertir_fila(cursor, row) for row in rows]

    conn.close()
    return jsonify(datos)


# ================= READ ONE =================
@app.route('/detalle_cotizacion/<int:id>', methods=['GET'])
def obtener_detalle(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM detalle_materiales_cotizacion
        WHERE id_detalle = ?
    """, (id,))

    row = cursor.fetchone()

    if row:
        resultado = convertir_fila(cursor, row)
        conn.close()
        return jsonify(resultado)

    conn.close()
    return jsonify({'mensaje': 'No encontrado'}), 404


# ================= UPDATE =================
@app.route('/detalle_cotizacion/<int:id>', methods=['PUT'])
def actualizar_detalle(id):
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE detalle_materiales_cotizacion
        SET cantidad = ?,
            precio_unitario = ?
        WHERE id_detalle = ?
    """, (
        data['cantidad'],
        data['precio_unitario'],
        id
    ))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Detalle actualizado'})


# ================= DELETE =================
@app.route('/detalle_cotizacion/<int:id>', methods=['DELETE'])
def eliminar_detalle(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM detalle_materiales_cotizacion
        WHERE id_detalle = ?
    """, (id,))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Detalle eliminado'})

# ================= MOVIMIENTOS INVENTARIO ================= #

# ================= CREATE =================
@app.route('/movimientos', methods=['POST'])
def crear_movimiento():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO movimientos_inventario (
            material_id,
            tipo,
            cantidad,
            motivo,
            cotizacion_id
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        data['material_id'],
        data['tipo'],  # 'entrada' o 'salida'
        data['cantidad'],
        data.get('motivo'),
        data.get('cotizacion_id')
    ))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Movimiento registrado'})


# ================= READ ALL =================
@app.route('/movimientos', methods=['GET'])
def obtener_movimientos():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM movimientos_inventario")
    rows = cursor.fetchall()

    datos = [convertir_fila(cursor, row) for row in rows]

    conn.close()
    return jsonify(datos)


# ================= READ ONE =================
@app.route('/movimientos/<int:id>', methods=['GET'])
def obtener_movimiento(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM movimientos_inventario
        WHERE id_movimiento = ?
    """, (id,))

    row = cursor.fetchone()

    if row:
        resultado = convertir_fila(cursor, row)
        conn.close()
        return jsonify(resultado)

    conn.close()
    return jsonify({'mensaje': 'No encontrado'}), 404


# ================= UPDATE =================
@app.route('/movimientos/<int:id>', methods=['PUT'])
def actualizar_movimiento(id):
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE movimientos_inventario
        SET tipo = ?,
            cantidad = ?,
            motivo = ?
        WHERE id_movimiento = ?
    """, (
        data['tipo'],
        data['cantidad'],
        data.get('motivo'),
        id
    ))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Movimiento actualizado'})
    

# ================= DELETE =================
@app.route('/movimientos/<int:id>', methods=['DELETE'])
def eliminar_movimiento(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM movimientos_inventario
        WHERE id_movimiento = ?
    """, (id,))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Movimiento eliminado'})
# ================= PAGOS ================= #

# ================= CREATE =================
@app.route('/pagos', methods=['POST'])
def crear_pago():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO pagos (
            cotizacion_id,
            monto,
            tipo,
            metodo_pago
        )
        VALUES (?, ?, ?, ?)
    """, (
        data['cotizacion_id'],
        data['monto'],
        data.get('tipo', 'anticipo'),
        data['metodo_pago']
    ))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Pago registrado'})
    

# ================= READ ALL =================
@app.route('/pagos', methods=['GET'])
def obtener_pagos():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM pagos")
    rows = cursor.fetchall()

    datos = [convertir_fila(cursor, row) for row in rows]

    conn.close()
    return jsonify(datos)


# ================= READ ONE =================
@app.route('/pagos/<int:id>', methods=['GET'])
def obtener_pago(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM pagos
        WHERE id_pago = ?
    """, (id,))

    row = cursor.fetchone()

    if row:
        resultado = convertir_fila(cursor, row)
        conn.close()
        return jsonify(resultado)

    conn.close()
    return jsonify({'mensaje': 'No encontrado'}), 404


# ================= UPDATE =================
@app.route('/pagos/<int:id>', methods=['PUT'])
def actualizar_pago(id):
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE pagos
        SET monto = ?,
            tipo = ?,
            metodo_pago = ?
        WHERE id_pago = ?
    """, (
        data['monto'],
        data.get('tipo', 'anticipo'),
        data['metodo_pago'],
        id
    ))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Pago actualizado'})


# ================= DELETE =================
@app.route('/pagos/<int:id>', methods=['DELETE'])
def eliminar_pago(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM pagos
        WHERE id_pago = ?
    """, (id,))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Pago eliminado'})

# ============================ TRABAJOS ============================

# CREATE
@app.route('/trabajos', methods=['POST'])
def crear_trabajo():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO trabajos (cotizacion_id, estado, fecha_inicio, fecha_fin)
        VALUES (?, ?, ?, ?)
    """, (
        data['cotizacion_id'],
        data.get('estado', 'pendiente'),
        data.get('fecha_inicio'),
        data.get('fecha_fin')
    ))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Trabajo creado'}), 201


# GET ALL
@app.route('/trabajos', methods=['GET'])
def obtener_trabajos():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM trabajos")
    columnas = [col[0] for col in cursor.description]

    datos = []
    for row in cursor.fetchall():
        fila = dict(zip(columnas, row))
        datos.append(fila)

    conn.close()
    return jsonify(datos)


# GET ONE
@app.route('/trabajos/<int:id>', methods=['GET'])
def obtener_trabajo(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM trabajos WHERE id_trabajo = ?", (id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        return jsonify({'mensaje': 'Trabajo no encontrado'}), 404

    columnas = [col[0] for col in cursor.description]
    conn.close()

    return jsonify(dict(zip(columnas, row)))


# UPDATE
@app.route('/trabajos/<int:id>', methods=['PUT'])
def actualizar_trabajo(id):
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE trabajos
        SET estado = ?, fecha_inicio = ?, fecha_fin = ?
        WHERE id_trabajo = ?
    """, (
        data.get('estado'),
        data.get('fecha_inicio'),
        data.get('fecha_fin'),
        id
    ))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Trabajo actualizado'})


# DELETE
@app.route('/trabajos/<int:id>', methods=['DELETE'])
def eliminar_trabajo(id):
    conn = get_connection()
    cursor = conn.cursor()

    # Primero eliminar relaciones
    cursor.execute("DELETE FROM trabajo_empleados WHERE trabajo_id = ?", (id,))
    
    # Luego eliminar trabajo
    cursor.execute("DELETE FROM trabajos WHERE id_trabajo = ?", (id,))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Trabajo eliminado'})


# ======================= TRABAJO_EMPLEADOS =======================

# ASIGNAR EMPLEADO A TRABAJO
@app.route('/trabajos/asignar_empleado', methods=['POST'])
def asignar_empleado_trabajo():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO trabajo_empleados (trabajo_id, empleado_id)
        VALUES (?, ?)
    """, (
        data['trabajo_id'],
        data['empleado_id']
    ))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Empleado asignado al trabajo'})

@app.route('/trabajos/<int:id>/empleados', methods=['GET'])
def obtener_empleados_trabajo(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT e.id_empleado, e.nombre, e.apellidoP, e.apellidoM
        FROM trabajo_empleados te
        JOIN empleados e ON e.id_empleado = te.empleado_id
        WHERE te.trabajo_id = ?
    """, (id,))

    columnas = [col[0] for col in cursor.description]

    datos = []
    for row in cursor.fetchall():
        datos.append(dict(zip(columnas, row)))

    conn.close()
    return jsonify(datos)

@app.route('/trabajos/remover_empleado', methods=['DELETE'])
def remover_empleado_trabajo():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM trabajo_empleados
        WHERE trabajo_id = ? AND empleado_id = ?
    """, (
        data['trabajo_id'],
        data['empleado_id']
    ))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Empleado removido del trabajo'})

@app.route('/cotizaciones/<int:id>/pdf', methods=['GET'])
def exportar_cotizacion_pdf(id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # 1. Obtener datos de la cotización y del cliente (Hacemos un JOIN)
        cursor.execute("""
            SELECT c.*, cl.nombre, cl.apellidoP, cl.telefono as tel_cliente, cl.direccion as dir_cliente, cat.nombre
            FROM cotizaciones c
            JOIN clientes cl ON c.cliente_id = cl.id_cliente
            JOIN categorias cat ON c.categoria_id = cat.id_categoria
            WHERE c.id_cotizacion = ?
        """, (id,))
        row_cot = cursor.fetchone()
        if not row_cot:
            conn.close()
            return jsonify({'error': 'Cotización no encontrada'}), 404
            
        cotizacion = convertir_fila(cursor, row_cot)
        
        # 2. Obtener los materiales asociados a esta cotización (Corregido m.nombre)
        cursor.execute("""
            SELECT dc.*, m.nombre as nombre_material 
            FROM detalle_materiales_cotizacion dc
            JOIN materiales m ON dc.material_id = m.id_material
            WHERE dc.cotizacion_id = ?
        """, (id,))
        rows_mat = cursor.fetchall()
        materiales = [convertir_fila(cursor, r) for r in rows_mat]

        # 3. Configurar el buffer de memoria para el PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        story = []
        
        styles = getSampleStyleSheet()
        
        # Estilos personalizados de texto
        style_title = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=22, textColor=colors.HexColor("#0d6efd"), spaceAfter=5)
        style_subtitle = ParagraphStyle('SubTitleStyle', parent=styles['Normal'], fontSize=10, textColor=colors.grey, spaceAfter=15)
        style_heading = ParagraphStyle('HeadingStyle', parent=styles['Heading2'], fontSize=12, textColor=colors.HexColor("#212529"), spaceAfter=6, bold=True)
        style_body = ParagraphStyle('BodyStyle', parent=styles['Normal'], fontSize=10, leading=14)
        style_th = ParagraphStyle('THStyle', parent=styles['Normal'], fontSize=10, textColor=colors.white, bold=True, alignment=1) # Centrado
        style_td = ParagraphStyle('TDStyle', parent=styles['Normal'], fontSize=10, alignment=1)

        # --- ENCABEZADO CON LOGO Y DATOS DEL NEGOCIO ---
        # Datos fijos de Herrería Cruz que solicitaste
        info_negocio = """<b>HERRERÍA CRUZ</b><br/>
        <b>Dirección:</b> Av. Principal No. 123, Col. Centro, Ciudad de México<br/>
        <b>Teléfono:</b> 55-1234-5678<br/>
        <b>Correo:</b> contacto@herreriacruz.com"""
        
        # Intentar cargar la imagen del negocio, si no existe ponemos solo texto
        try:
            logo = Image("logo_negocio.png", width=120, height=60)
            # Tabla para alinear Logo a la izquierda e Info a la derecha
            header_table = Table([[logo, Paragraph(info_negocio, style_body)]], colWidths=[150, 380])
        except:
            header_table = Table([[Paragraph("<b>HERRERÍA CRUZ</b> (Logo no encontrado)", style_title), Paragraph(info_negocio, style_body)]], colWidths=[200, 330])
            
        header_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('ALIGN', (1,0), (1,0), 'RIGHT')
        ]))
        story.append(header_table)
        story.append(Spacer(1, 15))
        
        # --- TÍTULO DEL DOCUMENTO ---
        story.append(Paragraph(f"<b>COTIZACIÓN OFICIAL / FOLIO #{cotizacion['id_cotizacion']}</b>", style_title))
        story.append(Paragraph(f"Fecha de Emisión: 17/05/2026 | Estado: {cotizacion.get('estado', 'Pendiente').upper()}", style_subtitle))
        
        # --- SECCIÓN: DATOS DEL CLIENTE Y TRABAJO ---
        datos_bloque_1 = f"""<b>CLIENTE SOLICITANTE:</b><br/>
        <b>Nombre:</b> {cotizacion['nombre']} {cotizacion['apellidoP']}<br/>
        <b>Teléfono:</b> {cotizacion.get('tel_cliente', 'N/A')}<br/>
        <b>Dirección de entrega:</b> {cotizacion.get('dir_cliente', 'N/A')}"""
        
        datos_bloque_2 = f"""<b>ESPECIFICACIONES DEL TRABAJO:</b><br/>
        <b>Tipo de Trabajo:</b> {cotizacion['nombre']}<br/>
        <b>Descripción:</b> {cotizacion['descripcion']}<br/>
        <b>Dimensiones:</b> {cotizacion['alto']}m (Alto) x {cotizacion['ancho']}m (Ancho) x {cotizacion['largo']}m (Espesor)<br/>
        <b>Notas técnicas:</b> {cotizacion.get('descripcion_medidas', 'Sin especificaciones adicionales')}"""
        
        info_bloques_table = Table([[Paragraph(datos_bloque_1, style_body), Paragraph(datos_bloque_2, style_body)]], colWidths=[265, 265])
        info_bloques_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8f9fa")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#dee2e6")),
            ('PADDING', (0,0), (-1,-1), 10),
        ]))
        story.append(info_bloques_table)
        story.append(Spacer(1, 20))
        
        # --- SECCIÓN: TABLA DE MATERIALES ---
        story.append(Paragraph("DESGLOSE DE MATERIALES Y COSTOS PRELIMINARES", style_heading))
        
        # Encabezados de la tabla
        tabla_data = [[
            Paragraph("Material", style_th),
            Paragraph("Cantidad", style_th),
            Paragraph("Precio Unitario", style_th),
            Paragraph("Importe", style_th)
        ]]
        
        total_materiales = 0.0
        for mat in materiales:
            cantidad = float(mat['cantidad'])
            precio = float(mat['precio_unitario'])
            importe = cantidad * precio
            total_materiales += importe
            
            tabla_data.append([
                Paragraph(mat['nombre_material'], style_body),
                Paragraph(str(mat['cantidad']), style_td),
                Paragraph(f"${precio:,.2f}", style_td),
                Paragraph(f"${importe:,.2f}", style_td)
            ])
            
        # Añadir fila del Total al final de la tabla
        tabla_data.append([
            Paragraph("<b>TOTAL ESTIMADO EN MATERIALES:</b>", style_body),
            "", "", 
            Paragraph(f"<b>${total_materiales:,.2f}</b>", style_td)
        ])
        
        mat_table = Table(tabla_data, colWidths=[250, 70, 100, 110])
        mat_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0d6efd")), # Encabezado azul bootstrap
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('GRID', (0,0), (-1,-2), 0.5, colors.HexColor("#dee2e6")), # Rejilla gris claro
            ('PADDING', (0,0), (-1,-1), 6),
            ('SPAN', (0,-1), (2,-1)), # Combinar celdas para el total
            ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor("#e9ecef")), # Fondo gris para el total
        ]))
        story.append(mat_table)
        
        # --- NOTA FINAL LEGAL ---
        story.append(Spacer(1, 30))
        nota_legal = """<i>* Nota: Esta cotización contempla únicamente los materiales descritos anteriormente. 
        Los precios de los materiales están sujetos a cambios sin previo aviso según proveedores. 
        No incluye mano de obra o costos de instalación a menos que se especifique formalmente por el herrero encargado.</i>"""
        story.append(Paragraph(nota_legal, style_body))
        
        # Construir PDF
        doc.build(story)
        buffer.seek(0)
        
# Línea corregida al final de la ruta del PDF
        return send_file(buffer, as_attachment=True, download_name=f"Cotizacion_Folio_{id}.pdf", mimetype='application/pdf')        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
