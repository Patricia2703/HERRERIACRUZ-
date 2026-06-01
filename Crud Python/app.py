from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask,send_file,request,jsonify
import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors 
from datetime import datetime
from config import get_connection
from flask_cors import CORS, cross_origin  #Importar CORS
import os
from werkzeug.utils import secure_filename
app = Flask(__name__)
CORS(app) 
# Configuración de almacenamiento de imágenes
#UPLOAD_FOLDER = os.path.join('static', 'uploads')
#app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'static/uploads')

# Verificar que las carpetas existan físicamente, si no, crearlas
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])


#============================================= CLIENTES ==========================================#
# ============================ CLIENTES ============================
@app.route('/clientes', methods=['POST'])
def crear_cliente():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    sql = "INSERT INTO clientes (nombre, apellidoP, apellidoM, telefono, correo, direccion) VALUES (?, ?, ?, ?, ?, ?)"
    
    valores = (
        data.get('nombre'),
        data.get('apellidoP'),
        data.get('apellidoM'),
        data.get('telefono'),
        data.get('correo'),
        data.get('direccion')
    )

    cursor.execute(sql, valores)
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


# UPDATE CLIENTE
@app.route('/clientes/<int:id>', methods=['PUT'])
def actualizar_cliente(id):
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    # 🛠️ Usamos .get() en todos los campos para evitar los KeyErrors si alguno viene vacío
    cursor.execute("""
        UPDATE clientes
        SET nombre = ?, apellidoP = ?, apellidoM = ?, telefono = ?, correo = ?, direccion = ?
        WHERE id_cliente = ?
    """, (
        data.get('nombre'),
        data.get('apellidoP'),
        data.get('apellidoM'),
        data.get('telefono'),
        data.get('correo'),
        data.get('direccion'),
        id
    ))

    conn.commit()
    conn.close()

    return jsonify({'mensaje': 'Cliente actualizado con éxito'})

# DELETE CLIENTE
@app.route('/clientes/<int:id_cliente>', methods=['DELETE'])
def eliminar_cliente(id_cliente):
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # 🛠️ PASO DE SEGURIDAD (Opcional): Si deseas borrar en cascada las dependencias del cliente
        # puedes eliminar primero sus cotizaciones/registros relacionados antes de borrar al cliente.
        # cursor.execute("DELETE FROM cotizaciones WHERE id_cliente = ?", (id_cliente,))
        
        # Eliminar el cliente de forma directa
        cursor.execute("DELETE FROM clientes WHERE id_cliente = ?", (id_cliente,))
        
        conn.commit() # 🛠️ Súper importante: confirma la eliminación y remueve el candado al instante
        mensaje = 'Cliente eliminado con éxito'
        status_code = 200
    except Exception as e:
        conn.rollback() # Si algo falla, deshace el cambio para que no se quede trabada la tabla
        mensaje = f'No se pudo eliminar el cliente porque tiene registros asociados: {str(e)}'
        status_code = 400
    finally:
        conn.close() # Cierra la puerta siempre para liberar recursos

    return jsonify({'mensaje': mensaje}), status_code

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
def convertir_fila(cursor, row):
    """Convierte una fila de la BD en un diccionario usando los nombres de las columnas"""
    if not row:
        return None
    columnas = [column[0] for column in cursor.description]
    resultado = {}
    for i, col in enumerate(columnas):
        val = row[i]
        # Convertir tipos especiales a texto o nativos para que jsonify no falle
        if val.__class__.__name__ in ['date', 'time', 'datetime']:
            resultado[col] = str(val)
        else:
            resultado[col] = val
    return resultado


# ============================ ASISTENCIA ============================ #

#  FUNCIÓN AUXILIAR (OBLIGATORIA)
def convertir_fila(cursor, row):
    """Convierte una fila de la BD en un diccionario usando los nombres de las columnas"""
    if not row:
        return None
    columnas = [column[0] for column in cursor.description]
    resultado = {}
    for i, col in enumerate(columnas):
        val = row[i]
        # Convertir tipos especiales a texto o nativos para que jsonify no falle
        if val.__class__.__name__ in ['date', 'time', 'datetime']:
            resultado[col] = str(val)
        else:
            resultado[col] = val
    return resultado


## ================= CREATE (ENTRADA) =================
@app.route('/asistencias/entrada', methods=['POST'])
def registrar_entrada():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    try:
        # Ejecutamos tu procedimiento almacenado de entrada
        cursor.execute("CALL sp_registrar_entrada(?, ?, ?)", (
            data['empleado_id'],
            data['fecha'],
            data['hora']
        ))
        conn.commit()
        return jsonify({'mensaje': 'Entrada registrada con éxito'}), 201

    except Exception as e:
        print(" Error en registrar_entrada:", str(e))
        return jsonify({'error': f'Error en la base de datos al registrar entrada: {str(e)}'}), 500

    finally:
        cursor.close()
        conn.close()


