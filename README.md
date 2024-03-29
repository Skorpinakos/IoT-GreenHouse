https://user-images.githubusercontent.com/82767099/222234645-dc5e18da-7a0e-4793-8653-fe6160680893.mp4
# Greenhouse Monitor (IoT project)
A greenhouse digital twin project using unsupervised machine learning for image processing complete with IoT, Cloud, Website and Hardware infrastructure, working on RPI4's.
Developed by Ioannis Tsampras and Stavros Kanias (Patra, 2023).

## Dependencies

+ Edge Controller
  + Node.js (18.12.1)
    - body-parser (1.20.1)
    - express (4.18.2)
    - express-handlebar (6.0.6) [Will be removed]
    - file-type (18.0.0)
    - fs (0.0.1-security)
    - node-fetch (3.3.0) [Will be removed]
    
  + Python (3.10.4)
    - json
    - datetime
    - os
    - random
    - shutil
    - time
    - sys
    - cv2 (non-included, install with "pip install opencv-python")
    - numpy (non-included, install with "pip install numpy")
    - matplotlib (non-included, install with "pip install matplotlib")
    - sklearn (non-included, install with "pip install scikit-learn")
    - math
    
    
  
+ Website frontend  

  + Bootstrap (5.2)
  + Ajax
    - paho-mqtt (1.0.1)
    - jquery (3.6.1)
    
+ Website backend

  + Node.js (18.12.1)
    - assert (2.0.0)
    - bcrypt (5.0.1)
    - better-sqlite3 (7.5.3)
    - body-parser (1.20.1)
    - express (4.18.1)
    - express-handlebars (6.0.6)
    - express-session (1.17.1)
    - file-type (18.0.0)
    - fs (0.0.1-security)
    - mqtt (4.3.7)
    - multer (1.4.4-lts.1)
    - node-fetch (3.3.0) [Will be removed]
    - nodemailer (6.7.5)
    - nodemon (2.0.3)
    - path (0.12.7)
    - plotly.js-dist-min (2.17.1)
    - sqlite3 (5.0.8)

## Installation and setup

1) Clone the repo from "https://github.com/Skorpinakos/IoT-2022" or export the "GitHub-Repo.zip" 
2) Install node.js (https://nodejs.org/en/download/) version (18.12.1) and Python version (3.10.4)
3) To install the dependencies 
   + cd into the Website directory
   + Run
  
      ```
      npm install
      ```
      (If installation hangs this is a known npm problem https://stackoverflow.com/questions/66893199/hanging-stuck-reifyprettier-timing-reifynodenode-modules-nrwl-workspace-comp we suggest re-trying a few times and giving it some time. This bug has nothing to do with our project and appears since npm version 7.0.0)
4) In a terminal 




   + cd into the Edge_Compute directory
   + Start greenhouse device service (on port 3000) by running

      ```
      node controller.mjs
      ```
5) In another terminal 
   + cd into the Website directory
   + Start the website service (on port 4000) by running
  
      ```
      npm run watch
      ```
6) Open your browser on port 4000 (http://localhost:4000/) and login with the following credentials

  + Username: SpanokhristodoulouErato911
  + Password: 1234

## A basic Measurement Use Case

To initiate a simple measurement:

1) Login
2) Tap on the 'Greenhouses' option on the taskbar
3) Choose the greenhouse for which you want to start a new measurement (greenhouse ID:12 is operational)
4) Once the greenhouse page opens click on the 'New Measurement' button on the bottom right of the screen
5) A small written message will appear beside the button and notify you of the begining of the new measurement
6) When the measurement ends (after approximately half a minute depending on the processor) and its data is stored in the database a full screen popup message will notify you about the event and the page will be refreshed in order for the new data to be served to the front end.
