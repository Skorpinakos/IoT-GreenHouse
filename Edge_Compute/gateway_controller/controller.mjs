//Express.js
import express from 'express'

const app = express(); //make app object
let port ='3000'; //set port
const router = express.Router(); //make a router object



///////////////////////////////////////////////////////////////////////////////////////////////////////////////// backend functions
let give_back = function(req,res){
        res.json({'answer':100})
      };


let update_center =async function(req,res){
        const response = await fetch('http://localhost:3000');
        const data = await response.json();
        
        //console.log(data);
        res.json(data);
      
        };
////////////////////////////////////////////////////////////////////////////////////////////////////////////// express routes
app.use(router);
router.route('/').get(give_back);
router.route('/update').get(give_back);

////////////////////////////////////////////////////////////////////////////////////////////////////////// initializing server
app.listen(port, () => console.log(`App listening to port ${port}`));