## ================= UPDATE (SALIDA) =================
# ✅ CORREGIDO: Cambiado a plural para evitar el error 405 Method Not Allowed en Angular
@app.route('/asistencias/salida', methods=['POST'])
def registrar_salida():
    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    try:
        # Ejecutamos tu procedimiento almacenado de salida
        cursor.execute("CALL sp_registrar_salida(?, ?)", (
            data['id_asistencia'],
            data['hora']
        ))
        conn.commit()
        return jsonify({'mensaje': 'Salida registrada y horas calculadas con éxito'})

    except Exception as e:
        return jsonify({'error': f'Error en la base de datos al registrar salida: {str(e)}'}), 500

    finally:
        cursor.close()
        conn.close()


# ================= HISTORIAL SEMANAL (LUNES A DOMINGO) =================
@app.route('/asistencias/historial-semanal', methods=['GET'])
@cross_origin() 
def historial_semanal():
    # Detecta de forma automática la semana actual del año 2026
    semana_actual = datetime.now().isocalendar()[1]
    
    semana = request.args.get('semana', default=semana_actual, type=int)
    anio = request.args.get('anio', default=2026, type=int)
    
    conn = get_connection() 
    cursor = conn.cursor()
    try:
        # Consulta PIVOT para acomodar los días de la semana horizontalmente uniendo Entrada y Salida
        query = """
            SELECT 
                e.nombre AS empleado,
                MAX(CASE WHEN WEEKDAY(a.fecha) = 0 THEN CONCAT(TIME_FORMAT(a.hora_entrada, '%H:%i'), ' - ', IFNULL(TIME_FORMAT(a.hora_salida, '%H:%i'), 'En Taller')) END) AS Lunes,
                MAX(CASE WHEN WEEKDAY(a.fecha) = 1 THEN CONCAT(TIME_FORMAT(a.hora_entrada, '%H:%i'), ' - ', IFNULL(TIME_FORMAT(a.hora_salida, '%H:%i'), 'En Taller')) END) AS Martes,
                MAX(CASE WHEN WEEKDAY(a.fecha) = 2 THEN CONCAT(TIME_FORMAT(a.hora_entrada, '%H:%i'), ' - ', IFNULL(TIME_FORMAT(a.hora_salida, '%H:%i'), 'En Taller')) END) AS Miercoles,
                MAX(CASE WHEN WEEKDAY(a.fecha) = 3 THEN CONCAT(TIME_FORMAT(a.hora_entrada, '%H:%i'), ' - ', IFNULL(TIME_FORMAT(a.hora_salida, '%H:%i'), 'En Taller')) END) AS Jueves,
                MAX(CASE WHEN WEEKDAY(a.fecha) = 4 THEN CONCAT(TIME_FORMAT(a.hora_entrada, '%H:%i'), ' - ', IFNULL(TIME_FORMAT(a.hora_salida, '%H:%i'), 'En Taller')) END) AS Viernes,
                MAX(CASE WHEN WEEKDAY(a.fecha) = 5 THEN CONCAT(TIME_FORMAT(a.hora_entrada, '%H:%i'), ' - ', IFNULL(TIME_FORMAT(a.hora_salida, '%H:%i'), 'En Taller')) END) AS Sabado,
                MAX(CASE WHEN WEEKDAY(a.fecha) = 6 THEN CONCAT(TIME_FORMAT(a.hora_entrada, '%H:%i'), ' - ', IFNULL(TIME_FORMAT(a.hora_salida, '%H:%i'), 'En Taller')) END) AS Domingo
            FROM asistencia a
            INNER JOIN empleados e ON a.empleado_id = e.id_empleado
            WHERE WEEK(a.fecha, 1) = ? AND YEAR(a.fecha) = ?
            GROUP BY e.id_empleado, e.nombre
            ORDER BY e.nombre;
        """
        
        cursor.execute(query, (semana, anio))
        rows = cursor.fetchall()
        
        historial = []
        for row in rows:
            historial.append({
                'empleado': row[0],
                'Lunes': row[1],
                'Martes': row[2],
                'Miercoles': row[3],
                'Jueves': row[4],
                'Viernes': row[5],
                'Sabado': row[6],
                'Domingo': row[7]
            })
            
        return jsonify(historial), 200
        
    except Exception as e:
        print("⚠️ Error en historial semanal:", str(e))
        return jsonify({'error': f'Error al obtener historial semanal: {str(e)}'}), 500
    finally:
        cursor.close()
        conn.close()

# ================= READ ALL =================
# ✅ CORREGIDO: Cambiado a /asistencias (plural) para que coincida con tu api.service.ts
@app.route('/asistencias', methods=['GET'])
def obtener_asistencia():
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Traemos todos los datos diarios ordenados por fecha de forma descendente de la tabla 'asistencia'
        cursor.execute("""
            SELECT a.id_asistencia, a.fecha, a.empleado_id, e.nombre, a.hora_entrada, a.hora_salida,
                   a.horas_trabajadas, a.pago_calculado
            FROM asistencia a
            JOIN empleados e ON a.empleado_id = e.id_empleado
            ORDER BY a.fecha DESC
        """)
        
        rows = cursor.fetchall()
        asistencias = []
        for row in rows:
            asistencias.append({
                'id_asistencia': row[0],
                'fecha': str(row[1]),
                'empleado_id': row[2],
                'nombre_empleado': row[3],
                'hora_entrada': str(row[4]) if row[4] else None,
                'hora_salida': str(row[5]) if row[5] else None,
                'horas_trabajadas': float(row[6]) if row[6] else 0.0,
                'pago_calculado': float(row[7]) if row[7] else 0.0
            })
        return jsonify(asistencias)
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener asistencias: {str(e)}'}), 500
        
    finally:
        cursor.close()
        conn.close()


