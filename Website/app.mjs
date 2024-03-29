//Express.js
import express from 'express'
import { engine } from 'express-handlebars';
import * as model from './model/model.js';
import * as logInController from './controller/login_controller.mjs'
import multer from 'multer';
import path from 'path';
import bodyParser from 'body-parser'
import fs from 'fs'
import mqtt from 'mqtt'
import nodemailer from 'nodemailer'
import taskListSession from './app-setup/app-setup-session.mjs'

const app = express(); //make app object
let port = process.env.PORT || '4000'; //set port
const router = express.Router(); //make a router object
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 
app.use(taskListSession)

// Mailing
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'unireportuniversityofpatras@gmail.com',
    pass: 'zqegiddfnqglegok'
  }
});

// MQTT
// Options only for authenticated users
// let options={
//   clientId:"mqttjs01",
//   username:"GreenhouseMonitorApp",
//   password:"password",
//   clean:true};
let client = mqtt.connect("mqtt://test.mosquitto.org")
client.on("connect",function(){	
  console.log("Connected to broker");
})
client.on("error",function(error){
  console.log("Can't connect to broker: " + error);
  });


const storage = multer.diskStorage({
    destination:(req,file,callback) =>{
        callback(null,'public/images') // path to store images
    },
    filename: (req, file, callback) => {
        let filename = Date.now() + file.originalname.replaceAll(' ', '_');
        callback(null, filename)
    }
})

const imageFileFilter = (req, file, cb) =>{
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif|PNG|JPG|JPEG|GIF|Png|Jpg|Jpeg|Gif|])$/)) { //If the file uploaded is not any of this file type

    // If error in file type, then attach this error to the request header
        req.fileValidationError = "You can upload only image files";
        return cb(null,false, req.fileValidationError);
    }
    cb(null, true)
};

const upload = multer({storage:storage, fileFilter: imageFileFilter});

app.set('view engine', 'handlebars');//Sets our app to use the handlebars engine
//Sets handlebars configurations 
app.use(express.static('public')); //make the 'public' directory public (users can acces it)
app.engine('hbs', engine({ extname: 'hbs' })); //for using 'hbs' file extension instead of 'handlebars'
app.set('view engine', 'hbs'); //set rendering engine the handlebars

///////////////////////////////////////////////////////////////////////////////////////////////////////////////// backend functions
let giveRecentsPage = function(req,res){
    //Serves the main page
    let displayedRecents = 3;
    let client_id = req.session.loggedUserId;
    model.getPlantRecents(displayedRecents, client_id, (err, plant_rows) => {  
      model.getGreenhouseRecents(displayedRecents, client_id, (err, greenhouse_rows) => { 
        if (err){
          console.log(err.message);
        } 
        for (let i in plant_rows){
          if (plant_rows[i].MEASUREMENT_PHOTO == 'null'){
            get_measurement_image(plant_rows[i].P_ID, plant_rows[i].PM_ID, plant_rows[i].IP, plant_rows[i].ROW, plant_rows[i].COLUMN);
          }
            plant_rows[i].MEASUREMENT_PHOTO = 'images/measurements/' +  plant_rows[i].P_ID + '.png';
          plant_rows[i].HEALTH = (plant_rows[i].HEALTH.toFixed(2) * 100).toFixed(2) + '%'
        }
        for(let i in greenhouse_rows){
          greenhouse_rows[i].GREENHOUSE_PHOTO = 'images/greenhouses/' + greenhouse_rows[i].GREENHOUSE_PHOTO
          greenhouse_rows[i].TEMPERATURE = (greenhouse_rows[i].TEMPERATURE.toFixed(2)) + ' C'
          greenhouse_rows[i].HUMIDITY = (greenhouse_rows[i].HUMIDITY.toFixed(2) * 100).toFixed(2) + '%'
        }

        res.render('recents', {layout : 'layout', plant_recents:plant_rows, greenhouse_recents:greenhouse_rows, loged:req.session.loggedUserId });
      })});
};

