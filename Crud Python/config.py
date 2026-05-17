# config.py
import pyodbc
print(pyodbc.drivers())

def get_connection():
    conn = pyodbc.connect(
        'DRIVER={MySQL ODBC 9.7 Unicode Driver};'
        'SERVER=127.0.0.1;'
        'PORT=3306;'
        'DATABASE=HerreriaCruz;'
        'USER=root;'
        'PASSWORD=1234567;'
        'OPTION=3;'
        'CHARSET=UTF8MB4;'
    )
    return conn