function draw_X(ctx,x,y,size,line_width=2,color='#ff0000') { //function for drawing X on canvas
    //set line width
    ctx.lineWidth = line_width;

    // set line color
    ctx.strokeStyle = color;
    ctx.beginPath()
    ctx.moveTo(x-(size/2), y-(size/2));
    ctx.lineTo(x+(size/2), y+(size/2));
    ctx.stroke();

    ctx.moveTo(x+(size/2), y-(size/2));
    ctx.lineTo(x-(size/2), y+(size/2));
    ctx.stroke();


    return 0
  }


var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");




var img_map = new Image(1100,600);   // Create new img element
img_map.addEventListener('load', function() {
  ctx.drawImage(img_map, 0, 0); //draw map on canvas
  fetch('http://localhost:3000/open_failures').then(response => response.json())//fetch list of open failures coordinates from rest api
  .then(response => {
    
    //console.log(response['open_failures']);
    open_failures=response['open_failures']; //list of dictionaires , looks like [{'x':100,'y',200},{'x':700,'y',400},...]
    //draw_X(ctx,100,100,25);
    //console.log(open_failures.length);
    for(let i=0; i<open_failures.length;i++){
        //console.log(open_failures[i]['x']);
        draw_X(ctx,open_failures[i]['coordinates_x'],open_failures[i]['coordinates_y'],12,line_width=2,color='#ffa500');  //for each failure draw an X on the map
    };
    
  });
  


}, false);
img_map.src = 'images/map_screenshot.png'; //set source path for map png






/*var map_info = document.getElementById("Map");*/

function getMousePosition(c, event) { //this function (like the code bellow it) has no place here, it just logs clicks on the map
  let rect = c.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  x=Math.round(x)
  y=Math.round(y)
  console.log("Coordinate x: " + x,"Coordinate y: " + y);
  ctx.clearRect(0,0,1100,600);
  let img_to_draw = document.getElementById("load_it");
  ctx.drawImage(img_to_draw, 0, 0);
  //console.log(response['open_failures']);
  fetch('http://localhost:3000/open_failures').then(response => response.json())//fetch list of open failures coordinates from rest api
  .then(response => {
    
    //console.log(response['open_failures']);
    open_failures=response['open_failures']; //list of dictionaires , looks like [{'x':100,'y',200},{'x':700,'y',400},...]
    //draw_X(ctx,100,100,25);
    //console.log(open_failures.length);
    for(let i=0; i<open_failures.length;i++){
        //console.log(open_failures[i]['x']);
        draw_X(ctx,open_failures[i]['coordinates_x'],open_failures[i]['coordinates_y'],12,line_width=2,color='#ffa500');  //for each failure draw an X on the map
    };
    
  });


  draw_X(ctx,x,y,20,line_width=2,color='#ff0000');
  let elem1 = document.getElementById('North');
  elem1.value=y;
  let elem2 = document.getElementById('West');
  elem2.value=x;
  
}

let canvasElem = document.querySelector("canvas");

canvasElem.addEventListener("mousedown", function(e)
{
  getMousePosition(canvasElem, e);
});