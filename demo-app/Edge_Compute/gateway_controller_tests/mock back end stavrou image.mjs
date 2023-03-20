//Express.js
import express from 'express'
import { engine } from 'express-handlebars';

import fetch from 'node-fetch';

import fs from "fs";
//import fetch from "node-fetch";
//import fileType from "file-type";

const app = express(); //make app object
let port = '3001'; //set port
const router = express.Router(); //make a router object
app.set('view engine', 'handlebars');//Sets our app to use the handlebars engine
//Sets handlebars configurations 
app.use(express.static('public')); //make the 'public' directory public (users can acces it)
app.engine('hbs', engine({ extname: 'hbs' })); //for using 'hbs' file extension instead of 'handlebars'
app.set('view engine', 'hbs'); //set rendering engine the handlebars



///////////////////////////////////////////////////////////////////////////////////////////////////////////////// backend functions
let give_image_to_user= async function savePhotoFromAPI(req,res) {
  const response = await fetch('http://localhost:3000');
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  //const fileType = await fileType.fromBuffer(buffer);
  if (1) {
      const outputFileName = `example_received.png`
      fs.createWriteStream(outputFileName).write(buffer);
  } else {
      console.log('File type could not be reliably determined! The binary data may be malformed! No file saved!')
  }
}

let give_home_page =async function(req,res){
  const response = await fetch('http://localhost:3000');
  const data = await response.blob();
  //const imageObjectURL = URL.createObjectURL(data);
  
  //console.log(data);
  console.log(data);
  //res.render("demo",{})

  };

////////////////////////////////////////////////////////////////////////////////////////////////////////////// express routes
app.use(router);
router.route('/').get(give_image_to_user);

////////////////////////////////////////////////////////////////////////////////////////////////////////// initializing server
app.listen(port, () => console.log(`App listening to port ${port}`));