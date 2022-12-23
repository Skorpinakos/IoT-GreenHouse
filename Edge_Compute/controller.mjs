//Express.js
import express, { query } from 'express'
import fs from 'fs'

const app = express(); //make app object
let port ='3000'; //set port
const router = express.Router(); //make a router object



///////////////////////////////////////////////////////////////////////////////////////////////////////////////// backend functions
let give_recent_photo = function(req,res){
  //console.log(req);
       
        
        fs.readFile('images/measurements/last_measurement.txt', 'utf8', function (err,last_measurement) { //read the file containing the name of the last measurement folder
          if (err) {
            return console.log(err);
          }
          if (last_measurement==''){
            return console.log('no measurements yet');
          }
          //console.log(last_measurement); 
          let x=req['query']['x'];
          let y=req['query']['y'];
          //console.log(x)
          let plant_path='images/measurements/'+last_measurement+'/plant_images_of_x'+x+'_y'+y+'/' ; // use req information and last measurement to configure the path of the plant measurement requested
          
          fs.readdir(plant_path, (err, files) => {
            let folder_files=[];
            files.forEach(file => {
              //console.log(file);
              folder_files.push(file);
            });
            if (folder_files.length==0){
              return console.log('no photos of that plant in the last measurement')
            }
            let index = Math.floor(folder_files.length/2);
            let filename=folder_files[index];
            res.sendFile(plant_path+filename,{ root:"."});
            console.log('sent image from '+plant_path+filename);
          });

        });


        //
        //console.log('sent image')
      };

////////////////////////////////////////////////////////////////////////////////////////////////////////////// express routes
app.use(router);
router.route('/get_recent_photo').get(give_recent_photo);


/////
//give_recent_photo({'x':'4','y':'28'},{});
/////
////////////////////////////////////////////////////////////////////////////////////////////////////////// initializing server
app.listen(port, () => console.log(`App listening to port ${port}`));