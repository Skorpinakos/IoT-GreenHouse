from prototype_for_plant_finder import process_image

def make_move(dx):
    pass
def take_photo(path,filename):
    return path,filename

path="Edge_Compute/images/"
out_path="Edge_Compute/diagnostics/"
filename='Capture1.png' #set image to test
default_distance=0.20 


dx=default_distance
while True:
    make_move(dx)
    filename,path=take_photo(path,filename)
    lines_y,centers_x,centers_y=process_image(filename,path,out_path,diagnostics_mode='none')
    #find focus lane and focus plants centers