let givePlantPage = function(req,res){
  let plant_id=req.query['ID'];
    model.getPlantInfo(plant_id, (err, plant_rows) => {   
      model.getPlantMeasurementInfo(plant_id, (err, measurement_rows) => { 
        if(measurement_rows.length){
          model.getGreenhousePlantsWithInfo(plant_rows[0].GREENHOUSE_ID, (err,plants) => {  
            if (err){
              console.log(err.message);
            } 
            for (let p of plants){
                if (p.ID == plant_rows[0].ID){
                  p['current_plant'] = 1;
                }
                else{
                  p['current_plant'] = 0;
                }
            }
            let first_plant_id = plants[0].ID - (plants[0].ROW * plants[0].ROWS + plants[0].COLUMN)
            let last_plant_id = first_plant_id + plants[0].ROWS * plants[0].COLUMNS
            let rows_plants = [];
            let all_plants = [];
            let greenhouse_rows = plants[0].ROWS;
            let greenhouse_columns = plants[0].COLUMNS;
            const max_size = 38.0;
            for (let i = first_plant_id; i < last_plant_id; i++){
              if(plants.length && plants[0].ID == i){
                plants[0].CELL_VALUE = ((plants[0].SIZE / max_size) * 100).toFixed(1) + '%';
                let current_plant = plants.shift();
                all_plants.push(current_plant);
              }
              else{
                all_plants.push({ID: null, ROWS: 6, COLUMNS: 12, HEALTH: null, SIZE: null, CELL_VALUE : 'no data'})
              }
          }
          for (let i = 0; i < greenhouse_rows; i++){
            rows_plants.push(all_plants.slice(i * greenhouse_columns, (i+1) * greenhouse_columns))
          }
            if (measurement_rows[0].MEASUREMENT_PHOTO == 'null'){
              get_measurement_image(plant_rows[0].ID, measurement_rows[0].ID, plant_rows[0].IP, plant_rows[0].ROW, plant_rows[0].COLUMN);
            }
          measurement_rows[0].MEASUREMENT_PHOTO = 'images/measurements/' +  plant_rows[0].ID + '.png';
          measurement_rows[0].HEALTH = (measurement_rows[0].HEALTH.toFixed(2) * 100).toFixed(2) + ' %'
          measurement_rows[0].GROWTH = measurement_rows[0].GROWTH + ' cm'
          measurement_rows[0].measurement_rows = measurement_rows[0].SIZE.toFixed(2) + ' cm'
          plant_rows[0].LIFESPAN = plant_rows[0].LIFESPAN + ' months'
          res.render('plant', {layout : 'layout',plant_info:plant_rows[0], measurement_info:measurement_rows[0], rows_plants:rows_plants, loged:req.session.loggedUserId});
        });
      }
      else{
        model.getGreenhousePlantsWithoutInfo(plant_rows[0].GREENHOUSE_ID, (err,plants) => {  
          if (err){
            console.log(err.message);
          } 
          for (let p of plants){
              if (p.ID == plant_rows[0].ID){
                p['current_plant'] = 1;
              }
              else{
                p['current_plant'] = 0;
              }
          }
          let rows_plants = [];
          for (let i = 0; i < plants[0].ROWS; i++){
            for (let j = 0; j < plants[0].COLUMNS; j++){
              plants[i * plants[0].COLUMNS + j].CELL_VALUE = plants[i * plants[0].COLUMNS + j].ID;
            }
            rows_plants.push(plants.slice(i * plants[0].COLUMNS, (i+1) * plants[0].COLUMNS))
          }
        plant_rows[0].LIFESPAN = plant_rows[0].LIFESPAN + ' months'
        res.render('plant', {layout : 'layout',plant_info:plant_rows[0], measurement_info:measurement_rows[0], rows_plants:rows_plants, loged:req.session.loggedUserId});
      });
      }
    });
  });
};

