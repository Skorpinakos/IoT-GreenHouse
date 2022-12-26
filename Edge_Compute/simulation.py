
import random
import cv2
import time


class Simulation:
    def __init__(self,view,camera_dimensions):
        self.view_path=view
        self.view=cv2.imread(self.view_path)
        self.pos=0
        self.cam_width=camera_dimensions[0]
        self.cam_height=camera_dimensions[1]
        self.motor_tolerance=0.1
        self.cropped_image='no image yet'
        

    def make_move(self,dx):
        self.pos+=int(dx+dx*self.motor_tolerance*random.randint(-100,100)/100) # change actual movement by a random percentage
        

    def take_photo(self):
        #print(self.pos,self.cam_height,self.cam_width)
        self.cropped_image = self.view[self.pos:(self.pos+self.cam_height),0:self.cam_width]
        cv2.imwrite("images/temp_img_taken.png",self.cropped_image)
        #print(type(self.cropped_image))
        cv2.imshow("photo",self.cropped_image)
        cv2.waitKey(1000)
        #print(cropped_image)
        
        
        return "Edge_Compute/images/","temp_img_taken.png"




sim=Simulation(view="images/Capture4.png",camera_dimensions=[589,290])
#sim.make_move(50)
while(sim.pos<1120-sim.cam_height):
    sim.take_photo()
    sim.make_move(50)
