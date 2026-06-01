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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `unidades` WRITE;
INSERT INTO `unidades` VALUES (3,'kg'),(6,'lámina'),(4,'litro'),(2,'metro'),(1,'pieza'),(5,'rollo');
UNLOCK TABLES;

-- Tabla: usuarios
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellidoP` varchar(50) NOT NULL,
  `apellidoM` varchar(50) DEFAULT NULL,
  `edad` int DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('Administrador','Empleado') NOT NULL DEFAULT 'Empleado',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `usuarios` WRITE;
INSERT INTO `usuarios` VALUES (1,'ARTURO','CRUZ','HERNANDEZ',40,'art29cruz@gmail.com','scrypt:32768:8:1$3ifwZk02n8Ktf5PC$dbd1e9da107cb4afe5ac7a7378f9ae7a1570b78dac2f290fe7cf3256fae36f048137d4f1e68d4a481980babadf57f96f39d90e4de6a3ee99a857d8ff4ecb0a60','Administrador','2026-06-01 08:38:50'),(2,'PATRICIA','CRUZ','GARCIA',22,'mnpat21@gmail.com','scrypt:32768:8:1$ItEEGOazUsJSikUb$c092ce5d1d905f28b5cadcb8ccde8c49e3548e041957b8c669d0d55a65618ded53b2957ec756e8af757aecd2606b8a97d9bf7','Empleado','2026-06-01 08:38:50');
UNLOCK TABLES;

-- Tabla: categorias
DROP TABLE IF EXISTS `categorias`;
CREATE TABLE `categorias` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `categorias` WRITE;
INSERT INTO `categorias` VALUES (2,'Puerta Corrediza','2026-05-02 00:08:20'),(3,'Puerta','2026-05-17 07:07:57'),(4,'Ventana','2026-05-17 07:07:57'),(5,'Zaguan','2026-05-17 07:07:57'),(6,'Estructuras','2026-05-17 07:07:57'),(7,'Tejado','2026-05-17 07:07:57'),(8,'Cruz','2026-05-17 07:07:57'),(9,'Proteccion','2026-05-17 07:07:57'),(10,'Barandal','2026-05-17 07:07:57');
UNLOCK TABLES;

-- Tabla: categorias_empleado
DROP TABLE IF EXISTS `categorias_empleado`;
CREATE TABLE `categorias_empleado` (
  `id_categoria_empleado` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `tarifa_hora` decimal(10,2) NOT NULL,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_categoria_empleado`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `categorias_empleado` WRITE;
INSERT INTO `categorias_empleado` VALUES (1,'ayudante_general',40.00,'2026-05-26 04:07:28'),(2,'soldador',45.50,'2026-05-26 04:07:28'),(3,'pintor',32.00,'2026-05-26 04:07:28'),(4,'jefe_taller',50.00,'2026-05-26 04:07:28'),(5,'Herrero ',45.00,'2026-05-26 04:07:28');
UNLOCK TABLES;

