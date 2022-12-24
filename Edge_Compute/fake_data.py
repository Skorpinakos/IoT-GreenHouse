import json
import datetime
import os
import random
import shutil
random.seed(0)

def make_measurement(dt,config_dict):
    #print(dt)
    dt=str(dt).replace(":","_").replace(" ","_").replace("-","_")
    print(dt)
    path_rand_imgs='images/fake_images_for_data_creation'
    path_to="images/measurements/measurement_at_"+dt
    try:
        os.mkdir(path_to)
    except:
        pass
    for row in range(config_dict['rows']):
        for column in range(config_dict['columns']):
                try:
                    os.mkdir(path_to+"/plant_images_of_x{}_y{}".format(column,row))
                except Exception as e:
                    #print(e)
                    pass
                for i in range(random.randint(1,5)):
                    image_to_copy_name=random.choice(os.listdir(path_rand_imgs))
                    src=path_rand_imgs+'/'+image_to_copy_name
                    try:
                        dst=path_to+"/plant_images_of_x{}_y{}/{}.png".format(column,row,i)
                    except:
                        pass
                    print(dst)
                    shutil.copyfile(src,dst)
                with open("images/measurements/last_measurement.txt",'w',encoding='utf-8') as file:
                    file.write(path_to.replace("images/measurements/",''))



    
f = open('greenhouse_config.json')
config_dict = json.load(f)
#print(config_dict["rows"])


start_of_dates_unix=1617868428
end_of_dates_unix=1671838016
freq=15*604800 #(3*week)
moment=start_of_dates_unix
while (moment<end_of_dates_unix):
    dt = datetime.datetime.fromtimestamp(moment)
    make_measurement(dt,config_dict)
    moment=moment+freq+random.randint(-freq/2,+freq/2)
    