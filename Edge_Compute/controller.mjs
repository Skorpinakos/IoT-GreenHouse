//Express.js
import express, { query } from 'express'
import fs from 'fs'
import {spawn} from 'child_process';

const app = express(); //make app object
let port ='3000'; //set port
const router = express.Router(); //make a router object


let inform_db = function(datetime){

  let rawdata = fs.readFileSync('greenhouse_config.json');
  let greenhouse_config = JSON.parse(rawdata);

  rawdata = fs.readFileSync('images/measurements/measurement_at_'+datetime+'/data.json');
  let data_to_send = JSON.parse(rawdata);

  fetch(greenhouse_config['server_url']+'/new_measurement', {
    method: 'POST',
    body: JSON.stringify(data_to_send),
    headers: { 'Content-Type': 'application/json' }
    });
    console.log('Posted the data.json from measurement at '+datetime);
}

let get_datetime = function(){
  let date_ob = new Date();

  // current date
  // adjust 0 before single digit date
  let date = ("0" + date_ob.getDate()).slice(-2);

  // current month
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

  // current year
  let year = date_ob.getFullYear();

  // current hours
  let hours = date_ob.getHours();

  // current minutes
  let minutes = date_ob.getMinutes();

  // current seconds
  let seconds = date_ob.getSeconds();

  // prints date in YYYY-MM-DD format
  //console.log(year + "-" + month + "-" + date);

  // prints date & time in YYYY-MM-DD HH:MM:SS format
  return (year + "_" + month + "_" + date + "_" + hours + "_" + minutes + "_" + seconds);

  // prints time in HH:MM format
  //console.log(hours + ":" + minutes);
}

let start_greenhouse_measurement = function(req,res){
  console.log("A new measurement was requested.");
  fs.readFile('images/measurements/active_measurement.txt', 'utf8', function (err,activity) { //read the file containing the datetime of the active measurement or nothing
    
    if (err) {
      let failure = err;
      res.statusCode = 503;
      res.send(failure);
      return console.error(failure);
    }
    if (activity!=''){ 
      let failure ='There is already an on-goig measurement from  '+activity;
      res.statusCode = 406;
      res.send(failure);
      return console.error(failure);
    }
    //if no measurement under process start new
    let datetime=get_datetime();
    fs.writeFile('images/measurements/active_measurement.txt', datetime, err => {   //write at the file containing activity to indicate that a measurement is under process
      if (err) {
        let failure = err;
        res.statusCode = 507;
        res.send(failure);
        return console.error(failure);
      }
      let ingestion_controller_output;
      // spawn new child process to call the python_process script
      let python_process = spawn('python', ['fake_data.py',datetime]);
      console.log('No on-going measurement, starting new.');
      res.statusCode = 200;
      res.send('A new measurement has started at '+datetime);
      // collect data from script
      python_process.stdout.on('data', function (data) {
       //console.log('Pipe data from python_process script ...');
       ingestion_controller_output=(data.toString());
       
      });
      // in close event we are sure that stream from child process is closed
      python_process.on('close', (code) => {
        
      console.log(ingestion_controller_output);
      console.log(`child process close all stdio with code ${code}`);

      fs.writeFile('images/measurements/active_measurement.txt', '', err => {
        if (err) {
          let failure = err;
          res.statusCode = 507;
          res.send(failure);
          return console.error(failure);
        }
        fs.writeFile('images/measurements/last_measurement.txt', "measurement_at_"+datetime, err => {
          if (err) {
            let failure = err;
            res.statusCode = 507;
            res.send(failure);
            return console.error(failure);
          }
          // measurement has finished, have to inform the db with fetch api 
          inform_db(datetime);
        });
      });

      });
    });
    



  });

};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////// backend functions
let give_recent_photo = function(req,res){
  //console.log(req);
       
        
        fs.readFile('images/measurements/last_measurement.txt', 'utf8', function (err,last_measurement) { //read the file containing the name of the last measurement folder
          if (err) {
            let failure = err;
            res.statusCode = 503;
            res.send(failure);
            return console.error(failure);
          }
          if (last_measurement==''){
            let failure ='No measurements yet.';
            res.statusCode = 406;
            res.send(failure);
            return console.error(failure);
          }
          //console.log(last_measurement); 
          let x=req['query']['x'];
          let y=req['query']['y'];
          //console.log(x)
          let plant_path='images/measurements/'+last_measurement+'/plant_images_of_x'+x+'_y'+y+'/' ; // use req information and last measurement to configure the path of the plant measurement requested
          if(fs.existsSync('./'+plant_path)==false){
            
            let failure= 'This plant has not been registered yet, either it does not exist in this greenhouse or no measurements have been made yet.'
            res.statusCode = 406;
            res.send(failure);
            return console.error(failure);

          }
          else{
          fs.readdir(plant_path, (err, files) => {
            let folder_files=[];
            files.forEach(file => {
              //console.log(file);
              folder_files.push(file);
            });
            if (folder_files.length==0){
              let failure = 'No photos of that plant in the last measurement';
              res.statusCode = 406;
              res.send(failure);
              return console.error(failure)
            }
            let index = Math.floor(folder_files.length/2);
            let filename=folder_files[index];
            res.sendFile(plant_path+filename,{ root:"."});
            console.log('sent image from '+plant_path+filename);
            res.statusCode = 200;
          });
        };

        });
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////// express routes
app.use(router);
router.route('/get_recent_photo').get(give_recent_photo);
router.route('/start_greenhouse_measurement').get(start_greenhouse_measurement);


////////////////////////////////////////////////////////////////////////////////////////////////////////// initializing server
app.listen(port, () => console.log(`App listening to port ${port}`));