-- Tabla: clientes
DROP TABLE IF EXISTS `clientes`;
CREATE TABLE `clientes` (
  `id_cliente` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellidoP` varchar(50) NOT NULL,
  `apellidoM` varchar(50) DEFAULT NULL,
  `telefono` varchar(15) NOT NULL,
  `direccion` text,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_cliente`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `clientes` WRITE;
INSERT INTO `clientes` VALUES (2,'JUAN ACTUALIZADO','PEREZZ','LOPEZ','4272443343',NULL,'2026-05-05 19:21:39','nuevo@test.com'),(3,'Guillermo','Soliz','Gomez','4272557890','Querétaro','2026-05-05 19:22:32','guille@gmail.com'),(5,'JOSE LUIS','PEÑA','HURTADO','1111111111',NULL,'2026-05-15 00:29:32','luisphurta@hotmail.com'),(14,'ANAIS','HURTADO','SOLIZ','2335655524','Lomas, Galindo #34, San Juan del Rio ','2026-05-26 12:32:05','anais232@gmail.com'),(16,'MARIANA','RESENDIZ','PITAYA','4274569028',NULL,'2026-05-27 12:49:15',NULL),(17,'FERNANDO','CRUZ','HERNANDEZ','4271149028','Geronimo #34, Barrio de la cruz ','2026-05-29 06:19:15','ferr@gmail.com');
UNLOCK TABLES;


-- ============================================================
-- 3️⃣ TABLAS CON DEPENDENCIAS DE NIVEL 1 (NIVEL 2)
-- ============================================================

-- Tabla: materiales
DROP TABLE IF EXISTS `materiales`;
CREATE TABLE `materiales` (
  `id_material` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `unidad_id` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `stock` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id_material`),
  KEY `unidad_id` (`unidad_id`),
  CONSTRAINT `materiales_ibfk_1` FOREIGN KEY (`unidad_id`) REFERENCES `unidades` (`id_unidad`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `materiales` WRITE;
INSERT INTO `materiales` VALUES (1,'LAMINA GALVANIZADA',1,250.00,58.00),(2,'PTR',1,200.00,6.00),(4,'PTR',1,129.00,4.00),(5,'MONTEN 4 X 6',1,365.73,4.00),(6,'PERFIL PTR 2 X 1 AZUL',1,255.62,83.00),(7,'PERFIL PINTADO 8 X 9',1,300.00,6.00),(8,'DISCO DE CORTE 4 1/2',1,32.00,10.00),(9,'PINTURA BLANCA',4,230.00,10.00),(10,'ELECTRODOS GRIS 1/8',3,90.00,10.00);
UNLOCK TABLES;

-- Tabla: empleados
DROP TABLE IF EXISTS `empleados`;
CREATE TABLE `empleados` (
  `id_empleado` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellidoP` varchar(50) NOT NULL,
  `apellidoM` varchar(50) DEFAULT NULL,
  `telefono` varchar(15) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `categoria_id` int NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `fecha_ingreso` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_empleado`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `empleados_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_empleado` (`id_categoria_empleado`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `empleados` WRITE;
INSERT INTO `empleados` VALUES (1,'Juan','Perez','Lopez','4421234567','1990-05-10',1,1,'2026-05-05 19:24:17'),(2,'LUIS FERNANDO','GONZALEZ','RAMIREZ','2324354567','1990-05-27',2,1,'2026-05-05 19:25:47'),(4,'ARTURO','CRUZ','HERNANDEZ','4274489048','1980-08-29',4,1,'2026-05-15 18:05:10'),(6,'ANGEL','GARCIA ','MENDOZA','4272247212','2004-01-21',3,0,'2026-05-17 04:27:18'),(7,'ALEXIS ','HURTADO','SOLIZ','4271234567','2000-05-18',1,1,'2026-05-24 01:21:40'),(8,'GABRIEL','CRUZ ','HERNANDEZ','4271424312','1986-04-18',2,1,'2026-05-26 04:10:48'),(9,'FRANCISCO','CRUZ','HERNANDEZ','4271158923','1979-11-20',5,1,'2026-05-26 04:12:12');
UNLOCK TABLES;


-- ============================================================
-- 4️⃣ TABLAS DE OPERACIÓN PRINCIPAL (NIVEL 3)
-- ============================================================

-- Tabla: asistencia
DROP TABLE IF EXISTS `asistencia`;
CREATE TABLE `asistencia` (
  `id_asistencia` int NOT NULL AUTO_INCREMENT,
  `empleado_id` int NOT NULL,
  `fecha` date NOT NULL,
  `hora_entrada` time NOT NULL,
  `hora_salida` time DEFAULT NULL,
  `horas_trabajadas` decimal(5,2) DEFAULT NULL,
  `pago_calculado` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_asistencia`),
  UNIQUE KEY `empleado_id` (`empleado_id`,`fecha`),
  CONSTRAINT `asistencia_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id_empleado`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `asistencia` WRITE;
INSERT INTO `asistencia` VALUES (1,2,'2026-05-24','11:22:00','14:25:00',3.05,244.00),(4,4,'2026-05-24','11:42:00','20:25:00',8.72,1046.00),(5,1,'2026-05-25','16:25:00','16:46:00',0.35,17.50),(7,7,'2026-05-23','16:26:00','16:29:00',0.05,3.75),(11,1,'2026-05-26','08:00:00','23:48:00',15.80,790.00),(12,2,'2026-05-27','08:00:00','17:00:00',9.00,720.00),(13,4,'2026-05-25','09:00:00','18:29:00',9.48,1138.00),(14,4,'2026-05-26','09:00:00','18:29:00',9.48,1138.00),(15,4,'2026-05-27','09:00:00','18:30:00',9.50,1140.00),(16,4,'2026-05-28','09:00:00','18:56:00',9.93,1192.00),(17,2,'2026-05-25','09:00:00','10:29:00',1.48,67.49),(19,7,'2026-05-25','18:56:00','10:29:00',-8.45,-270.40),(20,4,'2026-05-29','18:56:00','21:56:00',3.00,360.00),(21,4,'2026-05-30','21:46:00','23:46:00',2.00,240.00),(23,4,'2026-05-31','21:47:00','09:47:00',-12.00,-1440.00),(24,2,'2026-05-28','17:24:00','23:25:00',6.02,273.76);
UNLOCK TABLES;

-- Tabla: cotizaciones
DROP TABLE IF EXISTS `cotizaciones`;
CREATE TABLE `cotizaciones` (
  `id_cotizacion` int NOT NULL AUTO_INCREMENT,
  `cliente_id` int NOT NULL,
  `categoria_id` int NOT NULL,
  `descripcion` text,
  `largo` decimal(10,2) NOT NULL,
  `ancho` decimal(10,2) NOT NULL,
  `ganancia_porcentaje` decimal(5,2) NOT NULL,
  `detalles_adicionales` text,
  `total` decimal(10,2) NOT NULL,
  `total_pagado` decimal(10,2) DEFAULT '0.00',
  `estado_pago` enum('sin_pago','parcial','pagado') DEFAULT 'sin_pago',
  `estado` enum('pendiente','aprobada','rechazada') DEFAULT 'pendiente',
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cotizacion`),
  KEY `cliente_id` (`cliente_id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `cotizaciones_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id_cliente`),
  CONSTRAINT `cotizaciones_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `cotizaciones` WRITE;
INSERT INTO `cotizaciones` VALUES (5,2,2,'Puerta corredisa ',15.00,12.00,10.00,'Pintura negro basico ',3232.90,3232.90,'pagado','aprobada','2026-05-15 18:04:12'),(9,5,3,'Puerta con dise',43.00,130.00,43.00,'DFDFS',1561.59,1561.59,'pagado','aprobada','2026-05-17 08:39:10'),(10,3,5,'Tejado colorometrico',9.00,9.00,3.00,'fd',2685.20,2685.20,'pagado','aprobada','2026-05-26 12:05:43'),(11,14,7,'cortina blanca ',10.00,12.00,5.00,'',2065.73,0.00,'sin_pago','rechazada','2026-05-26 12:32:36'),(12,14,2,'Ventana Tipo Estandole',59.00,120.00,100.00,'ventana espesor pintura blanca ',1411.24,1411.24,'pagado','aprobada','2026-05-26 13:36:13'),(13,5,7,'CORTINA METALICA BLANCA ',50.00,120.00,20.00,'METALICA BLANCA ',3110.46,3110.46,'pagado','aprobada','2026-05-27 13:47:23'),(15,14,3,'ZAGUAN BASE NEGRA ',50.00,40.00,12.00,'NEGRO ESMALTE ',1160.46,1160.46,'pagado','aprobada','2026-05-28 22:56:56'),(16,16,10,'BARANDAL EN ESPIRAL ',100.00,120.00,5.00,'FORMA DE CARACOL ',315.00,0.00,'sin_pago','aprobada','2026-05-29 00:13:38'),(17,17,3,'PUERTA CHICA ',120.00,220.00,10.00,'CHICA COLOR CAFE ',3465.00,1700.00,'parcial','aprobada','2026-05-29 06:20:00');
UNLOCK TABLES;


-- ============================================================
-- 5️⃣ TABLAS OPERATIVAS SECUNDARIAS (NIVEL 4)
-- ============================================================

-- Tabla: trabajos
DROP TABLE IF EXISTS `trabajos`;
CREATE TABLE `trabajos` (
  `id_trabajo` int NOT NULL AUTO_INCREMENT,
  `cotizacion_id` int NOT NULL,
  `estado` enum('pendiente','en proceso','en_proceso','en_pausa','terminado','entregado') NOT NULL DEFAULT 'pendiente',
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  PRIMARY KEY (`id_trabajo`),
  KEY `cotizacion_id` (`cotizacion_id`),
  CONSTRAINT `trabajos_ibfk_1` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones` (`id_cotizacion`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `trabajos` WRITE;
INSERT INTO `trabajos` VALUES (1,5,'en proceso','2027-01-25','2026-02-25'),(2,9,'terminado','2926-04-02','0123-03-21'),(3,12,'terminado','2026-04-12','2026-05-12'),(4,10,'terminado','2026-05-28','2026-05-28'),(5,16,'en proceso','2026-05-28',NULL),(6,13,'en proceso','2026-05-28',NULL),(7,17,'pendiente','2026-05-29',NULL);
UNLOCK TABLES;

-- Tabla: pagos
DROP TABLE IF EXISTS `pagos`;
CREATE TABLE `pagos` (
  `id_pago` int NOT NULL AUTO_INCREMENT,
  `cotizacion_id` int NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `tipo_pago` enum('anticipo','parcial','finiquito') NOT NULL,
  `metodo_pago` enum('efectivo','transferencia','tarjeta') NOT NULL,
  `fecha_pago` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pago`),
  KEY `cotizacion_id` (`cotizacion_id`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones` (`id_cotizacion`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `pagos` WRITE;
INSERT INTO `pagos` VALUES (12,5,3232.90,'finiquito','efectivo','2026-05-15 18:04:36'),(14,9,1561.59,'finiquito','efectivo','2026-05-17 08:39:24'),(21,12,1411.24,'finiquito','efectivo','2026-05-26 13:36:34'),(22,10,1000.00,'anticipo','efectivo','2026-05-26 16:16:32'),(23,10,1000.00,'parcial','efectivo','2026-05-26 16:16:51'),(24,10,685.20,'finiquito','efectivo','2026-05-27 13:48:57'),(25,13,3000.00,'parcial','efectivo','2026-05-27 19:59:44'),(26,15,1.16,'finiquito','efectivo','2026-05-29 00:07:23'),(27,15,1159.30,'finiquito','efectivo','2026-05-29 00:08:05'),(28,13,50.00,'parcial','efectivo','2026-05-29 00:17:03'),(29,13,60.46,'finiquito','efectivo','2026-05-29 00:20:26'),(30,17,1500.00,'anticipo','efectivo','2026-05-29 06:20:23'),(31,17,200.00,'parcial','efectivo','2026-05-29 13:22:17');
UNLOCK TABLES;

-- Tabla: detalle_materiales_cotizacion
DROP TABLE IF EXISTS `detalle_materiales_cotizacion`;
CREATE TABLE `detalle_materiales_cotizacion` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `cotizacion_id` int NOT NULL,
  `material_id` int NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `cotizacion_id` (`cotizacion_id`),
  KEY `material_id` (`material_id`),
  CONSTRAINT `detalle_materiales_cotizacion_ibfk_1` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones` (`id_cotizacion`),
  CONSTRAINT `detalle_materiales_cotizacion_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `materiales` (`id_material`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `detalle_materiales_cotizacion` WRITE;
INSERT INTO `detalle_materiales_cotizacion` VALUES (5,5,1,5.00,190.00),(6,5,4,2.00,129.00),(7,5,5,2.00,368.00),(8,9,4,1.00,129.00),(9,9,5,1.00,365.73),(10,9,7,1.00,300.00),(11,9,6,3.00,255.62),(13,11,2,1.00,200.00),(14,11,5,1.00,365.73),(15,11,7,1.00,300.00),(16,11,7,4.00,300.00),(17,12,1,1.00,0.00),(18,12,2,1.00,200.00),(19,12,7,1.00,300.00),(20,12,6,2.00,255.62),(21,12,2,2.00,200.00),(22,13,6,1.00,255.62),(23,15,6,1.00,255.62);
UNLOCK TABLES;

-- Tabla: movimientos_inventario
DROP TABLE IF EXISTS `movimientos_inventario`;
CREATE TABLE `movimientos_inventario` (
  `id_movimiento` int NOT NULL AUTO_INCREMENT,
  `material_id` int NOT NULL,
  `tipo_movimiento` enum('entrada','salida') NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `descripcion` text,
  `cotizacion_id` int DEFAULT NULL,
  `fecha_movimiento` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_movimiento`),
  KEY `material_id` (`material_id`),
  KEY `cotizacion_id` (`cotizacion_id`),
  CONSTRAINT `movimientos_inventario_ibfk_1` FOREIGN KEY (`material_id`) REFERENCES `materiales` (`id_material`),
  CONSTRAINT `movimientos_inventario_ibfk_2` FOREIGN KEY (`cotizacion_id`) REFERENCES `cotizaciones` (`id_cotizacion`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `movimientos_inventario` WRITE;
INSERT INTO `movimientos_inventario` VALUES (9,1,'salida',5.00,'Aprobación cotización #5',5,'2026-05-15 18:04:12'),(10,4,'salida',2.00,'Aprobación cotización #5',5,'2026-05-15 18:04:12'),(11,5,'salida',2.00,'Aprobación cotización #5',5,'2026-05-15 18:04:12'),(12,4,'salida',1.00,'Aprobación cotización #9',9,'2026-05-17 08:39:10'),(13,5,'salida',1.00,'Aprobación cotización #9',9,'2026-05-17 08:39:10'),(14,7,'salida',1.00,'Aprobación cotización #9',9,'2026-05-17 08:39:10'),(15,6,'salida',3.00,'Aprobación cotización #9',9,'2026-05-17 08:39:10'),(17,1,'salida',1.00,'Aprobación cotización #10',10,'2026-05-26 16:15:45'),(18,4,'salida',1.00,'Aprobación cotización #13',13,'2026-05-27 14:37:45'),(19,7,'salida',4.00,'Aprobación cotización #13',13,'2026-05-27 14:37:45'),(20,7,'salida',1.00,'Aprobación cotización #13',13,'2026-05-27 14:37:45'),(21,1,'salida',3.00,'Aprobación cotización #13',13,'2026-05-27 14:37:45'),(22,5,'salida',2.00,'Aprobación cotización #13',13,'2026-05-27 14:37:45'),(25,5,'salida',2.00,'Aprobación cotización #15',15,'2026-05-28 22:57:18'),(26,4,'salida',1.00,'Aprobación cotización #15',15,'2026-05-28 22:57:18'),(27,7,'salida',1.00,'Aprobación cotización #15',15,'2026-05-28 22:57:18');
UNLOCK TABLES;


-- ============================================================
-- 6️⃣ TABLAS DE DETALLES CRUZADOS (NIVEL 5)
-- ============================================================

-- Tabla: catalogo_trabajos
DROP TABLE IF EXISTS `catalogo_trabajos`;
CREATE TABLE `catalogo_trabajos` (
  `id_catalogo` int NOT NULL AUTO_INCREMENT,
  `trabajo_id` int DEFAULT NULL,
  `titulo` varchar(100) NOT NULL,
  `fecha_subida` date NOT NULL,
  `imagen_url` varchar(255) NOT NULL,
  PRIMARY KEY (`id_catalogo`),
  KEY `trabajo_id` (`trabajo_id`),
  CONSTRAINT `catalogo_trabajos_ibfk_1` FOREIGN KEY (`trabajo_id`) REFERENCES `trabajos` (`id_trabajo`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `catalogo_trabajos` WRITE;
INSERT INTO `catalogo_trabajos` VALUES (1,1,'Puerta de herrería','2026-02-25','static/uploads/vta.jpg'),(2,NULL,'port','2026-05-28','static/uploads/vta.jpg'),(3,1,'Puerta de herrería','2026-02-25','static/uploads/logo_negocio.png'),(4,3,'Ventana Tipo Estandole','2026-05-11','static/uploads/vta.jpg'),(5,NULL,'Zaguan ','2024-08-18','static/uploads/zaguan.jpg'),(6,NULL,'BARANDAL CON FIGURAS','2025-02-10','static/uploads/barandal_.jpg');
UNLOCK TABLES;

-- Tabla: trabajo_empleados
DROP TABLE IF EXISTS `trabajo_empleados`;
CREATE TABLE `trabajo_empleados` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trabajo_id` int NOT NULL,
  `empleado_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `trabajo_id` (`trabajo_id`),
  KEY `empleado_id` (`empleado_id`),
  CONSTRAINT `trabajo_empleados_ibfk_1` FOREIGN KEY (`trabajo_id`) REFERENCES `trabajos` (`id_trabajo`),
  CONSTRAINT `trabajo_empleados_ibfk_2` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id_empleado`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `trabajo_empleados` WRITE;
INSERT INTO `trabajo_empleados` VALUES (1,1,1);
UNLOCK TABLES;


-- ============================================================
-- 7️⃣ VISTAS, RUTINAS Y TRIGGERS (AL FINAL DEL TODO)
-- ============================================================

-- Estructura de vistas temporales para evitar fallos de mapeo
DROP TABLE IF EXISTS `v_asistencia_semanal`;
DROP VIEW IF EXISTS `v_asistencia_semanal`;

DROP TABLE IF EXISTS `v_cotizaciones_resumen`;
DROP VIEW IF EXISTS `v_cotizaciones_resumen`;

-- Creación real de la Vista: v_cotizaciones_resumen
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_cotizaciones_resumen` AS select `co`.`id_cotizacion` AS `id_cotizacion`,concat(`cl`.`nombre`,' ',`cl`.`apellidoP`) AS `cliente`,`cl`.`telefono` AS `telefono`,`ca`.`nombre` AS `categoria`,`co`.`total` AS `total`,`co`.`total_pagado` AS `total_pagado`,(`co`.`total` - `co`.`total_pagado`) AS `saldo_pendiente`,`co`.`estado_pago` AS `estado_pago`,`co`.`estado` AS `estado`,`co`.`fecha` AS `fecha` from ((`cotizaciones` `co` join `clientes` `cl` on((`cl`.`id_cliente` = `co`.`cliente_id`))) join `categorias` `ca` on((`ca`.`id_categoria` = `co`.`categoria_id`))) */;

-- Volvemos a activar los candados de seguridad e integridad relacional
SET FOREIGN_KEY_CHECKS = 1;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;