
import random
import cv2
import time
import json
import numpy as np
random.seed(0)

def increase_brightness(img, value=30):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)

    lim = 255 - value
    v[v > lim] = 255
    v[v <= lim] += value

    final_hsv = cv2.merge((h, s, v))
    img = cv2.cvtColor(final_hsv, cv2.COLOR_HSV2BGR)
    return img
def decrease_brightness(img, value=70):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)

    lim = value
    v[v <= lim] = 0
    v[v > lim] -= value

    final_hsv = cv2.merge((h, s, v))
    img = cv2.cvtColor(final_hsv, cv2.COLOR_HSV2BGR)
    return img




class Simulation:
    def __init__(self,view,camera_dimensions):
        self.view_path=view
        self.view=cv2.imread(self.view_path)
        self.pos=0
        self.cam_width=camera_dimensions[0]
        self.cam_height=camera_dimensions[1]
        self.motor_tolerance=0.3
        self.cropped_image='no image yet'
        f = open('greenhouse_config.json')
        self.config = json.load(f)
        self.step=0
        

    def make_move(self,dx):
        self.step=int(dx+dx*self.motor_tolerance*random.randint(-100,100)/100) # change actual movement by a random percentage
        self.pos+=self.step
        if self.pos+self.cam_height>=self.view.shape[0]:
            print("reached end,breaking...")
            exit()
        img1=self.view[0:(self.pos),0:self.cam_width]
        img2=self.view[self.pos:(self.pos+self.cam_height),0:self.cam_width]
        img3=self.view[(self.pos+self.cam_height):,0:self.cam_width]
        img1=decrease_brightness(img1)
        img2=increase_brightness(img2)
        img3=decrease_brightness(img3)
        birds_view=np.vstack((img1,img2,img3))
        
        cv2.imwrite("diagnostics/birds_eye_view.png",birds_view)

    def take_photo(self):
        #print(self.pos,self.cam_height,self.cam_width)
        try:
            self.cropped_image = self.view[self.pos:(self.pos+self.cam_height),0:self.cam_width]
        except:
            return False
        cv2.imwrite("images/temp_img_taken.png",self.cropped_image)
        #print(type(self.cropped_image))
        cv2.imshow("photo",self.cropped_image)
        cv2.waitKey()
        #print(cropped_image)
        
        
        return "images/","temp_img_taken.png"




#sim=Simulation(view="images/Capture4.png",camera_dimensions=[589,290])
#sim.make_move(50)
#while(sim.pos<1120-sim.cam_height):
    #sim.take_photo()
    #sim.make_move(50)