let giveGreenhousePage = function(req,res){
let greenhouse_id = req.query['ID'];
model.getGreenhouseInfo(greenhouse_id, (err, greenhouse_rows) => {  
  model.getGreenhouseMeasurementInfo(greenhouse_id, (err, measurement_rows) => { 
        if(measurement_rows.length){
            model.getGreenhousePlantsWithInfo(greenhouse_id, (err,plants) => {
              if (err){
                console.log(err.message);
              } 
              if (plants.length){
              let first_plant_id = plants[0].ID - (plants[0].ROW * plants[0].ROWS + plants[0].COLUMN)
              let last_plant_id = first_plant_id + plants[0].ROWS * plants[0].COLUMNS
              let rows_plants = [];
              let all_plants = [];
              const max_size = 38.0;
                measurement_rows[0].TEMPERATURE = measurement_rows[0].TEMPERATURE.toFixed(2) + ' C'
                measurement_rows[0].HUMIDITY = measurement_rows[0].HUMIDITY.toFixed(2) + ' %'
                measurement_rows[0].SUNLIGHT = measurement_rows[0].SUNLIGHT.toFixed(2) + ' Wm-2'
                measurement_rows[0].CO2 = measurement_rows[0].CO2.toFixed(2) + ' ppm'
                for (let i = first_plant_id; i < last_plant_id; i++){
                    if(plants.length && plants[0].ID == i){
                      plants[0].CELL_VALUE = ((plants[0].SIZE / max_size) * 100).toFixed(1) + '%';
                      let current_plant = plants.shift();
                      all_plants.push(current_plant);
                    }
                    else{
                      all_plants.push({ID: null, ROWS: 6, COLUMNS: 12, HEALTH: null, SIZE: null, CELL_VALUE : 'no data'})
                    }
                }
                for (let i = 0; i < greenhouse_rows[0].ROWS; i++){
                  rows_plants.push(all_plants.slice(i * greenhouse_rows[0].COLUMNS, (i+1) * greenhouse_rows[0].COLUMNS))
                }

                greenhouse_rows[0].GREENHOUSE_PHOTO = 'images/greenhouses/' + greenhouse_rows[0].GREENHOUSE_PHOTO;
                greenhouse_rows[0].COORDS_X = greenhouse_rows[0].COORDS_X.toFixed(5)
                greenhouse_rows[0].COORDS_Y = greenhouse_rows[0].COORDS_Y.toFixed(5)
                greenhouse_rows[0].WIDTH = greenhouse_rows[0].WIDTH.toFixed(2) + ' m'
                greenhouse_rows[0].LENGTH = greenhouse_rows[0].LENGTH.toFixed(2) + ' m'
                greenhouse_rows[0].HEIGHT = greenhouse_rows[0].HEIGHT.toFixed(2) + ' m'
                res.render('greenhouse', {layout : 'layout', greenhouse_info:greenhouse_rows[0], greenhouse_measurement_info:measurement_rows[0], rows_plants:rows_plants, loged:req.session.loggedUserId});  

              }
            else{
              model.getGreenhousePlantsWithoutInfo(greenhouse_id, (err,plants) => {
                if (err){
                  console.log(err.message);
                } 
                let rows_plants = [];
                for (let i = 0; i < greenhouse_rows[0].ROWS; i++){
                  for (let j = 0; j < plants[0].COLUMNS; j++){
                    plants[i * plants[0].COLUMNS + j].CELL_VALUE = plants[i * plants[0].COLUMNS + j].ID;
                  }
                  rows_plants.push(plants.slice(i * greenhouse_rows[0].COLUMNS, (i+1) * greenhouse_rows[0].COLUMNS))
                }
                greenhouse_rows[0].GREENHOUSE_PHOTO = 'images/greenhouses/' + greenhouse_rows[0].GREENHOUSE_PHOTO;
                greenhouse_rows[0].COORDS_X = greenhouse_rows[0].COORDS_X.toFixed(5)
                greenhouse_rows[0].COORDS_Y = greenhouse_rows[0].COORDS_Y.toFixed(5)
                greenhouse_rows[0].WIDTH = greenhouse_rows[0].WIDTH.toFixed(2) + ' m'
                greenhouse_rows[0].LENGTH = greenhouse_rows[0].LENGTH.toFixed(2) + ' m'
                greenhouse_rows[0].HEIGHT = greenhouse_rows[0].HEIGHT.toFixed(2) + ' m'
                res.render('greenhouse', {layout : 'layout', greenhouse_info:greenhouse_rows[0], greenhouse_measurement_info:measurement_rows[0], rows_plants:rows_plants, loged:req.session.loggedUserId});  
             });
            }
          });
        }
        else{
          model.getGreenhousePlantsWithoutInfo(greenhouse_id, (err,plants) => {
            if (err){
              console.log(err.message);
            } 
            let rows_plants = [];
          for (let i = 0; i < greenhouse_rows[0].ROWS; i++){
            for (let j = 0; j < plants[0].COLUMNS; j++){
              plants[i * plants[0].COLUMNS + j].CELL_VALUE = plants[i * plants[0].COLUMNS + j].ID;
            }
            rows_plants.push(plants.slice(i * greenhouse_rows[0].COLUMNS, (i+1) * greenhouse_rows[0].COLUMNS))
          }
          greenhouse_rows[0].GREENHOUSE_PHOTO = 'images/greenhouses/' + greenhouse_rows[0].GREENHOUSE_PHOTO;
          greenhouse_rows[0].COORDS_X = greenhouse_rows[0].COORDS_X.toFixed(5)
          greenhouse_rows[0].COORDS_Y = greenhouse_rows[0].COORDS_Y.toFixed(5)
          greenhouse_rows[0].WIDTH = greenhouse_rows[0].WIDTH.toFixed(2) + ' m'
          greenhouse_rows[0].LENGTH = greenhouse_rows[0].LENGTH.toFixed(2) + ' m'
          greenhouse_rows[0].HEIGHT = greenhouse_rows[0].HEIGHT.toFixed(2) + ' m'
          res.render('greenhouse', {layout : 'layout', greenhouse_info:greenhouse_rows[0], greenhouse_measurement_info:measurement_rows[0], rows_plants:rows_plants, loged:req.session.loggedUserId});  
          });
      }
    });
  });
};

