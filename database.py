import sqlite3
import pathlib
import os
import json

py_path = pathlib.Path(__file__).parent.resolve()

class Database():
    def initial():
        con = sqlite3.connect(os.path.join(py_path, "database.db"))
        cur = con.cursor()

        sql = "SELECT name FROM sqlite_master WHERE type='table' AND name= (?)"

        listOfTables = cur.execute(sql, ("data",)).fetchall()
        if listOfTables == []:
            print("Table not found!")
            tabledate = '''
            CREATE TABLE "data" (
                host TEXT PRIMARY KEY,
                host_name TEXT,
                mac_address TEXT,
                mac_vendor TEXT,
                os_name TEXT,
                os_accuracy TEXT,
                os_cpe TEXT,
                port_open INT,
                port_closed INT,
                port_filtered INT,
                date TEXT
            );
            '''
            # print(tabledate)
            cur.execute(tabledate)
            con.close()
        else:
            pass

    def data():
        con = sqlite3.connect(os.path.join(py_path, "database.db"))
        cur = con.cursor()
        sql = "SELECT * FROM data ORDER BY host;"

        cur.execute(sql)


        filter = [
            {
                row[0]: {
                    "date": row[10],
                    "host_name": row[1],
                    "mac_address": row[2],
                    "mac_vendor": row[3],
                    "os_accuracy": row[5],
                    "os_cpe": row[6],
                    "os_name": row[4],
                    "port_closed": json.loads(row[8]) if row[8] else [],
                    "port_filtered": json.loads(row[9]) if row[9] else [],
                    "port_open": json.loads(row[7]) if row[7] else []
                }
            }
            for row in cur.fetchall()
            
        ]
        con.close()

        return filter
    
    def save(host, host_name, mac, vendor, os_name, accuracy, cpe,  p_open, p_closed, p_filtered, now):
        con = sqlite3.connect(os.path.join(py_path, "database.db"))
        cur = con.cursor()
        try:
            sql ='''
            REPLACE INTO "data"
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
            '''

            p_open_str = json.dumps(p_open)
            p_closed_str = json.dumps(p_closed)
            p_filtered_str = json.dumps(p_filtered)

            values = [
            host,
            host_name,
            mac, 
            vendor, 
            os_name, 
            accuracy, 
            cpe, 
            p_open_str,
            p_closed_str,
            p_filtered_str,
            now
            ]
            # print("values: ",values)

        except Exception as e:
            print(f"""database Error: {e}""")
            pass

        cur.execute(sql, values)
        con.commit()
        con.close()