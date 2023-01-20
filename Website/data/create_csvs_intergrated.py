import pandas as pd
import csv
import glob
import random
import shutil
from faker import Faker
from unidecode import unidecode
import os
import string


def create_all():
    # path = str(pathlib.Path(__file__).parent.resolve())+'\\images\\'
    fake = Faker('el_GR')

    entities_properties = {

        'CLIENT': {"ID": ['integer', True], "FIRSTNAME": ['string', False], "LASTNAME": ['string', False], "USERNAME": ['string', False, True], "PASSWORD": ['string', False], "BIRTH_DATE": ['date', False],
                   "JOIN_DATE": ['date', False]},

        'GREENHOUSE': {"ID": ['integer', True], "IP": ['string', False, True], "COORDS_X": ['float', False], "COORDS_Y": ['float', False], "ROWS": ['integer', False], "COLUMNS": ['integer', False], "WIDTH": ['float', False],
                       "HEIGHT": ['float', False], "LENGTH": ['float', False], "GREENHOUSE_PHOTO": ['string', False], "CLIENT_ID": ['integer', False, 'CLIENT', 'ID']},

        'GREENHOUSE_MEASUREMENT': {"ID": ['integer', True], "MEASUREMENT_DATE": ['date', False], "MEASUREMENT_TIME": ['time', False], "TEMPERATURE": ['float', False],
                                   "SUNLIGHT": ['float', False], "HUMIDITY": ['float', False], "CO2": ['float', False],
                                   "GREENHOUSE_ID": ['integer', False, 'GREENHOUSE', 'ID']},

        'PLANT': {"ID": ['integer', True], "TYPE": ['string', False], "COLUMN": ['integer', False], "ROW": ['integer', False],
                  "LIFESPAN": ['integer', False], "GREENHOUSE_ID": ['integer', False, 'GREENHOUSE', 'ID']},

        'PLANT_MEASUREMENT': {"ID": ['integer', True], "PLANT_ID": ['integer', False, 'PLANT', 'ID'], "MEASUREMENT_DATE": ['date', False], "MEASUREMENT_TIME": ['time', False], "SIZE": ['float', False],
                              "GROWTH": ['float', False], "HEALTH": ['float', False], "LEAF_DENSITY": ['float', False], "MEASUREMENT_PHOTO": ['string', False]},
    }

    def get_random_string(self, letters_count, digits_count=0):
        letters = ''.join((random.choice(string.ascii_letters)
                           for i in range(letters_count)))
        digits = ''.join((random.choice(string.digits)
                          for i in range(digits_count)))

        # Convert resultant string to list and shuffle it to mix letters and digits
        sample_list = list(letters + digits)
        random.shuffle(sample_list)
        # convert list to string
        final_string = ''.join(sample_list)
        return final_string

    def get_relevant(entity, attribute):
        df = pd.read_csv("data\\temp\\{}.csv".format(entity))
        saved_column = df[attribute]
        return list(saved_column)

    def loadNonForeign(entity, attribute):
        type = entities_properties[entity][attribute][0]
        if type == 'text':
            type = 'str'
        elif type == 'integer':
            type = 'int'
        df = pd.read_csv(
            "data\\temp\\{}.csv".format(entity), dtype={attribute: type})
        return list(df[attribute])

    def make_without_foreign(leksiko, entity):
        primaryKey = 1
        entity_diction = leksiko[entity]
        list_of_dicts = []
        primaries = []
        if entity == 'CLIENT':
            end = random.randint(30, 50)
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
                        elif attribute == 'USERNAME':
                            temp_dict[attribute] = sname + \
                                fname + str(random.randint(0, 1000))
                        elif attribute == 'PASSWORD':
                            # temp_dict[attribute] = get_random_string(
                            #     random.randint(4, 8), random.randint(2, 4))
                            # The hash of 1234
                            temp_dict[attribute] = '$2b$10$myWMjyceztjvnyGPdVppfuFjs7NJysEjFdTydvKYUI.KEmpPm.aoa'
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
        with open('data\\temp\\{}.csv'.format(entity), 'w', encoding='utf8') as csvfile:
            writer = csv.DictWriter(
                csvfile, fieldnames=entity_diction.keys())
            writer.writeheader()
            writer.writerows(list_of_dicts)
        return primaries

    def make_with_foreign(leksiko, entity):
        avg_size = 0.3
        primaryKey = 1
        entity_diction = leksiko[entity]
        list_of_dicts = []
        primaries = []
        if entity == 'GREENHOUSE':
            greenhouse_paths = glob.glob("public\\images\\House\\*")
            print(greenhouse_paths)
        end = random.randint(100, 200)
        ip_localhost = 3000 - 12
        for i in range(1, end):
            ip_localhost += 1
            temp_dict = {}
            for attribute in entity_diction.keys():
                typos = entity_diction[attribute][0]
                primary = entity_diction[attribute][1]
                name = attribute
                if len(entity_diction[attribute]) < 4:
                    if primary == True:
                        while True:
                            temp = primaryKey
                            primaryKey += 1
                            if temp not in primaries:
                                temp_dict[name] = temp
                                primaries.append(temp)
                                break
                    else:
                        if typos == 'integer':
                            if name == 'ROWS':
                                temp_dict[name] = 6
                            elif name == 'COLUMNS':
                                temp_dict[name] = 12
                        if typos == 'string':
                            if name == 'MEASUREMENT_PHOTO':
                                temp_dict[name] = 'null'

                            elif name == 'IP':
                                # temp_dict[name] = fake.ipv4_public()
                                temp_dict[name] = 'localhost:' + \
                                    str(ip_localhost)
                            elif name == 'GREENHOUSE_PHOTO':
                                temp_dict[name] = str(
                                    temp_dict['ID']) + '.jpg'
                                image_path = random.choice(greenhouse_paths)
                                cwd = os.path.abspath(os.getcwd())
                                shutil.copyfile(
                                    cwd + '\\' + image_path, cwd + "\\public\\images\\greenhouses\\" +
                                    str(temp_dict['ID']) + '.jpg')
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
                            elif name == 'LEAF_DENSITY':
                                temp_dict[name] = round(
                                    random.uniform(10.0, 100.0), 2)
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
        with open("data\\temp\\{}.csv".format(entity), 'w', encoding='utf8') as csvfile:
            writer = csv.DictWriter(
                csvfile, fieldnames=entity_diction.keys())
            writer.writeheader()
            writer.writerows(list_of_dicts)

        return primaries

    def make_plant(leksiko):
        type_info = {'Lettuce': 12}
        primaryKey = 1
        entity_diction = leksiko['PLANT']
        list_of_dicts = []
        primaries = []
        greenhouses = loadNonForeign('GREENHOUSE', 'ID')
        rows = loadNonForeign('GREENHOUSE', 'ROWS')
        columns = loadNonForeign('GREENHOUSE', 'COLUMNS')
        for i in range(len(greenhouses)):
            greenhouse = greenhouses.pop()
            r = rows.pop()
            c = columns.pop()
            for j in range(r):
                for k in range(c):
                    temp_dict = {}
                    for attribute in entity_diction.keys():
                        typos = entity_diction[attribute][0]
                        primary = entity_diction[attribute][1]
                        name = attribute
                        if len(entity_diction[attribute]) < 4:
                            if primary == False:
                                if typos == 'integer':
                                    if name == 'COLUMN':
                                        temp_dict[name] = k
                                    elif name == 'ROW':
                                        temp_dict[name] = j
                                    elif name == 'LIFESPAN':
                                        temp_dict[name] = type_info[type]
                                if typos == 'string':
                                    if name == 'TYPE':
                                        type = random.choice(
                                            list(type_info.keys()))
                                        temp_dict[name] = type

                            else:
                                while True:
                                    temp = primaryKey
                                    primaryKey += 1
                                    if temp not in primaries:
                                        temp_dict[name] = temp
                                        primaries.append(temp)
                                        break
                        elif attribute == 'GREENHOUSE_ID':
                            temp_dict[name] = greenhouse

                    list_of_dicts.append(temp_dict)
        with open("data\\temp\\{}.csv".format('PLANT'), 'w', encoding='utf8') as csvfile:
            writer = csv.DictWriter(
                csvfile, fieldnames=entity_diction.keys())
            writer.writeheader()
            writer.writerows(list_of_dicts)

        return primaries

    make_without_foreign(entities_properties, 'CLIENT')
    make_with_foreign(entities_properties, 'GREENHOUSE')
    make_with_foreign(entities_properties, 'GREENHOUSE_MEASUREMENT')
    make_plant(entities_properties)
    make_with_foreign(entities_properties, 'PLANT_MEASUREMENT')
    return