let giveClientGreenhouses = function(req,res){
  let client_id = req.session.loggedUserId;
  model.getClientGreenhouseMeasurements(client_id, (err, measurements) => { 
    model.getClientGreenhouses(client_id, (err, greenhouses) => { 
    for(let i = 0; i < greenhouses.length; i++){
      for(let j = 0; j < measurements.length; j++){
        if (greenhouses[i].ID == measurements[j].GREENHOUSE_ID){
          greenhouses[i].GREENHOUSE_PHOTO = 'images/greenhouses/' + greenhouses[i].GREENHOUSE_PHOTO;
          greenhouses[i].TEMPERATURE = measurements[j].TEMPERATURE.toFixed(2) + ' C'
          greenhouses[i].HUMIDITY = measurements[j].HUMIDITY.toFixed(2) + ' %'
          greenhouses[i].MEASUREMENT_DATE = measurements[j].MEASUREMENT_DATE;
          greenhouses[i].MEASUREMENT_TIME = measurements[j].MEASUREMENT_TIME;
        }

    }
    if(Object.keys(greenhouses[i]).length == 2){
      greenhouses[i].GREENHOUSE_PHOTO = 'images/greenhouses/' + greenhouses[i].GREENHOUSE_PHOTO;
      greenhouses[i].TEMPERATURE = '-';
      greenhouses[i].HUMIDITY = '-';
      greenhouses[i].MEASUREMENT_DATE = '-';
      greenhouses[i].MEASUREMENT_TIME = '-';

    }

  }
    if (err){
      console.log(err.message);
    } 

    res.render('greenhouses', {layout : 'layout', greenhouses:greenhouses, loged:req.session.loggedUserId});
    });
  });
};

let addGreenhouse = function(req,res){  
    res.render('add_greenhouse', {layout : 'layout', loged:req.session.loggedUserId});
};

let storeNewMeasurement = function(req,res){ 
  console.log('this is test:\n'+req.body.TEMPERATURE);
  res.statusCode=200;
  res.send("Received package.");
  model.getLastGreenhouseMeasurementId((err, last_greenhouse_measurement) => { 
    if (err){
      console.log(err.message);
    };
    let greenhouse_measurement = [];
    let measurement_datetime = req.body.START_DATETIME.split(" ");
    const seperated_measurement_date = measurement_datetime[0].split('-');
    const seperated_measurement_time = measurement_datetime[1].split(':');
    for (let i = 0; i < seperated_measurement_date.length; i++){
      if(seperated_measurement_date[i].length==1){
        seperated_measurement_date[i] = '0' + seperated_measurement_date[i];
      }
      if(seperated_measurement_time[i].length==1){
        seperated_measurement_time[i] = '0' + seperated_measurement_time[i];
      }
    }
    let measurement_date = seperated_measurement_date.join('-');
    let measurement_time = seperated_measurement_time.join(':');
    let greenhouse_measurement_id = last_greenhouse_measurement[0].ID + 1;
    greenhouse_measurement.push(greenhouse_measurement_id, measurement_date, measurement_time, req.body.TEMPERATURE, req.body.SUNLIGHT, req.body.HUMIDITY, req.body.CO2, req.body.GREENHOUSE_ID);
    model.storeGreenhouseMeasurement(greenhouse_measurement, (err, rows) => {
      if (err){
        console.log(err.message);
      }; 
      model.getFirstGreenhousePlantId(req.body.GREENHOUSE_ID, (err, first_greenhouse_plant) => { 
        model.getLastPlantMeasurementId((err, last_plant_measurement) => { 
          if (err){
            console.log(err.message);
          }; 
          const last_measurement_id = last_plant_measurement[0].ID;
          const measurement_start_datetime = new Date(seperated_measurement_date[0],parseInt(seperated_measurement_date[1])-1,seperated_measurement_date[2],seperated_measurement_time[0],seperated_measurement_time[1],seperated_measurement_time[2]);
          let unhealthy_plants = 0;
          let average_health = 0;
          for (let i = 0; i < req.body.measurements.length; i++){
            let plant_health = req.body.measurements[i][3]
            average_health += plant_health;
            if (plant_health < 0.6){
              unhealthy_plants += 1;
            }
            setTimeout(() => {model.storePlantMeasurement(i, last_measurement_id, first_greenhouse_plant, measurement_start_datetime, req.body.measurements[i][0], req.body.measurements[i][1], req.body.measurements[i][2], req.body.measurements[i][3])},50*i);
          
            if (i == req.body.measurements.length - 1){
              average_health = (average_health / (first_greenhouse_plant[0].ROWS * first_greenhouse_plant[0].COLUMNS)).toFixed(2)
              setTimeout(() => {
                let topic = 'GreenhouseMonitor' + req.body.GREENHOUSE_ID;
                let message = 'The measurement that started on ' + req.body.START_DATETIME + ' has finished and has been stored successfully with ID ' + greenhouse_measurement_id + '.';
                if (client.connected==true){
                  client.publish(topic, message);
                  }
                  model.getClientEmail(req.body.GREENHOUSE_ID, (err, cmail) =>{
                    let mailOptions = {
                      from: 'unireportuniversityofpatras@gmail.com',
                      to: cmail.EMAIL,
                      subject: 'Ολοκλήρωση μέτρησης',
                      text: "Αυτή η απάντηση είναι αυτοματοποιημένη. Η μέτρηση που ξεκίνησε στις " +  req.body.START_DATETIME + " ολοκληρώθηκε και καταχωρήθηκε με κωδικό " + greenhouse_measurement_id + " ." + "Βρέθηκαν " + unhealthy_plants + " μη υγιή φυτά και ο μέσος όρος υγείας του θερμοκηπίου είναι " + average_health + " ." 
                    };
                    
                  if(mailOptions.to){
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                          console.log(error);
                        } else {
                          console.log('Email sent: ' + info.response);
                        }
                      }); 
                  }
                })}, 4000);
              }
            }
            })
        });
      });
    });
};