# ================= READ ONE =================
@app.route('/asistencia/<int:id>', methods=['GET'])
def obtener_asistencia_id(id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT * FROM asistencia WHERE id_asistencia = ?", (id,))
        row = cursor.fetchone()

        if row:
            resultado = convertir_fila(cursor, row)
            return jsonify(resultado)
        return jsonify({'mensaje': 'No encontrada'}), 404
        
    except Exception as e:
        return jsonify({'error': f'Error al buscar asistencia: {str(e)}'}), 500
        
    finally:
        cursor.close()
        conn.close()

@app.route('/empleados/select', methods=['GET'])
@cross_origin()
def obtener_empleados_selector():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # 💡 Consultamos directamente la tabla maestra para que NO haya duplicados
        query = "SELECT id_empleado, nombre FROM empleados ORDER BY nombre;"
        cursor.execute(query)
        rows = cursor.fetchall()
        
        empleados = []
        for row in rows:
            empleados.append({
                'id_empleado': row[0],
                'nombre': row[1]
            })
        return jsonify(empleados), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()
# ================= DELETE =================
# ✅ CORREGIDO: Cambiado a plural /asistencias/<id> para mantener consistencia con las acciones de Angular
@app.route('/asistencias/<int:id>', methods=['DELETE'])
def eliminar_asistencia(id):
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM asistencia WHERE id_asistencia = ?", (id,))
        conn.commit()
        return jsonify({'mensaje': 'Asistencia eliminada'})
        
    except Exception as e:
        return jsonify({'error': f'Error al eliminar registro: {str(e)}'}), 500
        
    finally:
        cursor.close()
        conn.close()


# ================= CÁLCULO DE NÓMINA SEMANAL =================
@app.route('/nomina/calcular', methods=['POST'])
def calcular_nomina_semanal():
    data = request.get_json()
    empleado_id = data.get('empleado_id')
    fecha_inicio = data.get('fecha_inicio') # Ej: '2026-05-18' (Lunes)
    fecha_fin = data.get('fecha_fin')       # Ej: '2026-05-23' (Sábado)

    conn = get_connection()
    cursor = conn.cursor()

    try:
        # 1. Obtener el sueldo por hora del empleado desde categorias_empleado
        cursor.execute("""
            SELECT c.tarifa_hora 
            FROM empleados e
            JOIN categorias_empleado c ON e.categoria_id = c.id_categoria_empleado
            WHERE e.id_empleado = ?
        """, (empleado_id,))
        empleado = cursor.fetchone()
        if not empleado:
            return jsonify({'error': 'Empleado no encontrado'}), 404
        sueldo_hora = float(empleado[0])

        # 2. Sumar el total de horas acumuladas en ese rango de fechas usando la tabla 'asistencia'
        cursor.execute("""
            SELECT SUM(TIMESTAMPDIFF(MINUTE, hora_entrada, hora_salida) / 60) as total_horas
            FROM asistencia
            WHERE empleado_id = ? AND fecha BETWEEN ? AND ?
        """, (empleado_id, fecha_inicio, fecha_fin))
        
        resultado = cursor.fetchone()
        total_horas = float(resultado[0]) if resultado[0] else 0.0
        pago_total = round(total_horas * sueldo_hora, 2)

        return jsonify({
            'empleado_id': empleado_id,
            'total_horas_semana': round(total_horas, 2),
            'sueldo_por_hora': sueldo_hora,
            'pago_semanal_calculado': pago_total
        })
        
    except Exception as e:
        return jsonify({'error': f'Error al calcular nómina: {str(e)}'}), 500
        
    finally:
        cursor.close()
        conn.close()
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
# ================= READ BY COTIZACION =================
@app.route('/cotizaciones/<int:id_cotizacion>/pagos', methods=['GET'])
def obtener_pagos_por_cotizacion(id_cotizacion):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id_pago, monto, tipo, metodo_pago, fecha 
        FROM pagos 
        WHERE cotizacion_id = ?
        ORDER BY fecha ASC
    """, (id_cotizacion,))
    
    rows = cursor.fetchall()
    datos = [convertir_fila(cursor, row) for row in rows]
    conn.close()
    return jsonify(datos)



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

# ====================================================================
# 📸 COMPLEMENTOS PARA EL CATÁLOGO DE TRABAJOS
# ====================================================================

#
@app.route('/ordenes/completadas', methods=['GET'])
def obtener_trabajos_completados():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Eliminamos restricciones rígidas de estado para que liste todas las órdenes vigentes en el taller
    query = """
        SELECT t.id_trabajo, c.descripcion AS nombre_proyecto, t.fecha_fin 
        FROM trabajos t
        INNER JOIN cotizaciones c ON t.cotizacion_id = c.id_cotizacion
    """
    cursor.execute(query)
    columnas = [col[0] for col in cursor.description]
    
    datos = []
    for row in cursor.fetchall():
        fila = dict(zip(columnas, row))
        datos.append(fila)
        
    conn.close()
    return jsonify(datos), 200

@app.route('/ordenes/<int:id_trabajo>/fecha-entrega', methods=['GET'])
def obtener_fecha_entrega_trabajo(id_trabajo):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT fecha_fin FROM trabajos WHERE id_trabajo = ?", (id_trabajo,))
    row = cursor.fetchone()
    conn.close()
    
    if row and row[0]:
        # Formatear de forma segura para el input date de HTML
        fecha_str = row[0].strftime('%Y-%m-%d') if hasattr(row[0], 'strftime') else str(row[0])[:10]
        return jsonify({'fecha_entrega': fecha_str}), 200
    
    from datetime import datetime
    return jsonify({'fecha_entrega': datetime.today().strftime('%Y-%m-%d')}), 200



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
@app.route('/cotizaciones/<int:id>/remision', methods=['GET'])
def exportar_remision_pdf(id):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # 1. Obtener datos generales y cliente
        cursor.execute("""
            SELECT 
                c.id_cotizacion, c.descripcion, c.alto, c.ancho, c.largo, c.descripcion_medidas, c.estado,
                cl.nombre as nom_cliente, cl.apellidoP as ape_cliente, cl.telefono as tel_cliente, cl.direccion as dir_cliente,
                cat.nombre as nombre_trabajo
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
        
        # 2. Obtener los materiales (Subtotal)
        cursor.execute("""
            SELECT dc.*, m.nombre as nombre_material 
            FROM detalle_materiales_cotizacion dc
            JOIN materiales m ON dc.material_id = m.id_material
            WHERE dc.cotizacion_id = ?
        """, (id,))
        rows_mat = cursor.fetchall()
        materiales = [convertir_fila(cursor, r) for r in rows_mat]

        # 3. CORREGIDO: Obtener la suma de los pagos de forma segura (Soporta 0 pagos)
        cursor.execute("SELECT SUM(monto) FROM pagos WHERE cotizacion_id = ?", (id,))
        pago_row = cursor.fetchone()
        total_pagado = float(pago_row[0]) if (pago_row and pago_row[0] is not None) else 0.0

        # 4. Configurar ReportLab
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=35, leftMargin=35, topMargin=35, bottomMargin=35)
        story = []
        styles = getSampleStyleSheet()
        
        style_main_title = ParagraphStyle('MainTitle', fontName='Helvetica-Bold', fontSize=24, leading=28, alignment=1, spaceAfter=15)
        style_biz_name = ParagraphStyle('BizName', fontName='Helvetica-Bold', fontSize=18, leading=22, alignment=1)
        style_biz_data = ParagraphStyle('BizData', fontName='Helvetica', fontSize=9, leading=13, alignment=1, textColor=colors.HexColor("#333333"))
        style_label = ParagraphStyle('LabelStyle', fontName='Helvetica-Bold', fontSize=9, leading=12, alignment=2)
        style_value = ParagraphStyle('ValueStyle', fontName='Helvetica', fontSize=9, leading=12, alignment=0)
        style_th = ParagraphStyle('THStyle', fontName='Helvetica-Bold', fontSize=10, textColor=colors.white, alignment=1)
        style_td = ParagraphStyle('TDStyle', fontName='Helvetica', fontSize=9, alignment=1)
        style_td_left = ParagraphStyle('TDStyleLeft', fontName='Helvetica', fontSize=9, alignment=0)
        
        # --- ENCABEZADO ---
        story.append(Paragraph("NOTA DE REMISIÓN", style_main_title))
        
        # CORREGIDO: Asegurar que si viene None o vacío no rompa el Paragraph de ReportLab
        nombre_trabajo = str(cotizacion.get('nombre_trabajo') or 'Trabajo').upper()
        alto = cotizacion.get('alto', 0)
        ancho = cotizacion.get('ancho', 0)
        largo = cotizacion.get('largo', 0)
        desc_medidas = str(cotizacion.get('descripcion_medidas') or 'Sin especificaciones adicionales')

        info_negocio = f"""
        <b>{nombre_trabajo}</b><br/>
        <b>Dimensiones:</b> {alto}m (Alto) x {ancho}m (Ancho) x {largo}m (Espesor)<br/>
        <b>Notas técnicas:</b> {desc_medidas}
        """
        
        # Bloque de logo seguro
        try:
            logo = Image("logo_negocio.png", width=95, height=75)
            biz_table = Table([[logo, [Paragraph("HERRERÍA CRUZ", style_biz_name), 
                                       Paragraph("DOMICILIO: FERNANDO MONTES DE OCA #97, ARCILA,<br/>SAN JUAN DEL RÍO, QUERÉTARO. TELÉFONO: 4271661251", style_biz_data)]]], colWidths=[110, 430])
        except:
            biz_table = Table([[Paragraph("<b>(Logo)</b>", style_td), [Paragraph("HERRERÍA CRUZ", style_biz_name), 
                                       Paragraph("DOMICILIO: FERNANDO MONTES DE OCA #97, ARCILA,<br/>SAN JUAN DEL RÍO, QUERÉTARO. TELÉFONO: 4271661251", style_biz_data)]]], colWidths=[110, 430])
                                      
        biz_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('ALIGN', (1,0), (1,0), 'CENTER'),
            ('BOX', (0,0), (0,0), 1, colors.grey),
            ('PADDING', (0,0), (-1,-1), 5)
        ]))
        story.append(biz_table)
        story.append(Spacer(1, 15))
        
        # --- DATOS CLIENTE ---
        nom_cl = cotizacion.get('nom_cliente' ) or ''
        ape_cl = cotizacion.get('ape_cliente') or ''
        nombre_completo_cliente = f"{nom_cl} {ape_cl}".strip() or "Cliente General"
        
        datos_cliente_data = [
            [Paragraph("FECHA DE EMISIÓN:", style_label), Paragraph("26 de mayo de 2026", style_value), Paragraph("FOLIO REM:", style_label), Paragraph(f"R{cotizacion.get('id_cotizacion', 0):04d}", style_value)],
            [Paragraph("NOMBRE DEL CLIENTE:", style_label), Paragraph(nombre_completo_cliente, style_value), Paragraph("ESTADO:", style_label), Paragraph(f"<b>{str(cotizacion.get('estado', 'PENDIENTE')).upper()}</b>", style_value)],
            [Paragraph("DOMICILIO DEL CLIENTE:", style_label), Paragraph(str(cotizacion.get('dir_cliente') or 'N/A'), style_value), "", ""],
            [Paragraph("TELÉFONO DEL CLIENTE:", style_label), Paragraph(str(cotizacion.get('tel_cliente') or 'N/A'), style_value), "", ""],
            [Paragraph("TRABAJO REALIZADO:", style_label), Paragraph(info_negocio, style_value), "", ""]
        ]
        
        cliente_table = Table(datos_cliente_data, colWidths=[140, 240, 60, 100])
        cliente_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('SPAN', (1,2), (3,2)),
            ('SPAN', (1,3), (3,3)),
            ('SPAN', (1,4), (3,4)),
            ('LINEBELOW', (1,0), (1,1), 0.5, colors.black),
            ('LINEBELOW', (3,0), (3,1), 0.5, colors.black),
            ('LINEBELOW', (1,2), (3,3), 0.5, colors.black),
            ('LINEBELOW', (1,4), (3,4), 0.5, colors.black),
            ('PADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(cliente_table)
        story.append(Spacer(1, 20))
        
        # --- TABLA DE CONCEPTOS ---
        tabla_data = [[
            Paragraph("CANTIDAD", style_th),
            Paragraph("DESCRIPCIÓN DEL PROYECTO Y MATERIALES", style_th),
            Paragraph("PRECIO", style_th),
            Paragraph("IMPORTE", style_th)
        ]]
        
        subtotal = 0.0
        for mat in materiales:
            cantidad = float(mat.get('cantidad', 0))
            precio = float(mat.get('precio_unitario', 0))
            importe = cantidad * precio
            subtotal += importe
            tabla_data.append([
                Paragraph(f"{cantidad:,.0f}", style_td),
                Paragraph(str(mat.get('nombre_material' or 'Material')), style_td_left),
                Paragraph(f"${precio:,.2f}", style_td),
                Paragraph(f"${importe:,.2f}", style_td)
            ])
            
        gran_total = subtotal
        saldo_pendiente = gran_total - total_pagado
            
        # --- BLOQUE DE TOTALES ---
        tabla_data.append([Paragraph("FIRMA DE RECIBIDO Y CONFORMIDAD", style_td_left), "", Paragraph("TOTAL MATERIALES", style_td), Paragraph(f"${subtotal:,.2f}", style_td)])
        tabla_data.append(["", "", Paragraph("<b>TOTAL TRABAJO</b>", style_td), Paragraph(f"<b>${gran_total:,.2f}</b>", style_td)])
        tabla_data.append(["", "", Paragraph("<b>TOTAL PAGADO (-)</b>", style_td), Paragraph(f"<b>${total_pagado:,.2f}</b>", style_td)])
        tabla_data.append(["", "", Paragraph("<b>SALDO NETO</b>", style_td), Paragraph(f"<b>${saldo_pendiente:,.2f}</b>", style_td)])
        
        mat_table = Table(tabla_data, colWidths=[70, 270, 100, 100])
        mat_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#212529")), 
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('GRID', (0,0), (-1,-5), 1, colors.black),
            ('BOX', (2,-4), (-1,-1), 1, colors.black),
            ('INNERGRID', (2,-4), (-1,-1), 1, colors.black),
            ('BACKGROUND', (2,-1), (3,-1), colors.HexColor("#e8f5e9")), 
            ('SPAN', (0,-4), (1,-1)),
            ('ALIGN', (0,-4), (1,-1), 'CENTER'),
            ('PADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(mat_table)
        
        story.append(Spacer(1, 40))
        style_firma = ParagraphStyle('FirmaStyle', fontName='Helvetica', fontSize=9, alignment=1)
        story.append(Paragraph("________________________________________<br/>HERRERÍA CRUZ Y ENTREGAS CORRESPONDIENTES<br/>Liquidado por: " + nombre_completo_cliente, style_firma))

        doc.build(story)
        buffer.seek(0)
        
        return send_file(buffer, mimetype='application/pdf', as_attachment=False, download_name=f'remision_{id}.pdf')
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn: conn.close()
        

# ====================================================================
# 📸 1. GUARDAR EN EL CATÁLOGO (SOLUCIÓN DEFINITIVA ADAPTADA A ODBC)
# ====================================================================
@app.route('/catalogo', methods=['POST'])
def guardar_en_catalogo():
    try:
        nombre = request.form.get('nombre')
        fecha_elaboracion = request.form.get('fecha_elaboracion')
        trabajo_id = request.form.get('trabajo_id')
        
        # Validar si viene un archivo físico
        if 'foto' not in request.files:
            return jsonify({'error': 'No se adjuntó ninguna imagen'}), 400
            
        file = request.files['foto']
        if file.filename == '':
            return jsonify({'error': 'Archivo no válido'}), 400
            
        # Asegurar un nombre de archivo limpio y guardarlo en la ruta configurada
        from werkzeug.utils import secure_filename
        import os
        filename = secure_filename(file.filename)
        
        # Generar la ruta física de guardado
        ruta_directorio = app.config.get('UPLOAD_FOLDER', os.path.join(os.path.dirname(__file__), 'static/uploads'))
        if not os.path.exists(ruta_directorio):
            os.makedirs(ruta_directorio)
            
        ruta_completa = os.path.join(ruta_directorio, filename)
        file.save(ruta_completa)
        
        # Lo que se guardará en la base de datos (Ej: static/uploads/puerta.jpg)
        ruta_base_datos = f"static/uploads/{filename}"
        
        # Conexión a la base de datos
        conn = get_connection()
        cursor = conn.cursor()
        
        query_insert = """
            INSERT INTO catalogo_trabajos (trabajo_id, nombre, fecha_elaboracion, ruta_imagen)
            VALUES (?, ?, ?, ?)
        """
        
        # Formatear valores vacíos a None (NULL en SQL) para evitar que rompa tipos de datos
        val_trabajo_id = int(trabajo_id) if trabajo_id and str(trabajo_id).strip() != '' else None
        val_fecha = fecha_elaboracion if fecha_elaboracion and str(fecha_elaboracion).strip() != '' else None

        # Ejecución estructurada de parámetros
        cursor.execute(query_insert, (
            val_trabajo_id,
            nombre,
            val_fecha,
            ruta_base_datos
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'mensaje': 'Trabajo catalogado exitosamente'}), 201
        
    except Exception as e:
        print(" Error interno detectado en Flask:", str(e))
        return jsonify({'error': f"Excepción interna: {str(e)}"}), 500


# ====================================================================
# 📅 2. OBTENER FECHA DE ENTREGA AUTOMÁTICA DESDE PAGOS
# ====================================================================
@app.route('/ordenes/<int:id_trabajo>/fecha-entrega', methods=['GET'])
def obtener_fecha_entrega_orden(id_trabajo):
    cursor = None
    conexion = None
    try:
        from datetime import date
        conexion = get_connection()
        cursor = conexion.cursor()
        
        # Buscar el pago más reciente vinculado a la cotización de ese trabajo
        cursor.execute("""
            SELECT MAX(p.fecha_pago) as ultima_fecha 
            FROM pagos p
            JOIN trabajos t ON p.cotizacion_id = t.cotizacion_id
            WHERE t.id_trabajo = ?
        """, (id_trabajo,))
        
        row = cursor.fetchone()
        if row and row[0] is not None:
            fecha_entrega = str(row[0])[:10]
        else:
            fecha_entrega = date.today().isoformat()
            
        return jsonify({'fecha_entrega': fecha_entrega}), 200
    except Exception as e:
        print("ERROR OBTENIENDO FECHA DE ENTREGA:", str(e))
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor: cursor.close()
        if conexion: conexion.close()


# ====================================================================
# 📋 3. OBTENER EL CATÁLOGO COMPLETO (SINTAXIS LIMPIA SIN DUPLICADOS)
# ====================================================================
@app.route('/catalogo', methods=['GET'])
def obtener_catalogo():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        query_select = """
            SELECT id_catalogo, trabajo_id, nombre, fecha_elaboracion, ruta_imagen 
            FROM catalogo_trabajos
            ORDER BY id_catalogo DESC
        """
        cursor.execute(query_select)
        rows = cursor.fetchall()
        
        catalogo = []
        for row in rows:
            fecha_str = row[3].strftime('%Y-%m-%d') if row[3] and hasattr(row[3], 'strftime') else str(row[3]) if row[3] else ""
            
            catalogo.append({
                'id_catalogo': row[0],
                'trabajo_id': row[1],
                'nombre': row[2],
                'fecha_elaboracion': fecha_str,
                'ruta_imagen': row[4]
            })
            
        conn.close()
        return jsonify(catalogo), 200
        
    except Exception as e:
        print("Error en GET /catalogo:", str(e))
        return jsonify({'error': f"Fallo en base de datos: {str(e)}"}), 500

@app.route('/catalogo/pdf', methods=['GET'])
@cross_origin()
def descargar_catalogo_pdf():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Consultamos los datos de los trabajos
        cursor.execute("SELECT nombre, ruta_imagen, fecha_elaboracion, trabajo_id FROM catalogo_trabajos ORDER BY fecha_elaboracion DESC")
        rows = cursor.fetchall()
        
        # 1. CLASIFICACIÓN DINÁMICA POR CATEGORÍAS
        # Definimos las categorías que maneja tu sistema
        CATEGORIAS_VALIDAS = ["PUERTA", "VENTANA", "ZAGUAN", "ESTRUCTURAS", "TEJADO", "CRUZ", "CORTINA", "BARANDAL"]
        
        # Inicializamos el diccionario agrupador con una sección para "OTROS" por si acaso
        catalogo_agrupado = {cat: [] for cat in CATEGORIAS_VALIDAS}
        catalogo_agrupado["OTROS DISEÑOS"] = []
        
        for row in rows:
            nombre_trabajo = row[0].upper() if row[0] else "SIN NOMBRE"
            item = {
                'nombre': row[0],
                'ruta_imagen': row[1],
                'fecha_elaboracion': row[2],
                'trabajo_id': row[3]
            }
            
            # Buscamos si el nombre del trabajo contiene alguna palabra clave de tus categorías
            categoria_encontrada = False
            for cat in CATEGORIAS_VALIDAS:
                if cat in nombre_trabajo:
                    catalogo_agrupado[cat].append(item)
                    categoria_encontrada = True
                    break
            
            if not categoria_encontrada:
                catalogo_agrupado["OTROS DISEÑOS"].append(item)
                
        cursor.close()
        conn.close()

        # 2. CONFIGURACIÓN DEL DOCUMENTO PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=letter,
            rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36
        )
        
        styles = getSampleStyleSheet()
        
        style_empresa = ParagraphStyle('Empresa', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=22, textColor=colors.HexColor("#1A252C"), spaceAfter=4)
        style_slogan = ParagraphStyle('Slogan', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=10, textColor=colors.HexColor("#555555"), spaceAfter=15)
        style_titulo_doc = ParagraphStyle('TituloDoc', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=16, textColor=colors.HexColor("#D9822B"), alignment=1, spaceAfter=15)
        
        # NUEVO: Estilo elegante para los separadores de cada categoría
        style_categoria_header = ParagraphStyle('CatHeader', parent=styles['Heading3'], fontName='Helvetica-Bold', fontSize=13, textColor=colors.HexColor("#1A252C"), spaceBefore=12, spaceAfter=8)
        
        style_nombre_trabajo = ParagraphStyle('NombreTrabajo', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor("#1A252C"), alignment=1)
        style_meta_trabajo = ParagraphStyle('MetaTrabajo', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, textColor=colors.HexColor("#666666"), alignment=1)

        story = []

        # ENCABEZADO CORPORATIVO
        fecha_actual_sistema = datetime.now().strftime('%d/%m/%Y')
        datos_empresa = [
            [
                Paragraph("<b>HERRERÍA CRUZ</b>", style_empresa),
                Paragraph(f"<b>FECHA DE IMPRESIÓN:</b> {fecha_actual_sistema}", style_meta_trabajo)
            ],
            [
                Paragraph("Trabajos en Forja, Estructuras Metálicas y Automatizaciones", style_slogan),
                ""
            ]
            
        ]   
        
        
        
        tabla_header = Table(datos_empresa, colWidths=[340, 200])
        tabla_header.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('ALIGN', (1,0), (1,0), 'RIGHT')
        ]))
        story.append(tabla_header)
        
        # LÍNEA DIVISORIA PRINCIPAL
        linea_div = Table([[""]], colWidths=[540], rowHeights=[3])
        linea_div.setStyle(TableStyle([('BACKGROUND', (0,0), (0,0), colors.HexColor("#D9822B"))]))
        story.append(linea_div)
        story.append(Spacer(1, 10))

        story.append(Paragraph("CATÁLOGO DE PROYECTOS Y TRABAJOS REALIZADOS", style_titulo_doc))

        # 3. CONSTRUCCIÓN DE SECCIONES EN EL STORY
        tiene_contenido = False
        
        for categoria, trabajos in catalogo_agrupado.items():
            if not trabajos:
                continue # Si no hay elementos en esta categoría, nos saltamos el encabezado
            
            tiene_contenido = True
            
            # Añadimos el título de la categoría al PDF
            story.append(Paragraph(f"SECCIÓN: {categoria}", style_categoria_header))
            
            # Línea sutil debajo de cada categoría
            linea_cat = Table([[""]], colWidths=[540], rowHeights=[1])
            linea_cat.setStyle(TableStyle([('BACKGROUND', (0,0), (0,0), colors.HexColor("#E0E0E0"))]))
            story.append(linea_cat)
            story.append(Spacer(1, 8))
            
            # Generamos la cuadrícula de 2 columnas específica para esta categoría
            tabla_datos = []
            fila_actual = []
            
            for index, t in enumerate(trabajos):
                elementos_celda = []
                
                # Buscador de imágenes en disco
                ruta_imagen_limpia = t['ruta_imagen'].replace('\\', '/') if t['ruta_imagen'] else ''
                opciones_rutas = [
                    os.path.join(os.getcwd(), ruta_imagen_limpia),
                    os.path.join(os.getcwd(), 'static', ruta_imagen_limpia.replace('static/', '')),
                    os.path.abspath(ruta_imagen_limpia)
                ]
                
                imagen_cargada = False
                for ruta in opciones_rutas:
                    if os.path.exists(ruta) and os.path.isfile(ruta):
                        try:
                            img = Image(ruta, width=235, height=155)
                            elementos_celda.append(img)
                            imagen_cargada = True
                            break
                        except:
                            continue
                
                if not imagen_cargada:
                    elementos_celda.append(Paragraph("[Fotografía no localizada]", style_meta_trabajo))

                elementos_celda.append(Spacer(1, 4))
                elementos_celda.append(Paragraph(t['nombre'].upper() if t['nombre'] else 'SIN NOMBRE', style_nombre_trabajo))
                
                origen = "PROYECTO INTERNO" if t['trabajo_id'] else "DISEÑO EXTERNO"
                fecha_str = t['fecha_elaboracion'].strftime('%d/%m/%Y') if hasattr(t['fecha_elaboracion'], 'strftime') else str(t['fecha_elaboracion']) if t['fecha_elaboracion'] else "S/F"
                
                elementos_celda.append(Paragraph(f"Tipo: {origen} | Reg: {fecha_str}", style_meta_trabajo))
                elementos_celda.append(Spacer(1, 10))
                
                fila_actual.append(elementos_celda)
                
                if len(fila_actual) == 2 or index == len(trabajos) - 1:
                    if len(fila_actual) == 1:
                        fila_actual.append("") # Rellenar celda derecha si queda impar
                    tabla_datos.append(fila_actual)
                    fila_actual = []

            # Estilizamos la tabla de la categoría actual
            tabla_catalogo = Table(tabla_datos, colWidths=[270, 270])
            tabla_catalogo.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FBFBFB")),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#ECEFF1")),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CFD8DC")),
                ('TOPPADDING', (0,0), (-1,-1), 10),
                ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ]))
            
            story.append(tabla_catalogo)
            story.append(Spacer(1, 15)) # Espacio antes de la siguiente categoría

        if not tiene_contenido:
            story.append(Paragraph("No existen registros de evidencias fotográficas disponibles en este momento.", style_nombre_trabajo))

        doc.build(story)
        buffer.seek(0)
        return send_file(buffer, as_attachment=True, download_name='Catalogo_Clasificado_Herreria.pdf', mimetype='application/pdf')

    except Exception as e:
        print(" ERROR EN GENERACIÓN DE PDF CLASIFICADO:", str(e))
        return jsonify({"error": str(e)}), 500
