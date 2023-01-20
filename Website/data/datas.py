import sqlite3
import time
import csv
from os import path, remove


class DataModel():
    def __init__(self, fname, dbDict):
        try:
            self.dbfilename = fname + ".db"
            self.sqlfilename = fname + ".sql"
            self.dbDict = dbDict

            # Ckeck if the .db file exists, if not create the database before connecting to it.
            if not path.exists(self.dbfilename):
                print("The database does not exist.")
                self.create(self.dbfilename, dbDict)
                self.connect(self.dbfilename)
            else:
                self.connect(self.dbfilename)

            self.SQLversion()

            print("Initialization Succeded")

        except:
            print("Initialization Failed")

    # Connect to the database and create a new cursor object.
    def connect(self, filename):
        try:
            print("Connecting to the database...")
            self.con = sqlite3.connect(filename)
            self.con.row_factory = sqlite3.Row
            self.cursor = self.con.cursor()
            print("Successfuly connected to the database", filename)
            return True
        except sqlite3.Error as error:
            print("Failed to connect to the database", error)
            return False

    # Create the database using function self.upload and the dictionary describing the schema.
    def create(self, filename, dbDict):
        try:
            print("Creating the database...")
            self.con = sqlite3.connect(filename)
            self.con.row_factory = sqlite3.Row
            self.cursor = self.con.cursor()
            self.dbDict = dbDict
            self.upload(dbDict)
            print("Successfully created database", filename)
            return True

        except sqlite3.Error as error:
            print("Failed to create the database", error)
            return False

    def close(self):
        try:
            self.con.commit()
            self.con.close()
            return True
        except:
            print("Failed to close the database")
            return False

    def SQLversion(self):
        try:
            sqlite_select_Query = "SELECT sqlite_version();\n"
            version = self.executeSQL(sqlite_select_Query)
            print("SQLite Database Version is: ", version)
            return True
        except:
            print("Failed to retrun the SQL version")
            return False

    def executeSQL(self, strQuery, values=None, show=False, txtFile=None):
        try:

            if txtFile == None:
                query = strQuery
            else:
                with open(txtFile, "r", encoding='utf8') as txt:
                    query = txt.read()

            for subquery in query.split(";"):
                if subquery.strip():
                    t1 = time.perf_counter()
                    if values == None:
                        self.cursor.execute(subquery)
                    else:
                        self.cursor.execute(subquery, values)
                    sql_time = time.perf_counter() - t1
                    print(
                        f'Executing querie {subquery[:50]}... finished in {sql_time:.5f} sec')

            self.con.commit()

            result = []
            for row in self.cursor.fetchall():
                element = []
                for item in row:
                    element.append(str(item))
                result.append(element)
                if show:
                    print(element)
            return result

        except sqlite3.Error as error:
            print(f"Failed to execute SQL querie \n {query}", error)
            return False

    def values(self, val, ins=0, table=None):
        try:
            vlist = []
            for f in val.keys():
                v = val[f]
                if v == '':
                    v = ' '
                if v[0] == '=':
                    v = v[1:]
                if ';' in v:
                    print("Possible SQL injection attemt detected")
                v = v.split(' & ')
                vlist += v
            return vlist
        except:
            print(
                f"Failed to create a list for the values\n {val}")
            return False

    def conditions(self, cond, sep, table, upd=0):
        try:
            condstr = ''
            for f in cond.keys():
                c = cond[f]
                c = c.split('&')
                type = self.dbDict[table][f][0]

                if len(c) > 1:
                    if type == 'date' and not upd:
                        condstr += f'(julianday({f}) {c[0][0]} julianday(?) and julianday({f}) {c[1][0]} julianday(?))'
                    else:
                        condstr += f'({f} {c[0][0]} ? and {f} {c[1][0]} ?)'
                    cond[f] = f'{c[0][1:]} & {c[1][1:]}'

                else:
                    if type == 'date' and not upd:
                        condstr += f'(julianday({f}) {c[0][0]} julianday(?))'
                    else:
                        condstr += f"{f} {c[0][0]} ?"
                    cond[f] = cond[f][1:]

                if list(cond.keys()).index(f) < len(list(cond.keys())) - 1:
                    condstr += sep

            return condstr

        except:
            print(
                f"Failed to create a unified string for the conditions\n {cond}")
            return False

    def search(self, table, conditions):
        try:
            query = f"\nSELECT *\nFROM {table}\n"
            if conditions != None:
                condstr = self.conditions(conditions, ' and ', table=table)
                query += f"""WHERE ({condstr});\n"""
                values = self.values(conditions)
                filtered = self.executeSQL(query, values=values)
            else:
                filtered = self.executeSQL(query)

            return filtered

        except:
            print(
                f"Failed to filter {table} using conditions {conditions}")
            return False

    def insertRow(self, table, val):
        try:

            values = self.values(val, ins=1, table=table)
            strQuery = f"""INSERT INTO {table} ({",".join(val.keys())}) VALUES (?{(len(val)-1) * ", ?"});\n"""
            self.executeSQL(strQuery, values=values)
            return True
        except:
            print(f"Failed to insert values {values} to table {table}")
            return False

    def deleteRow(self, table, conditions):
        try:
            condstr = self.conditions(conditions, ' and ', table=table)
            values = self.values(conditions)
            query = f"""DELETE FROM {table} WHERE ({condstr});\n"""
            self.executeSQL(query, values=values)
            return True
        except:
            print(
                f"Failed to delete the row from table {table}")
            return False

    def updateRow(self, table, conditions, new):
        try:
            condstr = self.conditions(conditions, ' and ', table=table)
            condval = self.values(conditions)
            newstr = self.conditions(new, ', ', table=table, upd=1)
            newval = self.values(new, table=table, ins=1)
            values = newval + condval
            query = f"UPDATE {table} SET {newstr} WHERE ({condstr});\n"
            self.executeSQL(query, values)
            return True
        except:
            print(
                f"Failed to update the rows that have {condstr} from table {table} with value(s) {newstr}")
            return False

    def createTable(self, tableName, tableDict):
        try:
            foreign_keys = []
            uniques = []
            query = f"CREATE TABLE {tableName} (\n"
            for a in tableDict.keys():
                query += f"{a} {tableDict[a][0]}"
                if tableDict[a][1]:
                    query += ' PRIMARY KEY'
                if len(tableDict[a]) > 3:
                    foreign_keys.append(a)
                elif len(tableDict[a]) == 3:
                    uniques.append(a)
                if (list(tableDict.keys()).index(a) < len(list(tableDict.keys())) - 1):
                    query += ",\n"
                else:
                    if len(foreign_keys) == 0 and len(uniques) == 0:
                        query += "\n);\n"
                    else:
                        query += ",\n"

            if len(uniques) != 0:
                for u in uniques:
                    query += f'CONSTRAINT KEEP_UNIQUE UNIQUE ({u})'

                    if (uniques.index(u) < len(uniques) - 1):
                        query += ",\n"
                if len(foreign_keys) == 0:
                    query += "\n);\n"
                else:
                    query += ",\n"

            if len(foreign_keys) != 0:
                for fk in foreign_keys:
                    query += f'CONSTRAINT INFORM FOREIGN KEY({fk}) REFERENCES {tableDict[fk][2]}({tableDict[fk][3]}) ON DELETE CASCADE ON UPDATE CASCADE'

                    if (foreign_keys.index(fk) < len(foreign_keys) - 1):
                        query += ",\n"

                query += "\n);\n"
            return query

        except:
            print(f"Failed to create table {tableName}")
            return False

    def loadTable(self, tableName, tableDict):
        try:
            csvFile = 'data\\temp\\{}'.format(tableName) + '.csv'
            query = self.createTable(tableName, tableDict)
            with open(csvFile, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f, delimiter=",", quotechar='"')
                self.executeSQL(query)
                for row in reader:
                    self.insertRow(tableName, row)
            #remove(csvFile)
            return True
        except:
            print(f"Failed to load table {tableName}")
            return False

    def upload(self, dbDict):
        try:
            self.executeSQL('PRAGMA foreign_keys = ON;\n')
            for table in dbDict.keys():
                self.loadTable(table, dbDict[table])
            return True
        except:
            print(f"Failed to upload table the database with dbDict {dbDict}")
            return False