let startNewMeasurement = async function(req,res){ 
  let ip = req['query'].IP; 
  let url = 'http://' + ip + '/start_greenhouse_measurement'
  try{
    const response = await fetch(url);
    const text = await response.text();
    res.statusCode = 200;
    res.send(text)
  }
  catch(err) {
    console.log("Failed to initiate a new measurement.\n" + err)
  }
};


let get_measurement_image = async function savePhotoFromAPI(p_id, m_id, ip, r, c) {
  //ip = 'localhost:3000'
  let url = 'http://' + ip + '/get_recent_photo' + '?x=' + r + '&y=' + c
  try{
    const response = await fetch(url, {credentials:'include', headers: { 'Content-Type': 'image/png' }});
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    //const fileType = await fileType.fromBuffer(buffer);
    if (1) {
        const dir = path.resolve() + '/public/'
        const outputFileName = 'images/measurements/' +  p_id + '.png';
        fs.createWriteStream(dir + outputFileName).write(buffer);
        model.updateMeasurementPhoto(m_id, ['MEASUREMENT_PHOTO'], [outputFileName])
    } else {
        console.log('File type could not be reliably determined! The binary data may be malformed! No file saved!')
    }
  }
  catch(err){
    console.log("Failed to retrieve the most recent image for the plant " + p_id + " from the greenhouse with IP " + ip + " .\n" + err);
  }
}

let getPlantStats = async function(req,res){ 
  let id = req['query'].ID; 
  model.getPlantMeasurementStats(id, (err, plant_stats) => {
  res.send(plant_stats);
});
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////// express routes
app.use(router);
router.route('/').get((req, res) => { res.redirect('/recents') });
router.route('/login').get(logInController.checkAuthenticated, logInController.showLogInForm);
router.route('/login').post(logInController.doLogin);
router.route('/logout').get(logInController.doLogout);
router.route('/register').get(logInController.checkAuthenticated, logInController.showRegisterForm);
router.post('/register', logInController.doRegister);
router.route('/recents').get(logInController.checkAuthenticated, giveRecentsPage);
router.route('/greenhouses').get(logInController.checkAuthenticated, giveClientGreenhouses);
router.route('/plant').get(logInController.checkAuthenticated, givePlantPage);
router.route('/greenhouse').get(logInController.checkAuthenticated, giveGreenhousePage);
router.route('/greenhouse').post(giveGreenhousePage);
router.route('/add_greenhouse').get(logInController.checkAuthenticated, addGreenhouse);
router.route('/start_new_measurement').get(startNewMeasurement);
router.route('/get_plant_stats').get(getPlantStats);
router.route('/store_new_measurement').post(storeNewMeasurement);

// router.route('/push_greenhouse').post(upload.any(), pushGreenhouse);
////////////////////////////////////////////////////////////////////////////////////////////////////////// initializing server
app.listen(port, () => console.log(`App listening to port ${port}`));
