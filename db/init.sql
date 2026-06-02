-- ============================================================
-- 1️⃣ CONFIGURACIÓN INICIAL Y CREACIÓN DE BASE DE DATOS
-- ============================================================
CREATE DATABASE IF NOT EXISTS `herreriacruz`;
USE `herreriacruz`;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Desactivamos explícitamente el chequeo para evitar conflictos menores durante la carga masiva
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 2️⃣ TABLAS INDEPENDIENTES (NIVEL 1)
-- ============================================================

-- Tabla: unidades
DROP TABLE IF EXISTS `unidades`;
CREATE TABLE `unidades` (
  `id_unidad` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(30) NOT NULL,
  PRIMARY KEY (`id_unidad`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: proveedores
DROP TABLE IF EXISTS `proveedores`;
CREATE TABLE `proveedores` (
  `id_proveedor` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `contacto` varchar(100) DEFAULT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `direccion` text,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: clientes
DROP TABLE IF EXISTS `clientes`;
CREATE TABLE `clientes` (
  `id_cliente` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellidoP` varchar(50) NOT NULL,
  `apellidoM` varchar(50) DEFAULT NULL,
  `telefono` varchar(15) NOT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `direccion` text,
  PRIMARY KEY (`id_cliente`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: categorias
DROP TABLE IF EXISTS `categorias`;
CREATE TABLE `categorias` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: usuarios
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `rol` enum('Administrador','Empleado') NOT NULL DEFAULT 'Empleado',
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 3️⃣ TABLAS DEPENDIENTES (NIVEL 2)
-- ============================================================

-- Tabla: materiales
DROP TABLE IF EXISTS `materiales`;
CREATE TABLE `materiales` (
  `id_material` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `stock_actual` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stock_minimo` decimal(10,2) NOT NULL DEFAULT '0.00',
  `unidad_id` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_material`),
  KEY `unidad_id` (`unidad_id`),
  CONSTRAINT `materiales_ibfk_1` FOREIGN KEY (`unidad_id`) REFERENCES `unidades` (`id_unidad`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: cotizaciones
DROP TABLE IF EXISTS `cotizaciones`;
CREATE TABLE `cotizaciones` (
  `id_cotizacion` int NOT NULL AUTO_INCREMENT,
  `cliente_id` int NOT NULL,
  `categoria_id` int NOT NULL,
  `descripcion` text,
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_pagado` decimal(10,2) NOT NULL DEFAULT '0.00',
  `estado_pago` enum('Pendiente','Parcial','Pagado') NOT NULL DEFAULT 'Pendiente',
  `estado` enum('Pendiente','En Proceso','Terminado','Entregado','Cancelado') NOT NULL DEFAULT 'Pendiente',
  `fecha` date NOT NULL,
  PRIMARY KEY (`id_cotizacion`),
  KEY `cliente_id` (`cliente_id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `cotizaciones_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cotizaciones_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id_categoria`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: compras_proveedores
DROP TABLE IF EXISTS `compras_proveedores`;
CREATE TABLE `compras_proveedores` (
  `id_compra` int NOT NULL AUTO_INCREMENT,
  `proveedor_id` int NOT NULL,
  `fecha` date NOT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_compra`),
  KEY `proveedor_id` (`proveedor_id`),
  CONSTRAINT `compras_proveedores_ibfk_1` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id_proveedor`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 4️⃣ TABLAS DE DETALLES Y CONTROL OPERATIVO (NIVEL 3)
-- ============================================================

-- Tabla: detalles_compras
DROP TABLE IF EXISTS `detalles_compras`;
CREATE TABLE `detalles_compras` (
  `id_detalle_compra` int NOT NULL AUTO_INCREMENT,
  `compra_id` int NOT NULL,
  `material_id` int NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) GENERATED ALWAYS AS ((`cantidad` * `precio_unitario`)) STORED,
  PRIMARY KEY (`id_detalle_compra`),
  KEY `compra_id` (`compra_id`),
  KEY `material_id` (`material_id`),
  CONSTRAINT `detalles_compras_ibfk_1` FOREIGN KEY (`compra_id`) REFERENCES `compras_proveedores` (`id_compra`) ON DELETE CASCADE,
  CONSTRAINT `detalles_compras_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `materiales` (`id_material`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: detalles_cotizaciones
DROP TABLE IF EXISTS `detalles_cotizaciones`;
CREATE TABLE `detalles_cotizaciones` (
  `id_detalle_cot` int NOT NULL AUTO_INCREMENT,
  `cotizacion_id` int NOT NULL,
  `material_id` int NOT NULL,
  `cantidad_estimada` decimal(10,2) NOT NULL,
  `precio_cobrado` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) GENERATED ALWAYS AS ((`cantidad_estimada` * `precio_cobrado`)) STORED,
  PRIMARY KEY (`id_detalle_cot`),
  KEY `cotizacion_id` (`cotizacion_id`),
  KEY `material_id` (`material_id`),
  CONSTRAINT `detalles_cotizaciones_ibfk_1` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones` (`id_cotizacion`) ON DELETE CASCADE,
  CONSTRAINT `detalles_cotizaciones_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `materiales` (`id_material`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: empleados
DROP TABLE IF EXISTS `empleados`;
CREATE TABLE `empleados` (
  `id_empleado` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellidoP` varchar(50) NOT NULL,
  `apellidoM` varchar(50) DEFAULT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `puesto` varchar(50) NOT NULL,
  `salario_dia` decimal(10,2) NOT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_empleado`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: asistencia
DROP TABLE IF EXISTS `asistencia`;
CREATE TABLE `asistencia` (
  `id_asistencia` int NOT NULL AUTO_INCREMENT,
  `empleado_id` int NOT NULL,
  `fecha` date NOT NULL,
  `estado` enum('Asistió','Faltó','Retardo','Justificado') NOT NULL,
  PRIMARY KEY (`id_asistencia`),
  UNIQUE KEY `empleado_fecha_unico` (`empleado_id`,`fecha`),
  CONSTRAINT `asistencia_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id_empleado`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: nomina
DROP TABLE IF EXISTS `nomina`;
CREATE TABLE `nomina` (
  `id_nomina` int NOT NULL AUTO_INCREMENT,
  `empleado_id` int NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `dias_trabajados` int NOT NULL DEFAULT '0',
  `total_pagar` decimal(10,2) NOT NULL DEFAULT '0.00',
  `estado` enum('Pendiente','Pagado') NOT NULL DEFAULT 'Pendiente',
  PRIMARY KEY (`id_nomina`),
  KEY `empleado_id` (`empleado_id`),
  CONSTRAINT `nomina_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id_empleado`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: pagos_clientes
DROP TABLE IF EXISTS `pagos_clientes`;
CREATE TABLE `pagos_clientes` (
  `id_pago` int NOT NULL AUTO_INCREMENT,
  `cotizacion_id` int NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha` date NOT NULL,
  `metodo_pago` enum('Efectivo','Transferencia','Tarjeta') NOT NULL,
  PRIMARY KEY (`id_pago`),
  KEY `cotizacion_id` (`cotizacion_id`),
  CONSTRAINT `pagos_clientes_ibfk_1` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones` (`id_cotizacion`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- 5️⃣ DISPARADORES (TRIGGERS AUTOMÁTICOS PARA CONTROL DE STOCK)
-- ============================================================

-- Trigger 1: Actualizar stock al insertar una compra (Atómico para Docker)
CREATE TRIGGER `tg_actualizar_stock_compra` AFTER INSERT ON `detalles_compras` 
FOR EACH ROW 
UPDATE materiales SET stock_actual = stock_actual + NEW.cantidad WHERE id_material = NEW.material_id;

-- Trigger 2: Restar stock si se elimina o cancela una compra (Atómico para Docker)
CREATE TRIGGER `tg_actualizar_stock_cancelar_compra` AFTER DELETE ON `detalles_compras` 
FOR EACH ROW 
UPDATE materiales SET stock_actual = stock_actual - OLD.cantidad WHERE id_material = OLD.material_id;

-- ============================================================
-- 6️⃣ INSERCIÓN DE DATOS INICIALES (SEMILLAS / SEEDS)
-- ============================================================
LOCK TABLES `unidades` WRITE;
INSERT INTO `unidades` VALUES (1,'Metros'),(2,'Kilos'),(3,'Piezas');
UNLOCK TABLES;

LOCK TABLES `proveedores` WRITE;
INSERT INTO `proveedores` VALUES (1,'Aceros Cruz','Juan Pérez','5551234567','contacto@aceroscruz.com','Av. Industrial 123'),(2,'Herramientas del Norte','Ana Gómez','5559876543','ventas@herramientas.com','Calle Ferretera 456');
UNLOCK TABLES;

LOCK TABLES `clientes` WRITE;
INSERT INTO `clientes` VALUES (1,'Carlos','Mendoza','Ruiz','5551112223','carlos@gmail.com','Col. Centro 12'),(2,'María','Delgado','Sanz','5554445556','maria@hotmail.com','Av. Siempre Viva 742'),(3,'Jorge','Hernández',NULL,'5557778889','jorge@outlook.com','Rancho Grande Lote 5');
UNLOCK TABLES;

LOCK TABLES `categorias` WRITE;
INSERT INTO `categorias` VALUES (1,'Puertas','Fabricación de puertas metálicas de diferentes diseños'),(2,'Ventanas','Estructuras metálicas y de herrería para ventanas residenciales'),(3,'Portones','Portones automatizados y manuales de gran tamaño');
UNLOCK TABLES;

LOCK TABLES `usuarios` WRITE;
INSERT INTO `usuarios` VALUES (1,'Patricia Cruz','patricia@herreriacruz.com','$2b$12$K8M8.Ua7KjP2Z.mZl7Ypbe09A3G9GZ9M1O3W8FhMvXpQ9gP/Z826C','Administrador','2026-06-02 12:00:00'),(2,'Luis Empleado','luis@herreriacruz.com','$2b$12$R9N9.Ua7KjP2Z.mZl7Ypbe09A3G9GZ9M1O3W8FhMvXpQ9gP/Z826C','Empleado','2026-06-02 12:05:00');
UNLOCK TABLES;

LOCK TABLES `materiales` WRITE;
INSERT INTO `materiales` VALUES (1,'Perfil Tubular Zote Z-200','Perfil para marcos de puertas y ventanas',25.00,10.00,1,120.50),(2,'Varilla Corrugada 3/8','Varilla de acero estructural',150.00,50.00,2,45.00),(3,'Disco de Corte 4 1/2','Consumible para esmeriladora',15.00,5.00,3,35.00),(4,'Electrodo E6013 1/8','Soldadura para acero dulce',12.50,5.00,2,85.00);
UNLOCK TABLES;

LOCK TABLES `cotizaciones` WRITE;
INSERT INTO `cotizaciones` VALUES (1,1,1,'Puerta principal con chapa de seguridad',5500.00,2000.00,'Parcial','En Proceso','2026-05-15'),(2,2,3,'Portón corredizo moderno de 4 metros',18000.00,18000.00,'Pagado','Terminado','2026-05-20');
UNLOCK TABLES;

LOCK TABLES `compras_proveedores` WRITE;
INSERT INTO `compras_proveedores` VALUES (1,1,'2026-05-10',3500.00),(2,2,'2026-05-12',700.00);
UNLOCK TABLES;

LOCK TABLES `detalles_compras` WRITE;
INSERT INTO `detalles_compras` (`id_detalle_compra`, `compra_id`, `material_id`, `cantidad`, `precio_unitario`) VALUES (1,1,1,20.00,120.50),(2,1,2,24.11,45.00),(3,2,3,20.00,35.00);
UNLOCK TABLES;

LOCK TABLES `detalles_cotizaciones` WRITE;
INSERT INTO `detalles_cotizaciones` (`id_detalle_cot`, `cotizacion_id`, `material_id`, `cantidad_estimada`, `precio_cobrado`) VALUES (1,1,1,3.00,150.00),(2,1,4,2.00,110.00),(3,2,2,40.00,65.00);
UNLOCK TABLES;

LOCK TABLES `empleados` WRITE;
INSERT INTO `empleados` VALUES (1,'Juan','García','López','5558889990','Herrero Oficial',450.00,'Activo'),(2,'Pedro','Sánchez','GGómez','5552223334','Ayudante',280.00,'Activo'),(3,'Miguel','Martínez',NULL,NULL,'Soldador Experto',500.00,'Inactivo');
UNLOCK TABLES;

LOCK TABLES `asistencia` WRITE;
INSERT INTO `asistencia` VALUES (1,1,'2026-05-25','Asistió'),(2,2,'2026-05-25','Asistió'),(3,1,'2026-05-26','Retardo');
UNLOCK TABLES;

LOCK TABLES `nomina` WRITE;
INSERT INTO `nomina` VALUES (1,1,'2026-05-18','2026-05-23',6,2700.00,'Pagado'),(2,2,'2026-05-18','2026-05-23',6,1680.00,'Pendiente');
UNLOCK TABLES;

LOCK TABLES `pagos_clientes` WRITE;
INSERT INTO `pagos_clientes` VALUES (1,1,2000.00,'2026-05-15','Efectivo'),(2,2,10000.00,'2026-05-20','Transferencia'),(3,2,8000.00,'2026-05-22','Transferencia');
UNLOCK TABLES;

-- ============================================================
-- 7️⃣ CREACIÓN DE VISTAS DE RESUMEN (WITHOUT DEFINER)
-- ============================================================

DROP VIEW IF EXISTS `v_cotizaciones_resumen`;
CREATE VIEW `v_cotizaciones_resumen` AS 
select 
    `co`.`id_cotizacion` AS `id_cotizacion`,
    concat(`cl`.`nombre`,' ',`cl`.`apellidoP`) AS `cliente`,
    `cl`.`telefono` AS `telefono`,
    `ca`.`nombre` AS `categoria`,
    `co`.`total` AS `total`,
    `co`.`total_pagado` AS `total_pagado`,
    (`co`.`total` - `co`.`total_pagado`) AS `saldo_pendiente`,
    `co`.`estado_pago` AS `estado_pago`,
    `co`.`estado` AS `estado`,
    `co`.`fecha` AS `fecha` 
from ((`cotizaciones` `co` 
join `clientes` `cl` on((`cl`.`id_cliente` = `co`.`cliente_id`))) 
join `categorias` `ca` on((`ca`.`id_categoria` = `co`.`categoria_id`)));

DROP VIEW IF EXISTS `v_asistencia_semanal`;
CREATE VIEW `v_asistencia_semanal` AS 
select 
    `as`.`fecha` AS `fecha`,
    `em`.`id_empleado` AS `id_empleado`,
    concat(`em`.`nombre`,' ',`em`.`apellidoP`) AS `empleado`,
    `em`.`puesto` AS `puesto`,
    `as`.`estado` AS `estado_asistencia` 
from (`asistencia` `as` 
join `empleados` `em` on((`em`.`id_empleado` = `as`.`empleado_id`)));

-- Volvemos a activar los candados de seguridad de llaves foráneas
SET FOREIGN_KEY_CHECKS = 1;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;