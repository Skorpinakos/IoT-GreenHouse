//Express.js
import express from 'express'
import { engine } from 'express-handlebars';
import * as model from './model/model.js';
import multer from 'multer';
import path from 'path';
import bodyParser from 'body-parser'
import fs from 'fs'
const app = express(); //make app object
let port = process.env.PORT || '4000'; //set port
const router = express.Router(); //make a router object
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 


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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////// backend functions
let giveHomePage = function(req,res){
    //Serves the main page
    let displayedRecents = 3;
    let client_id = 23;
    model.getPlantRecents(displayedRecents, client_id, (err, plant_rows) => {  
      model.getGreenhouseRecents(displayedRecents, client_id, (err, greenhouse_rows) => { 
        if (err){
          console.log(err.message);
        } 
        for (let i in plant_rows){
          console.log(plant_rows[i].P_ID, plant_rows[i].PM_ID, plant_rows[i].IP, plant_rows[i].ROW, plant_rows[i].COLUMN)
          get_measurement_image(plant_rows[i].P_ID, plant_rows[i].PM_ID, plant_rows[i].IP, plant_rows[i].ROW, plant_rows[i].COLUMN);
          plant_rows[i].MEASUREMENT_PHOTO = 'images\\measurements\\' +  plant_rows[i].P_ID + '.png';
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
          get_measurement_image(plant_rows[0].ID, measurement_rows[0].ID, plant_rows[0].IP, plant_rows[0].ROW, plant_rows[0].COLUMN);
          measurement_rows[0].MEASUREMENT_PHOTO = 'images\\measurements\\' +  plant_rows[0].ID + '.png';
          measurement_rows[0].HEALTH = (measurement_rows[0].HEALTH.toFixed(2) * 100).toFixed(2) + ' %'
          if (measurement_rows.length  == 1){
            measurement_rows[0].GROWTH = 0 + ' cm'
          }
          else if (measurement_rows.length  == 2){
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
  let client_id = 23;
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

let addGreenhouse = function(req,res){  
    res.render('add_greenhouse', {layout : 'layout'});
};

let storeNewMeasurement = function(req,res){  
  console.log(req.body);
  res.statusCode=200;
  res.send("Received package.");
};

let startNewMeasurement = async function(req,res){ 
  let ip = req['query'].IP; 
  console.log(ip)
  ip = 'localhost:3000'
  let url = 'http://' + ip + '/start_greenhouse_measurement'
  console.log(url)
  const response = await fetch(url);
  console.log(response)
  const data = response.text();
  console.log(data);
  res.json({"status":'ok'});
};


let get_measurement_image = async function savePhotoFromAPI(p_id, m_id, ip, r, c) {
  console.log(ip)
  if(p_id<9401 || p_id>9498){
    ip = 'localhost:3000'
  }
  let url = 'http://' + ip + '/get_recent_photo' + '?x=' + r + '&y=' + c
  console.log(url);
  const response = await fetch(url, {credentials:'include', headers: { 'Content-Type': 'image/png' }
});
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  //const fileType = await fileType.fromBuffer(buffer);
  if (1) {
      const dir = path.resolve() + '\\public\\'
      const outputFileName = 'images\\measurements\\' +  p_id + '.png';
      console.log(dir + outputFileName)
      fs.createWriteStream(dir + outputFileName).write(buffer);
      model.update_measurement_photo(m_id, ['MEASUREMENT_PHOTO'], [outputFileName])
  } else {
      console.log('File type could not be reliably determined! The binary data may be malformed! No file saved!')
  }
  
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////// express routes
app.use(router);
router.route('/').get(giveHomePage);
router.route('/greenhouses').get(giveClientGreenhouses);
router.route('/plant').get(givePlantPage);
router.route('/greenhouse').get(giveGreenhousePage);
router.route('/add_greenhouse').get(addGreenhouse);
router.route('/start_new_measurement').get(startNewMeasurement);
router.route('/store_new_measurement').post(storeNewMeasurement);

// router.route('/push_greenhouse').post(upload.any(), pushGreenhouse);
////////////////////////////////////////////////////////////////////////////////////////////////////////// initializing server
app.listen(port, () => console.log(`App listening to port ${port}`));