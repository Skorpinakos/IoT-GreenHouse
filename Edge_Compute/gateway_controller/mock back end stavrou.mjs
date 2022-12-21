//Express.js
import express from 'express'
import { engine } from 'express-handlebars';

import fetch from 'node-fetch';

const app = express(); //make app object
let port = '3001'; //set port
const router = express.Router(); //make a router object
app.set('view engine', 'handlebars');//Sets our app to use the handlebars engine
//Sets handlebars configurations 
app.use(express.static('public')); //make the 'public' directory public (users can acces it)
app.engine('hbs', engine({ extname: 'hbs' })); //for using 'hbs' file extension instead of 'handlebars'
app.set('view engine', 'hbs'); //set rendering engine the handlebars



///////////////////////////////////////////////////////////////////////////////////////////////////////////////// backend functions
let give_home_page =async function(req,res){
  const response = await fetch('http://localhost:3000');
  const data = await response.json();
  
  //console.log(data);
  res.json(data);
  //res.render("demo",{})

  };

////////////////////////////////////////////////////////////////////////////////////////////////////////////// express routes
app.use(router);
router.route('/').get(give_home_page);

////////////////////////////////////////////////////////////////////////////////////////////////////////// initializing server
app.listen(port, () => console.log(`App listening to port ${port}`));