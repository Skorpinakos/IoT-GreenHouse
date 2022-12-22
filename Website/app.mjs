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
let give_home_page = function(req,res){
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

let give_plant_page = function(req,res){
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

let give_greenhouse_page = function(req,res){
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

let is_it_valid_report= function(report_info){
    if (report_info.hasOwnProperty('fileValidationError')) {
        console.log("image didn't pass validation");
       return false;
    }
    return true; //maybe add validity check later

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

let submit_report = function(req,res){
  let limit=5;
  if ((Date.now()-last_clear_time)>1800000){ips={};}
  let ip=String(req.socket.remoteAddress);
  if (ips[ip]==undefined){ips[ip]=0;}
  ips[ip]=(ips[ip]+1);
  console.log(Date.now()-last_clear_time);
  if (ips[ip]>limit){
    console.log('User made too many reports (' +limit+ ') in the last half hour');
    let error={'e_type':'spam','message':'user made too many reports('+limit+')in the last half hour'};
    res.render('report', {layout : 'layout', buildings : buildings, categories : categories, error:error  });
    return
  }
    if (is_it_valid_report(req)){
        let info = req.body
        let image_path = String(req.files[0].destination) + '/' + String(req.files[0].filename);
        image_path=image_path.replace('public/','');
        model.find_biggest_location_id((err, rows_1) => {   
            if (err){
                console.log('find_biggest_location_id');
                console.log(err.message);
            } 
        let location_info={'id':rows_1[0]['id']+1, 'building':info['building'], 'coordinates_x':info['West'],'coordinates_y': info['North']};
        model.push_location_in_db(location_info,(err, rows_2) => {   
            if (err){
                console.log('push_location_in_db');
                console.log(err.message);
            } 
        model.find_biggest_failure_id((err, rows_3) => {   
            if (err){
                console.log('find_biggest_failure_id');
                console.log(err.message);
            } 
            let now = current_datetime();
            let failure_data={'id':rows_3[0]['id']+1,'ip':ip, 'title':info['title'],'description':info['description'],'creation_date':now,'closure_date':null,'state': 'Υπό επεξεργασία','image_path':image_path,'contact_phone':info['phone'],'contact_email':info['email'],'locale':rows_1[0]['id']+1,'category':info['category']};//change type atribute frome 1 to info['category]
            model.push_failure_in_db(failure_data,(err, rows_4) => {   
                if (err){
                    console.log(err.message);
                } 
                let id_dict_to_pass={'failure_id_passed':failure_data['id']}
                let mailOptions = {
                    from: 'unireportuniversityofpatras@gmail.com',
                    to: String(info['email']),
                    subject: 'Αναφορά βλάβης',
                    text: "Αυτή η απάντηση είναι αυτοματοποιημένη. Η αναφορά σας στην πλατφόρμα 'Uni Report' του Πανεπιστημίου Πατρών καταχωρήθηκε με σειριακό κωδικό: '"+String(failure_data['id'])+"' . Μπορείτε να παρακολουθήσετε την εξέλιξη της βλάβης στην σελίδα της υπηρεσίας εισάγοντας στην γραμμή αναζήτησης τον κωδικό της βλάβης. Τίτλος βλάβης: "+String(failure_data['title']),
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

                res.render('successful_report', {layout : 'layout', id_dict_to_pass:id_dict_to_pass});
                });
            });
        });
    }); 

    }
    else{
        let error={'e_type':'failed application','message':'Η υποβολή ήταν ανεπιτυχής'};
        res.render('report', {layout : 'layout', buildings : buildings, categories : categories, error:error  });

    }

};

let is_empty = function(v){
  if (v.length && v == ''){
    return [1];
  }

  for (let i =0; i < v.length; i++){
    if (v[i] != ''){
      if(Array.isArray(v)){
        return [0,v[i]]
      }
      return [0];
    }
  }
  return [1];
}

let filter = function(body){
  let ticket_info = {};
  let locale_info = {};
  let l = ['building', 'West', 'North'];
  for (let [key, value] of Object.entries(body)) {
    let e = is_empty(value)
    if(e[0]){
      delete body[key];
    }
    else{
      if(l.includes(key)){
        if (key=="West") {key = "coordinates_x"}
        if (key=="North") {key = "coordinates_y"}
        if(e.length == 1){
          locale_info[key] = value;
        }
        else{
          locale_info[key] = e[1];
        }
      }
      else{
        if(e.length == 1){
          ticket_info[key] = value;
        }
        else{
          ticket_info[key] = e[1];
        }
      }
    }
  }
  return {
    'ticket_info': ticket_info,
    'locale_info': locale_info
  };
}



let admin_update = function(req,res){
  let failure_id=req.query['failure_id'];
  let locale_id=req.query['locale_id'];
  let body = req.body;
  let filtered_body = filter(body);
  
  let ticket_info = filtered_body.ticket_info;
  let locale_info = filtered_body.locale_info;
  
  if(ticket_info['state']){
    if(ticket_info['state'] == 'Κλειστή'){
      ticket_info['closure_date'] = current_datetime();
    }
  }
  if(req.files.length > 0){
    let image_path = String(String(req.files[0].destination) + '/' + String(req.files[0].filename));
    image_path=image_path.replace('public/','');
    ticket_info['image_path'] = image_path;
  }
  model.update_report(failure_id, locale_id, ticket_info, locale_info, (err) => {   
    if (err){
      console.log(err.message);
    } 
    res.redirect(String('/admin_page?failure_id=' + failure_id));
  });
};


let contractor_update = function(req,res){
  let failure_id=req.query['failure_id'];
  let locale_id=req.query['locale_id'];
  let key=req.query['key'];
  let body = req.body;
  let filtered_body = filter(body);
  
  let ticket_info = filtered_body.ticket_info;
  let locale_info = filtered_body.locale_info;
  
  if(ticket_info['state']){
    if(ticket_info['state'] == 'Κλειστή'){
      ticket_info['closure_date'] = current_datetime();
    }
  }
  model.update_report(failure_id, locale_id, ticket_info, locale_info, (err) => {   
    if (err){
      console.log(err.message);
    } 
    res.redirect(String('/contractor_page?input_text=' + key));
  });



};

let delete_report = function(req,res){
  let information='Βλάβες με χρονολογική σειρά'
  let failure_id=req.query['failure_id'];
      model.delete_report(failure_id, (err, rows) => {   
          if (err){
              console.log(err.message);
          }
          res.render('admin_history', {layout : 'layout', search_results:rows,information:information});
      });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////// express routes
app.use(router);
router.route('/').get(give_home_page);
router.route('/greenhouses').get(giveClientGreenhouses);
router.route('/plant').get(give_plant_page);
router.route('/greenhouse').get(give_greenhouse_page);
router.route('/report_complete').post(upload.any(), submit_report);
router.route('/contractor_update').post(upload.any(),contractor_update);
router.route('/admin_update').post(upload.any(),admin_update);
router.route('/delete_report').post(delete_report);
////////////////////////////////////////////////////////////////////////////////////////////////////////// initializing server
app.listen(port, () => console.log(`App listening to port ${port}`));