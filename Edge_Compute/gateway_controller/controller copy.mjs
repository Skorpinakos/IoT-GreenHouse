//Express.js
import express from 'express'
import { engine } from 'express-handlebars';

const app = express(); //make app object
let port = process.env.PORT || '3000'; //set port
const router = express.Router(); //make a router object



app.set('view engine', 'handlebars');//Sets our app to use the handlebars engine
//Sets handlebars configurations 
app.use(express.static('public')); //make the 'public' directory public (users can acces it)
app.engine('hbs', engine({ extname: 'hbs' })); //for using 'hbs' file extension instead of 'handlebars'
app.set('view engine', 'hbs'); //set rendering engine the handlebars



///////////////////////////////////////////////////////////////////////////////////////////////////////////////// backend functions
let give_home_page = function(req,res){
    //Serves the main page
    let displayedRecents = 6;

        //console.log('Recents', rows)
        res.json({'answer':100})
      };

////////////////////////////////////////////////////////////////////////////////////////////////////////////// express routes
app.use(router);
router.route('/').get(give_home_page);

////////////////////////////////////////////////////////////////////////////////////////////////////////// initializing server
app.listen(port, () => console.log(`App listening to port ${port}`));