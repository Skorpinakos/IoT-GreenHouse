import pandas as pd
import csv
import string
import random
import pathlib
from faker import Faker
from unidecode import unidecode
import datetime


def create_all():
    # path = str(pathlib.Path(__file__).parent.resolve())+'\\images\\'
    fake = Faker('el_GR')

    entities_properties = {

        'CLIENT': {"ID": ['integer', True], "FIRSTNAME": ['string', False], "LASTNAME": ['string', False], "BIRTH_DATE": ['date', False],
                   "JOIN_DATE": ['date', False]},

        'GREENHOUSE': {"ID": ['integer', True], "COORDS_X": ['float', False], "COORDS_Y": ['float', False], "WIDTH": ['float', False],
                       "HEIGHT": ['float', False], "LENGTH": ['float', False], "GREENHOUSE_PHOTO": ['string', False], "CLIEND_ID": ['integer', False, 'CLIENT', 'ID']},

        'GREENHOUSE_MEASUREMENT': {"ID": ['integer', True], "MEASUREMENT_DATE": ['date', False], "MEASUREMENT_TIME": ['time', False], "TEMPERATURE": ['float', False],
                                   "SUNLIGHT": ['float', False], "HUMIDITY": ['float', False], "SOIL_PH": ['float', False], "CO2": ['float', False],
                                   "GREENHOUSE_ID": ['integer', False, 'GREENHOUSE', 'ID']},

        'PLANT': {"ID": ['integer', True], "TYPE": ['string', False], "LINE": ['integer', False], "ROW": ['integer', False],
                  "LIFESPAN": ['integer', False], "GREENHOUSE_ID": ['integer', False, 'GREENHOUSE', 'ID']},

        'PLANT_MEASUREMENT': {"ID": ['integer', True], "PLANT_ID": ['integer', False, 'PLANT', 'ID'], "MEASUREMENT_DATE": ['date', False], "MEASUREMENT_TIME": ['time', False], "SIZE": ['float', False],
                              "GROWTH": ['float', False], "HEALTH": ['float', False], "MEASUREMENT_PHOTO": ['string', False]},
    }

    def get_relevant(entity, attribute):
        df = pd.read_csv("{}.csv".format(entity))
        saved_column = df[attribute]
        return list(saved_column)

    def make_without_foreign(leksiko, entity):
        primaryKey = 1
        entity_diction = leksiko[entity]
        list_of_dicts = []
        primaries = []
        end = random.randint(60, 90)
        for i in range(1, end):
            temp_dict = {}
            for attribute in entity_diction.keys():
                typos = entity_diction[attribute][0]
                primary = entity_diction[attribute][1]
                name = attribute
                if primary == False:
                    if typos == 'string':
                        if attribute == 'FIRSTNAME':
                            if i % 2:
                                fname = unidecode(fake.first_name_male())
                            else:
                                fname = unidecode(fake.first_name_female())
                            temp_dict[attribute] = fname
                        elif attribute == 'LASTNAME':
                            if i % 2:
                                sname = unidecode(fake.last_name_male())
                            else:
                                sname = unidecode(fake.last_name_female())
                            temp_dict[attribute] = unidecode(sname)
                    elif typos == 'date':
                        if attribute == 'BIRTH_DATE':
                            temp_dict[name] = fake.date_of_birth(
                                minimum_age=18, maximum_age=100)
                        elif attribute == 'JOIN_DATE':
                            temp_dict[name] = fake.date_between(
                                start_date='-15y')

                    else:
                        print('error   ', typos, entity)

                if primary == True:
                    while True:
                        temp = primaryKey
                        primaryKey += 1
                        if temp not in primaries:
                            temp_dict[name] = temp
                            primaries.append(temp)
                            break
            list_of_dicts.append(temp_dict)
        with open('{}.csv'.format(entity), 'w', encoding='utf8') as csvfile:
            writer = csv.DictWriter(
                csvfile, fieldnames=entity_diction.keys())
            writer.writeheader()
            writer.writerows(list_of_dicts)
        return primaries

    def make_with_foreign(leksiko, entity, primars):
        type_info = {'Lettuce': 12}
        avg_size = 0.3
        primaryKey = 1
        entity_diction = leksiko[entity]
        list_of_dicts = []
        primaries = []
        end = random.randint(100, 200)

        for i in range(1, end):
            temp_dict = {}
            for attribute in entity_diction.keys():
                typos = entity_diction[attribute][0]
                primary = entity_diction[attribute][1]
                name = attribute
                if len(entity_diction[attribute]) < 4:
                    if primary == False:
                        if typos == 'integer':
                            if name == 'LINE':
                                temp_dict[name] = random.randint(5, 15)
                            if name == 'ROW':
                                temp_dict[name] = random.randint(5, 10)
                            elif name == 'LIFESPAN':
                                temp_dict[name] = type_info[type]
                        if typos == 'string':
                            if name == 'TYPE':
                                type = random.choice(
                                    list(type_info.keys()))
                                temp_dict[name] = type
                            elif name == 'MEASUREMENT_PHOTO' or name == 'GREENHOUSE_PHOTO':
                                temp_dict[name] = str(temp_dict['ID']) + '.jpg'
                        elif typos == 'float':
                            if name == 'COORDS_X':
                                temp_dict[name] = random.uniform(200, 700)
                            elif name == 'COORDS_Y':
                                temp_dict[name] = random.uniform(100, 500)
                            elif name == 'HEIGHT':
                                temp_dict[name] = round(
                                    random.uniform(1.5, 2.5), 2)
                            elif name == 'LENGTH':
                                temp_dict[name] = round(
                                    random.uniform(2.0, 2.0), 2)
                            elif name == 'WIDTH':
                                temp_dict[name] = round(
                                    random.uniform(2.0, 8.0), 2)
                            elif name == 'TEMPERATURE':
                                temp_dict[name] = round(
                                    random.uniform(0.0, 45.0), 2)
                            elif name == 'SUNLIGHT':
                                temp_dict[name] = round(
                                    random.uniform(60.0, 120.0), 2)
                            elif name == 'HUMIDITY':
                                temp_dict[name] = round(random.random(), 2)
                            elif name == 'SOIL_PH':
                                temp_dict[name] = round(
                                    random.uniform(5.0, 10.0), 2)
                            elif name == 'CO2':
                                temp_dict[name] = round(
                                    random.uniform(300.0, 1000.0), 2)
                            elif name == 'SIZE':
                                temp_dict[name] = round(
                                    random.uniform(0.05, 0.4), 2)
                            elif name == 'HEALTH':
                                temp_dict[name] = round(random.random(), 2)
                            elif name == 'GROWTH':
                                growth = temp_dict['SIZE'] / avg_size
                                temp_dict[name] = round(growth, 2)

                        elif typos == 'date':
                            if attribute == 'MEASUREMENT_DATE':
                                temp_dict[name] = fake.date_between(
                                    start_date='-15y')
                        elif typos == 'time':
                            if attribute == 'MEASUREMENT_TIME':
                                temp_dict[name] = fake.time()

                    else:
                        while True:
                            temp = primaryKey
                            primaryKey += 1
                            if temp not in primaries:
                                temp_dict[name] = temp
                                primaries.append(temp)
                                break
                elif len(entity_diction[attribute]) == 4:
                    if primary == True:
                        while True:
                            temp = random.choice(get_relevant(
                                entity_diction[attribute][2], entity_diction[attribute][3]))
                            if temp not in primaries:
                                temp_dict[name] = temp
                                primaries.append(temp)
                                break
                    else:
                        temp_dict[name] = random.choice(get_relevant(
                            entity_diction[attribute][2], entity_diction[attribute][3]))

            list_of_dicts.append(temp_dict)
        with open("{}.csv".format(entity), 'w', encoding='utf8') as csvfile:
            writer = csv.DictWriter(
                csvfile, fieldnames=entity_diction.keys())
            writer.writeheader()
            writer.writerows(list_of_dicts)

        return primaries

    prims = {}

    prims['CLIENT'] = make_without_foreign(entities_properties, 'CLIENT')
    prims['GREENHOUSE'] = make_with_foreign(
        entities_properties, 'GREENHOUSE', prims)
    prims['GREENHOUSE_MEASUREMENT'] = make_with_foreign(
        entities_properties, 'GREENHOUSE_MEASUREMENT', prims)
    prims['PLANT'] = make_with_foreign(
        entities_properties, 'PLANT', prims)
    prims['PLANT_MEASUREMENT'] = make_with_foreign(
        entities_properties, 'PLANT_MEASUREMENT', prims)
    return
