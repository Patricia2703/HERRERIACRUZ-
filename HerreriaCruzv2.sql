
CREATE DATABASE IF NOT EXISTS HerreriaCruz;
USE HerreriaCruz;

-- =============================================================
-- TABLAS CATÁLOGO
-- =============================================================

CREATE TABLE categorias (
    id_categoria    INT           AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(50)   UNIQUE NOT NULL,
    fecha_creacion  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorias_empleado (
    id_categoria_empleado INT           AUTO_INCREMENT PRIMARY KEY,
    nombre               VARCHAR(50) NOT NULL,
    tarifa_hora           DECIMAL(10,2) NOT NULL,
    fecha_actualizacion   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO categorias_empleado (nombre, tarifa_hora) VALUES
    ('ayudante_general',  50.00),
    ('soldador',          80.00),
    ('pintor',            75.00),
    ('jefe_taller',      120.00);

CREATE TABLE unidades (
    id_unidad INT          AUTO_INCREMENT PRIMARY KEY,
    nombre    VARCHAR(30)  UNIQUE NOT NULL
);

INSERT INTO unidades (nombre) VALUES
    ('pieza'),
    ('metro'),
    ('kg'),
    ('litro'),
    ('rollo'),
    ('lámina');

-- =============================================================
-- TABLAS PRINCIPALES
-- =============================================================

CREATE TABLE clientes (
    id_cliente     INT          AUTO_INCREMENT PRIMARY KEY,
    nombre         VARCHAR(60)  NOT NULL,
    apellidoP      VARCHAR(60)  NOT NULL,
    apellidoM      VARCHAR(60)  NOT NULL,
    telefono       VARCHAR(20),
    direccion      TEXT,
    correo VARCHAR(70) NOT NULL, 
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE empleados (
    id_empleado      INT          AUTO_INCREMENT PRIMARY KEY,
    nombre           VARCHAR(60)  NOT NULL,
    apellidoP        VARCHAR(60)  NOT NULL,
    apellidoM        VARCHAR(60)  NOT NULL,
    telefono         VARCHAR(20),
    fecha_nacimiento DATE,
    categoria_id     INT          NOT NULL,
    activo           BOOLEAN      DEFAULT TRUE,
    fecha_registro   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (categoria_id) REFERENCES categorias_empleado(id_categoria_empleado)
);

CREATE TABLE materiales (
    id_material     INT            AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100)   NOT NULL,
    unidad_id       INT            NOT NULL,
    precio_unitario DECIMAL(10,2)  NOT NULL,
    stock           DECIMAL(10,2)  DEFAULT 0,

    FOREIGN KEY (unidad_id) REFERENCES unidades(id_unidad)
);

-- =============================================================
-- ASISTENCIA Y NÓMINA
-- =============================================================

CREATE TABLE asistencia (
    id_asistencia    INT            AUTO_INCREMENT PRIMARY KEY,
    empleado_id      INT            NOT NULL,
    fecha            DATE           NOT NULL,
    hora_entrada     TIME           NOT NULL,
    hora_salida      TIME,
    horas_trabajadas DECIMAL(5,2),
    pago_calculado   DECIMAL(10,2),

    UNIQUE (empleado_id, fecha),
    FOREIGN KEY (empleado_id) REFERENCES empleados(id_empleado)
);

-- =============================================================
-- COTIZACIONES Y DETALLE
-- =============================================================

CREATE TABLE cotizaciones (
    id_cotizacion       INT            AUTO_INCREMENT PRIMARY KEY,
    cliente_id          INT            NOT NULL,
    categoria_id        INT            NOT NULL,
    descripcion         TEXT,
    ancho               DECIMAL(10,2),
    alto                DECIMAL(10,2),
    largo               DECIMAL(10,2),
    descripcion_medidas TEXT,
    total               DECIMAL(10,2)  DEFAULT 0,
    total_pagado        DECIMAL(10,2)  DEFAULT 0,
    estado_pago         ENUM('sin_pago','parcial','pagado')     DEFAULT 'sin_pago',
    estado              ENUM('pendiente','aprobada','rechazada') DEFAULT 'pendiente',
    fecha               TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (cliente_id)   REFERENCES clientes(id_cliente),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id_categoria)
);

CREATE TABLE detalle_materiales_cotizacion (
    id_detalle      INT            AUTO_INCREMENT PRIMARY KEY,
    cotizacion_id   INT            NOT NULL,
    material_id     INT            NOT NULL,
    cantidad        DECIMAL(10,2)  NOT NULL,
    precio_unitario DECIMAL(10,2)  NOT NULL,
    subtotal        DECIMAL(10,2)  GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,

    FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id_cotizacion),
    FOREIGN KEY (material_id)   REFERENCES materiales(id_material)
);

-- =============================================================
-- INVENTARIO
-- =============================================================

