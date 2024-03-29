//Express.js
import express from 'express'

const app = express(); //make app object
let port ='3000'; //set port
const router = express.Router(); //make a router object



///////////////////////////////////////////////////////////////////////////////////////////////////////////////// backend functions
let give_back = function(req,res){
        //res.json({'answer':100});
        res.sendFile("image.png",{ root:"."});
        console.log('sent image')
      };

////////////////////////////////////////////////////////////////////////////////////////////////////////////// express routes
app.use(router);
router.route('/').get(give_back);

////////////////////////////////////////////////////////////////////////////////////////////////////////// initializing server
app.listen(port, () => console.log(`App listening to port ${port}`));