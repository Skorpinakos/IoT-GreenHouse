# IoT-2022
A greenhouse digital twin project using unsupervised machine learning for image processing complete with IoT, Cloud & hardware infrastructure working on RPI4's

## Censor device

## Edge Computing

## Website

### Structure

+ SQLite database
+ HTML, CSS and Ja(aScri)pt front end
+ Node.js backend
  
### Features

+ Secure login with encrypted passwords in the database
+ See the most recent greenhouse and plant measurement
+ Full o(er(i)ew o)f e(ery g)reenhouse including a digital twin (table of plants with colored cells corresponding to the plant's health)
+ Plot showing the growth (size and leaf density) of each plant with time
+ Automatic reload of the plant and greenhouse page as soon as a new measurement arri(es, u)sing a public MQTT broker and the node.js MQTT interface
+ Email notification to the user after the completion of each new measurement
+ Create custom test database with Python
+ Start a new measurement in a remote greenhouse with the press of a button 
+ Register new greenhouses (to be implemented)
+ Automate the measurement process by setting a standard measurement frequency (to be implemented)

  
### Dependencies
+ Front end  

  + Bootstrap (5.2)
  + Ajax
    - paho-mqtt (1.0.1)
    - jquery (3.6.1)
+ Backend

  + Python (3.10.10)
  + Node.js (18.12.1)
    - assert (2.0.0)
    -  bcrypt (5.0.1)
    - better-sqlite3 (7.5.3)
    - body-parser (1.20.1)
    - express (4.18.1)
    - express-handlebars (6.0.6)
    - express-session (1.17.1)
    - file-type (18.0.0)
    - fs (0.0.1-security)
    - mqtt (4.3.7)
    - multer (1.4.4-lts.1)
    - node-fetch (3.3.0)
    - nodemailer (6.7.5)
    - nodemon (2.0.3)
    - path (0.12.7)
    - plotly.js-dist-min (2.17.1)
    - sqlite3 (5.0.8)

### Website Credentials:
+Greenhouse 12 belongs to SpanokhristodoulouErato911
+Everyone's password is 1234
