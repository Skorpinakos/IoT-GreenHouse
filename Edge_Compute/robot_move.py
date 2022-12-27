from prototype_for_plant_finder import process_image #process_image takes the path where take_photo stores and the current photo filaname and returns
# a list of th y dimension pixel height where lines occur and also centers_x and centers_y which are the x,y coordinates for each plant
from simulation import Simulation
from mapper import figure_out_position

sim=Simulation(view="images\Capture4.png",camera_dimensions=[589,310])
path="images/"
out_path="diagnostics/"

default_distance=30
#first shoot
start=0
end=0
dx=default_distance
lines_multitude=[0]
step=0

while True:

    step=step+1
    print(step)
    sim.make_move(dx)
    path,filename=sim.take_photo()
    signal_history_file=open("sig.txt",'r',encoding='utf-8')
    signal_history=signal_history_file.read()
    signal_history=signal_history.split('\n')
    signal_history=list(map(int,signal_history))
    signal_history_file.close()
    lines_y,lines,centroids,signal,y1=process_image(filename,path,out_path,sim.config,diagnostics_mode='time+final+sig')
    if step==1:
        signal_history_file=open('sig.txt','a',encoding='utf-8')
        position=0
        for intensity in signal:
            signal_history_file.write(intensity)
    else:
        position,total_signal=figure_out_position(signal_history,signal,y1)

    if len(lines_y)==0:
        print('no plants, i finished') #this wouldn't happen we need an error handler in image_process to return 0 y_lines if no plants
        break
    lines_multitude.append(len(lines_y))
    flag_changed_line=True
    if lines_multitude[step]==lines_multitude[step-1]:
        #no new rows have appeared no old rows have dissapeared (or both if dx too big)
        flag_changed_line=False
        pass
        
    if lines_multitude[step]>lines_multitude[step-1]:
        #new rows have appeared 
        end=end+(lines_multitude[step]-lines_multitude[step-1]) #whatever was gained add to end (! keep in mind to get the current bottom row you want end-1 , not end)
        
    if lines_multitude[step]<lines_multitude[step-1]:
        #top row has dissapeared
        start=start+abs((lines_multitude[step]-lines_multitude[step-1])) #whatever was lost add to start

    if flag_changed_line==True:
        pass
        

    #find focus lane and focus plants centers
