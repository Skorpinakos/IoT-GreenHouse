import tkinter as tk
from tkinter import messagebox
from tkinter import ttk
import datas as datas
import create_csvs_intergrated as csv_maker


entities_properties = {

    'CLIENT': {"ID": ['integer', True], "FIRSTNAME": ['string', False], "LASTNAME": ['string', False], "EMAIL": ['string', False], "USERNAME": ['string', False, True], "PASSWORD": ['string', False], "BIRTH_DATE": ['date', False],
               "JOIN_DATE": ['date', False]},

    'GREENHOUSE': {"ID": ['integer', True], "IP": ['string', False], "COORDS_X": ['float', False], "COORDS_Y": ['float', False], "ROWS": ['integer', False], "COLUMNS": ['integer', False], "WIDTH": ['float', False],
                   "HEIGHT": ['float', False], "LENGTH": ['float', False], "GREENHOUSE_PHOTO": ['string', False], "CLIENT_ID": ['integer', False, 'CLIENT', 'ID']},

    'GREENHOUSE_MEASUREMENT': {"ID": ['integer', True], "MEASUREMENT_DATE": ['date', False], "MEASUREMENT_TIME": ['time', False], "TEMPERATURE": ['float', False],
                               "SUNLIGHT": ['float', False], "HUMIDITY": ['float', False], "CO2": ['float', False],
                               "GREENHOUSE_ID": ['integer', False, 'GREENHOUSE', 'ID']},

    'PLANT': {"ID": ['integer', True], "TYPE": ['string', False], "COLUMN": ['integer', False], "ROW": ['integer', False],
              "LIFESPAN": ['integer', False], "GREENHOUSE_ID": ['integer', False, 'GREENHOUSE', 'ID']},

    'PLANT_MEASUREMENT': {"ID": ['integer', True], "PLANT_ID": ['integer', False, 'PLANT', 'ID'], "MEASUREMENT_DATE": ['date', False], "MEASUREMENT_TIME": ['time', False], "SIZE": ['float', False],
                          "GROWTH": ['float', False], "HEALTH": ['float', False], "LEAF_DENSITY": ['float', False], "MEASUREMENT_PHOTO": ['string', False]},
}
# make a programm to scan the database and fill the dictionary based on the entities on the database

try:
    with open("data/Our_App.db") as f:
        print('database exists')

except IOError:
    print('database doesnt exist')
    print('creating with test data ...')
    inp = input(" do you want to fabricate test data?\n y/n:")
    if inp == 'y':
        csv_maker.create_all()
    else:
        for i in list(entities_properties.keys()):
            f = open('{}.csv'.format(i), 'w')
            f.close()

d = datas.DataModel('data/Our_App', entities_properties)
d.close()
###################
