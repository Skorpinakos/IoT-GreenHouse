import json
import datetime
import os
import random
import shutil
import time,sys


random.seed(0)

def dt2datetime(dt):
    return dt[0:9].replace("_","-")+' '+dt[11:-1].replace("_",":")
def datetime2dt(dt):
    return str(dt).replace(":","_").replace(" ","_").replace("-","_")

#print(dt2datetime('2022_04_27_17_56_48'))
def make_measurement(dt,config_dict,moment):
    unix_time=moment
    #print(dt)
    
    #print(dt)
    path_rand_imgs='images/fake_images_for_data_creation'
    path_to="images/measurements/measurement_at_"+dt

    try:
        os.mkdir(path_to)
    except:
        pass

    json_dict={ "GREENHOUSE_ID": config_dict['id'],
                "TEMPERATURE": random.randint(120,350)/10,
                "HUMIDITY": random.randint(5,100)/100,
                "CO2": random.randint(200,400)/10,
                "SUNLIGHT": (random.randint(45,100)/100)*(int(dt.split("_")[-3]) in range(7,19)),
                "START_DATETIME":dt2datetime(dt),
                "measurements":[]
    }


    for row in range(config_dict['rows']):
        unix_time+=random.randint(10,20)
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
                    #print(dst)
                    shutil.copyfile(src,dst)
                    
                dt2=datetime.datetime.fromtimestamp(unix_time)
                date,time=str(dt2).split(" ")
                metrics=[date,time,random.randint(80,380)/10,random.randint(400,3000),random.randint(60,100)/100]
                json_dict['measurements'].append(metrics)
    with open("images/measurements/last_measurement.txt",'w',encoding='utf-8') as file:
        file.write(path_to.replace("images/measurements/",''))
    #print(json_dict)
    json_object= json.dumps(json_dict,indent=4)
    with open("{}/data.json".format(path_to), "w") as outfile:
        outfile.write(json_object)




    
f = open('greenhouse_config.json')
config_dict = json.load(f)
#print(config_dict["rows"])

def make_multiple_fakes(config_dict):
    start_of_dates_unix=1617868428
    end_of_dates_unix=1671838016
    freq=15*604800 #(3*week)
    moment=start_of_dates_unix
    while (moment<end_of_dates_unix):
        dt = datetime.datetime.fromtimestamp(moment)
        dt= datetime2dt(dt)
        make_measurement(dt,config_dict,moment)
        moment=moment+freq+random.randint(-freq/2,+freq/2)


  
f = open('greenhouse_config.json')
config_dict = json.load(f)
#print(config_dict["rows"])
#dt = datetime.datetime.fromtimestamp(1617868428)
#dt= datetime2dt(dt)
#make_measurement(dt,config_dict,1617868428)
#make_multiple_fakes(config_dict)

dt=sys.argv[1]
time.sleep(5)
datetime_object = datetime.datetime.strptime(dt, "%Y_%m_%d_%H_%M_%S")
unix_time=int(time.mktime(datetime_object.timetuple()))
print("hi, i am making a fake measurement for datetime: ",dt)
make_measurement(dt,config_dict,unix_time)