@app.route('/registro', methods=['POST', 'OPTIONS'])
def registrar_usuario_sistema():
    # Soporte explícito para peticiones preflight OPTIONS
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    conn = get_connection()
    cursor = conn.cursor()

    try:
        # 1. Encriptamos la contraseña antes de guardarla por seguridad industrial
        password_encriptada = generate_password_hash(data.get('contrasena'))

        # 2. Insertamos al usuario en tu tabla correspondiente
        sql = """
            INSERT INTO usuarios (correo, contrasena, nombre, apellido_paterno, apellido_materno, edad) 
            VALUES (?, ?, ?, ?, ?, ?)
        """
        valores = (
            data.get('correo'),
            password_encriptada, # <-- Contraseña segura en formato hash
            data.get('nombre'),
            data.get('apellido_paterno'),
            data.get('apellido_materno'),
            data.get('edad')
        )

        cursor.execute(sql, valores)
        conn.commit()
        return jsonify({'mensaje': 'Usuario registrado exitosamente en el sistema'}), 201

    except Exception as e:
        conn.rollback()
        print("❌ Error en registro:", str(e))
        return jsonify({'error': f'El correo ya está registrado o faltan datos obligatorios: {str(e)}'}), 400
    finally:
        cursor.close()
        conn.close()


@app.route('/login', methods=['POST', 'OPTIONS'])
def iniciar_sesion_sistema():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    correo = data.get('correo')
    contrasena = data.get('contrasena')

    conn = get_connection()
    cursor = conn.cursor()

    try:
        # Buscamos al usuario por su correo
        cursor.execute("SELECT correo, contrasena, nombre FROM usuarios WHERE correo = ?", (correo,))
        usuario = cursor.fetchone()

        if usuario:
            correo_bd = usuario[0]
            hash_bd = usuario[1]
            nombre_bd = usuario[2]

            # Validamos si la contraseña coincide con el hash encriptado
            if check_password_hash(hash_bd, contrasena):
                return jsonify({
                    'mensaje': 'Acceso autorizado',
                    'usuario': {
                        'nombre': nombre_bd,
                        'correo': correo_bd
                    }
                }), 200

        # Si no entra al IF, las credenciales no son válidas
        return jsonify({'error': 'Correo o contraseña incorrectos'}), 401

    except Exception as e:
        return jsonify({'error': f'Error en el inicio de sesión: {str(e)}'}), 500
    finally:
        cursor.close()
        conn.close()
    
if __name__ == '__main__':
    app.run(debug=True)
