### import section and error handling regarding directory and packets
try:
    import traceback
    from prototype_for_plant_finder import process_image 
    from simulation import Simulation
    from mapper import figure_out_position
    from image_utils import save_center
    import sys #only needed in deployed version
    import os
    from datetime import datetime
    import json
    from fake_data import make_measurement
    import time
except:
    print("Either Edge AI misses important packets (check project requirements and dependencies for edge controller's Python installation at 'https://github.com/Skorpinakos/IoT-2022') or controller.mjs was not run in correct sub-directory: Edge_Compute")
    print(traceback.format_exc())
    exit(1)

###




### defs section

def datetime2dt(dt):
    return (str(dt).replace(":","_").replace(" ","_").replace("-","_")).split(".")[0]

def clear_signal_file():
    signal_history_file=open('sig.txt','w',encoding='utf-8')
    signal_history_file.write("")
    signal_history_file.close()
    return

def write_signal_to_signal_file(signal):
    signal_history_file=open('sig.txt','a',encoding='utf-8')
    for intensity in signal:
        signal_history_file.write(str(intensity)+'\n')
    signal_history_file.close()
    return
def json_file_to_dict(file):
    f = open(file)                                             
    greenhouse_config=json.load(f)
    f.close()
    return greenhouse_config
def read_signal_history_file_to_list():
        signal_history_file=open("sig.txt",'r',encoding='utf-8')
        signal_history=signal_history_file.read().strip()
        signal_history=signal_history.split('\n')
        signal_history=list(map(float,list(map(str,signal_history))))
        signal_history_file.close()
        return signal_history

###

### input section
dt=datetime2dt(datetime.now()) # set input (normally this would come from sys call args[1] and follows the yyyy_mm_dd_hh_mm_ss format)
###

### init section
print("starting at: ",dt)
unix_time=int(time.mktime(datetime(*list(map(int,dt.split("_")))).timetuple())) #get unix timestamp from "dt" type input (e.g. yyyy_mm_dd_hh_mm_ss)
images_path ="images/"                                                          #set relative path for image folder
diagnostics_path ="diagnostics/"                                                #set relative path for diagnostics folder
path_to ="images/measurements/measurement_at_"+dt                               #set path to store data from the measurement of this run
dx=30                                                                           #set median distance moved between 2 iterations (in pixels)
greenhouse_config=json_file_to_dict('greenhouse_config.json')                   #open and load configuration of current greenhouse containing multitude of rows and columns, id and the url of the central server

try:                                                                            #try to make path for storing 
    os.mkdir(path_to )
except:
    print("couldn't make dir, breaking...")
    exit(1)

Sim=Simulation(view="images/Capture6.png",camera_dimensions=[589,310],directory_images=images_path,directory_diagnostics=diagnostics_path)  #create Simulation object with Simulated camera sensor dimensions(x,y) and source BIG-image for Simulation (x dimension of source image must match x dimension of camera sensor)

###

### Main-loop
step=0                                                                         #counter for iterations
while True:
    step=step+1

    ### report to stdout 
    print("STARTING STEP:",step)
    ###

    ### take photo
    current_photo=Sim.take_photo() # Sim.take_photo() takes a photo of our current position in the BIG-image and stores it, it returns the relative path and filename 
    if current_photo!=False:
        images_path ,filename=current_photo
    else:
        print("no more BIG-photo to scan, make_move error handling should have prevented this")
        exit(1) 
    ###

    ### Processing of current photo
    results=process_image(filename,images_path ,diagnostics_path ,Sim.config,diagnostics_mode='none')
    #returns sorted "y dimension" list of lines (floats)
    #returns lines dict where key is y dimension of line and value is list of cluster centers as 2 element lists [y,x]  y and x are integers representing pixels (floats not good idea for keys later)
    #returns centers dict where key is tuple of integer ( y,x ) representing cluster center and value is list of all points (integer list of [y,x]) belonging to that center
    #returns signal from cropping process
    #returns top cropping height
    #returns bottom cropping height
    ###


    ### first-step sub-section
    if step==1:
        position=0
        clear_signal_file()
        write_signal_to_signal_file(results.signal)
    
    ###

    ### typical step sub-section
    else:
        #read signal history from file
        signal_history = read_signal_history_file_to_list()
        ###

        ### Attach new-found signal to signal-history and Calculate the amount of individual lines we have encountered
        total_signal,total_lines=figure_out_position(signal_history,results.signal,results.y1,results.y2,diagnostics="none")
        ###

        ###This is cheap fix for current image processing based bugs where new position ends up smaller than old one (propably the fft smoothing bug)
        position_new=total_lines-len(results.lines_y)
        if position_new<position:
            position=position
        else:
            position=position_new
        if position<0:  
            position=0
        ###

        ###Write updated signal history to file
        clear_signal_file()
        write_signal_to_signal_file(total_signal)
        ###

    ### report to stdout 
    print("position : ",position)
    print("lines in sight",len(results.lines_y))
    ###

    ### Store plant images in correct folders
    for i,line in enumerate(results.lines_y):
        centers=results.lines[line].copy() #for a given line (a float representing the height of the line) in results.lines_y get the list of corresponding centers from the "lines" dict where e.g. "134.72" yields a list of 2 element lists representing corresponding centers in that line in [y_int,x_int] format
        centers.sort(key=lambda center: center[1], reverse=False) #sort centers based on their second element (their x dimension)
        #centers=[[y1,x1],[y2,x2]....]
        row=i+position #use our position (offset) and our local row index to add up to the real row number
        if len(centers)!=greenhouse_config['columns']: #fix for when image processing finds more (or less) plants in one row than expected, discards whole row snapshot instead of storing it
            continue
        for column,center in enumerate(centers):
            save_center(row,column,center,results.centroids[tuple(center)],images_path ,filename,path_to )
            # row-> integre, column->integer, center->[y,x] where y,x integers, centroids -> dict where (center_y,center_x) yields a list like [[y1,x1],[y2,x2]...] reprsanting all corresponding detected pixels of the plant implied by that center
            # paths -> self explanatory


    ### report to stdout and check if we can make another step
    print("FINISHED STEP:",step)
    if(Sim.make_move(dx)=="finished"):
        break
    ###

### Make mock metrics after run
print('manifesting metrics')
make_measurement(dt,greenhouse_config,unix_time,False)
print('metrics done')
###