CREATE TABLE movimientos_inventario (
    id_movimiento INT            AUTO_INCREMENT PRIMARY KEY,
    material_id   INT            NOT NULL,
    tipo          ENUM('entrada','salida') NOT NULL,
    cantidad      DECIMAL(10,2)  NOT NULL,
    motivo        VARCHAR(150),
    cotizacion_id INT,
    fecha         TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (material_id)   REFERENCES materiales(id_material),
    FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id_cotizacion)
);

-- =============================================================
-- TRABAJOS
-- =============================================================

CREATE TABLE trabajos (
    id_trabajo    INT  AUTO_INCREMENT PRIMARY KEY,
    cotizacion_id INT  NOT NULL,
    estado        ENUM('pendiente','en_proceso','en_pausa','terminado','entregado') DEFAULT 'pendiente',
    fecha_inicio  DATE,
    fecha_fin     DATE,

    FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id_cotizacion),
    FOREIGN KEY (empleado_id)   REFERENCES empleados(id_empleado)
);

CREATE TABLE trabajo_empleados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trabajo_id INT NOT NULL,
    empleado_id INT NOT NULL,

    FOREIGN KEY (trabajo_id) REFERENCES trabajos(id_trabajo),
    FOREIGN KEY (empleado_id) REFERENCES empleados(id_empleado)
);

-- =============================================================
-- PAGOS
-- =============================================================

CREATE TABLE pagos (
    id_pago       INT            AUTO_INCREMENT PRIMARY KEY,
    cotizacion_id INT            NOT NULL,
    monto         DECIMAL(10,2)  NOT NULL,
    tipo          ENUM('anticipo','pago_final')                       DEFAULT 'anticipo',
    metodo_pago   ENUM('efectivo','transferencia','tarjeta','cheque') NOT NULL,
    fecha         TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id_cotizacion)
);

-- =============================================================
-- TRIGGERS
-- =============================================================

DELIMITER $$

-- ── Recalcula total de cotización al insertar un detalle ──
CREATE TRIGGER tr_recalcular_total_insert
AFTER INSERT ON detalle_materiales_cotizacion
FOR EACH ROW
BEGIN
    UPDATE cotizaciones
    SET total = (
        SELECT IFNULL(SUM(subtotal), 0)
        FROM detalle_materiales_cotizacion
        WHERE cotizacion_id = NEW.cotizacion_id
    )
    WHERE id_cotizacion = NEW.cotizacion_id;
END$$

-- ── Recalcula total de cotización al eliminar un detalle ──
CREATE TRIGGER tr_recalcular_total_delete
AFTER DELETE ON detalle_materiales_cotizacion
FOR EACH ROW
BEGIN
    UPDATE cotizaciones
    SET total = (
        SELECT IFNULL(SUM(subtotal), 0)
        FROM detalle_materiales_cotizacion
        WHERE cotizacion_id = OLD.cotizacion_id
    )
    WHERE id_cotizacion = OLD.cotizacion_id;
END$$

-- ── Valida stock suficiente antes de aprobar una cotización ──
CREATE TRIGGER tr_validar_stock
BEFORE UPDATE ON cotizaciones
FOR EACH ROW
BEGIN
    IF NEW.estado = 'aprobada' AND OLD.estado != 'aprobada' THEN
        IF EXISTS (
            SELECT 1
            FROM detalle_materiales_cotizacion d
            JOIN materiales m ON m.id_material = d.material_id
            WHERE d.cotizacion_id = NEW.id_cotizacion
              AND m.stock < d.cantidad
        ) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Stock insuficiente para uno o más materiales';
        END IF;
    END IF;
END$$

-- ── Genera salida de inventario al aprobar una cotización ──
CREATE TRIGGER tr_movimiento_salida
AFTER UPDATE ON cotizaciones
FOR EACH ROW
BEGIN
    IF NEW.estado = 'aprobada' AND OLD.estado != 'aprobada' THEN
        INSERT INTO movimientos_inventario (material_id, tipo, cantidad, motivo, cotizacion_id)
        SELECT material_id, 'salida', cantidad,
               CONCAT('Aprobación cotización #', NEW.id_cotizacion),
               NEW.id_cotizacion
        FROM detalle_materiales_cotizacion
        WHERE cotizacion_id = NEW.id_cotizacion;
    END IF;
END$$

-- ── Actualiza stock al registrar cualquier movimiento ──
CREATE TRIGGER tr_actualizar_stock
AFTER INSERT ON movimientos_inventario
FOR EACH ROW
BEGIN
    UPDATE materiales
    SET stock = stock + IF(NEW.tipo = 'entrada', NEW.cantidad, -NEW.cantidad)
    WHERE id_material = NEW.material_id;
END$$

-- ── Suma pago y recalcula estado_pago al registrar un pago ──
CREATE TRIGGER tr_pago_insert
AFTER INSERT ON pagos
FOR EACH ROW
BEGIN
    DECLARE v_nuevo_total DECIMAL(10,2);
    DECLARE v_total       DECIMAL(10,2);

    SELECT total_pagado + NEW.monto, total
    INTO v_nuevo_total, v_total
    FROM cotizaciones
    WHERE id_cotizacion = NEW.cotizacion_id;

    UPDATE cotizaciones
    SET total_pagado = v_nuevo_total,
        estado_pago  = CASE
                           WHEN v_nuevo_total >= v_total THEN 'pagado'
                           WHEN v_nuevo_total  > 0       THEN 'parcial'
                           ELSE 'sin_pago'
                       END
    WHERE id_cotizacion = NEW.cotizacion_id;
