//Express.js
import express from 'express'
import { engine } from 'express-handlebars';
import * as model from './model/model.js';
import multer from 'multer';
import nodemailer from 'nodemailer';
const app = express(); //make app object
let port = process.env.PORT || '3000'; //set port
const router = express.Router(); //make a router object

const admin_keys = ['tsabras123', 'steve456'];

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'unireportuniversityofpatras@gmail.com',
    pass: 'zqegiddfnqglegok'
  }
});

const storage = multer.diskStorage({
    destination:(req,file,callback) =>{
        callback(null,'public/images') // path to store images
    },
    filename: (req, file, callback) => {
        //console.log(file)
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

let x0=21.783835;
let x_ratio=(21.795379-x0)/1100;
let y0=38.292066;
let y_ratio=(y0-38.286980)/600;
let ips={};
let last_clear_time=Date.now();

///////////////////////////////////////////////////////////////////////////////////////////////////////////////// backend functions
let giveHomePage = function(req,res){
    //Serves the main page
    let displayedRecents = 3;
    model.getPlantRecents(displayedRecents, (err, plant_rows) => {  
      model.getGreenhouseRecents(displayedRecents, (err, greenhouse_rows) => { 
        if (err){
          console.log(err.message);
        } 
        for (let i in plant_rows){
          plant_rows[i].MEASUREMENT_PHOTO = 'images/measurements/' + plant_rows[i].MEASUREMENT_PHOTO
          plant_rows[i].HEALTH = (plant_rows[i].HEALTH.toFixed(2) * 100).toFixed(2) + '%'
        }
        for(let i in greenhouse_rows){
          greenhouse_rows[i].GREENHOUSE_PHOTO = 'images/greenhouses/' + greenhouse_rows[i].GREENHOUSE_PHOTO
          greenhouse_rows[i].TEMPERATURE = (greenhouse_rows[i].TEMPERATURE.toFixed(2)) + ' C'
          greenhouse_rows[i].HUMIDITY = (greenhouse_rows[i].HUMIDITY.toFixed(2) * 100).toFixed(2) + '%'
        }

        res.render('home_page', {layout : 'layout', plant_recents:plant_rows, greenhouse_recents:greenhouse_rows });
      })});
};

let givePlantPage = function(req,res){
  let plant_id=req.query['ID'];
    model.getPlantInfo(plant_id, (err, plant_rows) => {   
      model.getPlantMeasurementInfo(plant_id, (err, measurement_rows) => { 
        model.getGreenhousePlants(plant_rows[0].GREENHOUSE_ID, (err,plants) => {  
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
          rows_plants.push(plants.slice(i * plants[0].COLUMNS, (i+1) * plants[0].COLUMNS))
        }
        if(measurement_rows.length){
          measurement_rows[0].MEASUREMENT_PHOTO = 'images\\measurements\\' + measurement_rows[0].MEASUREMENT_PHOTO
          measurement_rows[0].HEALTH = (measurement_rows[0].HEALTH.toFixed(2) * 100).toFixed(2) + ' %'
          if (measurement_rows.length  == 1){
            measurement_rows[0].GROWTH = 0 + ' cm'
          }
          else if (rows.length  == 2){
            measurement_rows[0].GROWTH = (measurement_rows[0].GROWTH - measurement_rows[1].GROWTH).toFixed(2) + ' cm'
          }
          measurement_rows[0].measurement_rows = measurement_rows[0].SIZE.toFixed(2) + ' cm'
      }
      plant_rows[0].LIFESPAN = plant_rows[0].LIFESPAN + ' months'
        res.render('plant', {layout : 'layout',plant_info:plant_rows[0], measurement_info:measurement_rows[0], rows_plants:rows_plants});
      });
    });
  });
};

let giveGreenhousePage = function(req,res){
let greenhouse_id=req.query['ID'];
model.getGreenhouseInfo(greenhouse_id, (err, greenhouse_rows) => {  
  model.getGreenhouseMeasurementInfo(greenhouse_id, (err, measurement_rows) => { 
    model.getGreenhousePlants(greenhouse_id, (err,plants) => {
  
        if (err){
          console.log(err.message);
        } 
        let rows_plants = [];
        if(measurement_rows.length){
          measurement_rows[0].TEMPERATURE = measurement_rows[0].TEMPERATURE.toFixed(2) + ' C'
          measurement_rows[0].HUMIDITY = measurement_rows[0].HUMIDITY.toFixed(2) + ' %'
          measurement_rows[0].SUNLIGHT = measurement_rows[0].SUNLIGHT.toFixed(2) + ' Wm-2'
          measurement_rows[0].CO2 = measurement_rows[0].CO2.toFixed(2) + ' ppm'
        }
        for (let i = 0; i < greenhouse_rows[0].ROWS; i++){
          rows_plants.push(plants.slice(i * greenhouse_rows[0].COLUMNS, (i+1) * greenhouse_rows[0].COLUMNS))
        }
        greenhouse_rows[0].GREENHOUSE_PHOTO = 'images\\greenhouses\\' + greenhouse_rows[0].GREENHOUSE_PHOTO;
        greenhouse_rows[0].COORDS_X = greenhouse_rows[0].COORDS_X.toFixed(5)
        greenhouse_rows[0].COORDS_Y = greenhouse_rows[0].COORDS_Y.toFixed(5)
        greenhouse_rows[0].WIDTH = greenhouse_rows[0].WIDTH.toFixed(2) + ' m'
        greenhouse_rows[0].LENGTH = greenhouse_rows[0].LENGTH.toFixed(2) + ' m'
        greenhouse_rows[0].HEIGHT = greenhouse_rows[0].HEIGHT.toFixed(2) + ' m'

        
        res.render('greenhouse', {layout : 'layout', greenhouse_info:greenhouse_rows[0], greenhouse_measurement_info:measurement_rows[0], rows_plants:rows_plants});
      });
    });
  });
};

let giveClientGreenhouses = function(req,res){
  let client_id = 20;
  model.getClientGreenhouseMeasurements(client_id, (err, measurements) => { 
    model.getClientGreenhouses(client_id, (err, greenhouses) => { 
    for(let i = 0; i < greenhouses.length; i++){
      for(let j = 0; j < measurements.length; j++){
        if (greenhouses[i].ID == measurements[j].GREENHOUSE_ID){
          greenhouses[i].GREENHOUSE_PHOTO = 'images\\greenhouses\\' + greenhouses[i].GREENHOUSE_PHOTO;
          greenhouses[i].TEMPERATURE = measurements[j].TEMPERATURE.toFixed(2) + ' C'
          greenhouses[i].HUMIDITY = measurements[j].HUMIDITY.toFixed(2) + ' %'
          greenhouses[i].MEASUREMENT_DATE = measurements[j].MEASUREMENT_DATE;
          greenhouses[i].MEASUREMENT_TIME = measurements[j].MEASUREMENT_TIME;
        }

    }
    if(Object.keys(greenhouses[i]).length == 2){
      greenhouses[i].GREENHOUSE_PHOTO = 'images\\greenhouses\\' + greenhouses[i].GREENHOUSE_PHOTO;
      greenhouses[i].TEMPERATURE = '-';
      greenhouses[i].HUMIDITY = '-';
      greenhouses[i].MEASUREMENT_DATE = '-';
      greenhouses[i].MEASUREMENT_TIME = '-';

    }
    console.log(greenhouses)

  }
    // console.log(greenhouses)
    if (err){
      console.log(err.message);
    } 
    // console.log(greenhouses)

    res.render('greenhouses', {layout : 'layout', greenhouses:greenhouses});
    });
  });
};

let current_datetime = function(req,res){
  let today = new Date();
  
  let year = String(today.getFullYear());

  let month = String(today.getMonth() + 1);
  if (month.length == 1){
    month = '0' + month;
  }

  let day = String(today.getDate());
  if (day.length == 1){
    day = '0' + day;
  }

  let date = year + '-' + month + '-' + day;

  let hours = String(today.getHours());
  if (hours.length == 1){
    hours = '0' + hours;
  }

  let minutes = String(today.getMinutes());
  if (minutes.length == 1){
    minutes = '0' + minutes;
  }

  let seconds = String(today.getSeconds());
  if (seconds.length == 1){
    seconds = '0' + seconds;
  }

  let time = hours + ":" + minutes + ":" + seconds;
  
  let now = date + ' ' + time;

  return now;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////// express routes
app.use(router);
router.route('/').get(giveHomePage);
router.route('/greenhouses').get(giveClientGreenhouses);
router.route('/plant').get(givePlantPage);
router.route('/greenhouse').get(giveGreenhousePage);
router.route('/add_greenhouse').post(upload.any(), addGreenhouse);
////////////////////////////////////////////////////////////////////////////////////////////////////////// initializing server
app.listen(port, () => console.log(`App listening to port ${port}`));