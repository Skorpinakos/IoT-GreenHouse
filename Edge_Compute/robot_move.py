try:
    from prototype_for_plant_finder import process_image #process_image takes the path where take_photo stores and the current photo filaname and returns
    # a list of th y dimension pixel height where lines occur and also centers_x and centers_y which are the x,y coordinates for each plant
    from simulation import Simulation
    from mapper import figure_out_position
    from image_utils import save_center
    import sys
    import os
    from datetime import datetime
    import json
    from fake_data import make_measurement, dt2datetime
    import time
except:
    print("Either Edge AI misses important packets/bad Python Version (check project requirements and dependencies for edge controller's Python installation at 'https://github.com/Skorpinakos/IoT-2022') or controller.mjs was not run in correct sub-directory: Edge_Compute")
    exit(1)






#dt=sys.argv[1]

def datetime2dt(dt):
    return (str(dt).replace(":","_").replace(" ","_").replace("-","_")).split(".")[0]
dt=datetime2dt(datetime.now())

print("starting at: ",dt)
#exit()

date_time_for_unix = datetime(*list(map(int,dt.split("_"))))
#print(date_time_for_unix)
unix_time=int(time.mktime(date_time_for_unix.timetuple()))
#print(unix_time)
sim=Simulation(view="images/Capture6.png",camera_dimensions=[589,310])
path="images/"
out_path="diagnostics/"

path_to="images/measurements/measurement_at_"+dt

try:
    os.mkdir(path_to)
except:
    print("couldn't make dir, breaking...")
    exit()

default_distance=30
#first shoot
start=0
end=0
dx=default_distance
lines_multitude=[0]
step=0
f = open('greenhouse_config.json')
greenhouse_config=json.load(f)


while True:

    step=step+1
    print("STARTING STEP:",step)
    
    ret=sim.take_photo()
    if ret!=False:
        path,filename=ret
    else:
        print("scan finished!")
        break

    lines_y,lines,centroids,signal,y1,y2=process_image(filename,path,out_path,sim.config,diagnostics_mode='full')
    #returns sorted "y dimension" list of lines (floats)
    #returns lines dict where key is y dimension of line and value is list of cluster centers as 2 element lists [y,x]  y and x are integers representing pixels (floats not good idea for keys later)
    #returns centers dict where key is tuple of integer ( y,x ) representing cluster center and value is list of all points (integer list of [y,x]) belonging to that center
    #returns signal from cropping process
    #returns top cropping height



    #print("current step : ",sim.step)
    if step==1:
        
        signal_history_file=open('sig.txt','w',encoding='utf-8')
        signal_history_file.write("")
        signal_history_file.close()
        signal_history_file=open('sig.txt','a',encoding='utf-8')
        position=0
        total_lines=len(lines_y)
        for intensity in signal:
            signal_history_file.write(str(intensity)+'\n')
        signal_history_file.close()
    else:
        signal_history_file=open("sig.txt",'r',encoding='utf-8')
        signal_history=signal_history_file.read().strip()
        signal_history=signal_history.split('\n')
        signal_history=list(map(float,list(map(str,signal_history))))
        signal_history_file.close()
        #max_deviation=40
        total_signal,total_lines=figure_out_position(signal_history,signal,y1,y2,diagnostics="full")
        position_new=total_lines-len(lines_y)
        if position_new<position:
            position=position
        else:
            position=position_new
        if position<0:
            position=0
        #print("total lines seen: ",total_lines)
        signal_history_file=open('sig.txt','w',encoding='utf-8')
        signal_history_file.write("")
        signal_history_file.close()
        signal_history_file=open('sig.txt','a',encoding='utf-8')
        for intensity in total_signal:
            signal_history_file.write(str(intensity)+'\n')
        signal_history_file.close()

    print("position : ",position)
    print("lines in sight",len(lines_y))
    for i,line in enumerate(lines_y):
        centers=lines[line].copy()
        centers.sort(key=lambda x: x[1], reverse=False)
        #print(centers)
        row=i+position
        if len(centers)>greenhouse_config['columns']:
            continue
        for column,center in enumerate(centers):
            if column>=greenhouse_config['columns'] or row>=greenhouse_config['rows']:
                continue
            save_center(row,column,center,centroids[tuple(center)],path,filename,path_to)
            #break
        #break

    if len(lines_y)==0:
        print('no plants, i finished') #this wouldn't happen we need an error handler in image_process to return 0 y_lines if no plants
        break





    
    print("FINISHED STEP:",step)
    #input("Press Enter to continue...")
    if(sim.make_move(dx)=="finished"):
        break
print('manifesting metrics')
make_measurement(dt,greenhouse_config,unix_time,False)
print('metrics done')
    

