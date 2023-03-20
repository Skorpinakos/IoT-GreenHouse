//Express.js
import express, { query } from 'express'
import bodyParser from 'body-parser'

const app = express(); //make app object
let port ='4000'; //set port
const router = express.Router(); //make a router object
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let handle_new_data = function(req,res){
    console.log(req.body);
    res.statusCode=200;
    res.send("Received package.");
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////// express routes
app.use(router);
router.route('/store_new_measurement').post(handle_new_data);


////////////////////////////////////////////////////////////////////////////////////////////////////////// initializing server
app.listen(port, () => console.log(`App listening to port ${port}`));