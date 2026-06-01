# config.py
import pyodbc
print(pyodbc.drivers())

def get_connection():
    conn = pyodbc.connect(
        'DRIVER={MySQL ODBC 8.0 Driver};'  # Driver estándar compatible con Docker Linux
        'SERVER=db-server;'                 # Nombre del servicio en tu docker-compose
        'PORT=3306;'
        'DATABASE=herreriacruz;'            # Minúsculas exactas como en tu init.sql
        'USER=root;'
        'PASSWORD=1234567;'                 # Asegúrate de usar esta misma contraseña en el docker-compose
        'OPTION=3;'
        'CHARSET=UTF8MB4;'
    )
    return conn