END$$

-- ── Resta pago y recalcula estado_pago al eliminar un pago ──
CREATE TRIGGER tr_pago_delete
AFTER DELETE ON pagos
FOR EACH ROW
BEGIN
    DECLARE v_nuevo_total DECIMAL(10,2);
    DECLARE v_total       DECIMAL(10,2);

    SELECT GREATEST(total_pagado - OLD.monto, 0), total
    INTO v_nuevo_total, v_total
    FROM cotizaciones
    WHERE id_cotizacion = OLD.cotizacion_id;

    UPDATE cotizaciones
    SET total_pagado = v_nuevo_total,
        estado_pago  = CASE
                           WHEN v_nuevo_total <= 0       THEN 'sin_pago'
                           WHEN v_nuevo_total >= v_total THEN 'pagado'
                           ELSE 'parcial'
                       END
    WHERE id_cotizacion = OLD.cotizacion_id;
END$$

DELIMITER ;

-- =============================================================
-- STORED PROCEDURES
-- =============================================================

DELIMITER $$

-- ── Registra la entrada de un empleado ──
CREATE PROCEDURE sp_registrar_entrada(
    IN p_empleado_id INT,
    IN p_fecha       DATE,
    IN p_hora        TIME
)
BEGIN
    INSERT INTO asistencia (empleado_id, fecha, hora_entrada)
    VALUES (p_empleado_id, p_fecha, p_hora);
END$$

-- ── Registra la salida y calcula horas trabajadas + pago ──
CREATE PROCEDURE sp_registrar_salida(
    IN p_id_asistencia INT,
    IN p_hora          TIME
)
BEGIN
    UPDATE asistencia a
    JOIN empleados e           ON e.id_empleado           = a.empleado_id
    JOIN categorias_empleado c ON c.id_categoria_empleado = e.categoria_id
    SET
        a.hora_salida      = p_hora,
        a.horas_trabajadas = TIMESTAMPDIFF(MINUTE, a.hora_entrada, p_hora) / 60,
        a.pago_calculado   = (TIMESTAMPDIFF(MINUTE, a.hora_entrada, p_hora) / 60) * c.tarifa_hora
    WHERE a.id_asistencia = p_id_asistencia
      AND a.hora_salida IS NULL;
END$$

-- ── Registra una entrada de material al inventario ──
CREATE PROCEDURE sp_entrada_material(
    IN p_material_id INT,
    IN p_cantidad    DECIMAL(10,2),
    IN p_motivo      VARCHAR(150)
)
BEGIN
    INSERT INTO movimientos_inventario (material_id, tipo, cantidad, motivo)
    VALUES (p_material_id, 'entrada', p_cantidad, p_motivo);
END$$

DELIMITER ;

-- =============================================================
-- VISTAS
-- =============================================================

-- Asistencia con semana calculada, nombre de empleado y categoría
CREATE VIEW v_asistencia_semanal AS
SELECT
    a.id_asistencia,
    a.empleado_id,
    CONCAT(e.nombre, ' ', e.apellidoP)               AS empleado,
    c.nombre                                          AS categoria,
    c.tarifa_hora,
    DATE_SUB(a.fecha, INTERVAL WEEKDAY(a.fecha) DAY) AS semana,
    a.fecha,
    a.hora_entrada,
    a.hora_salida,
    a.horas_trabajadas,
    a.pago_calculado
FROM asistencia a
JOIN empleados e           ON e.id_empleado           = a.empleado_id
JOIN categorias_empleado c ON c.id_categoria_empleado = e.categoria_id;

-- Resumen de cotizaciones con cliente, categoría y saldo pendiente
CREATE VIEW v_cotizaciones_resumen AS
SELECT
    co.id_cotizacion,
    CONCAT(cl.nombre, ' ', cl.apellidoP) AS cliente,
    cl.telefono,
    ca.nombre                             AS categoria,
    co.total,
    co.total_pagado,
    (co.total - co.total_pagado)          AS saldo_pendiente,
    co.estado_pago,
    co.estado,
    co.fecha
FROM cotizaciones co
JOIN clientes   cl ON cl.id_cliente   = co.cliente_id
JOIN categorias ca ON ca.id_categoria = co.categoria_id;

-- Stock actual con unidad y valor en inventario
CREATE VIEW v_stock_materiales AS
SELECT
    m.id_material,
    m.nombre,
    u.nombre                      AS unidad,
    m.precio_unitario,
    m.stock,
    (m.stock * m.precio_unitario) AS valor_inventario
FROM materiales m
JOIN unidades u ON u.id_unidad = m.unidad_id;
