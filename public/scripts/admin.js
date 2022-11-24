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
  ctx.drawImage(img_map, 0, 0); //draw map on canvas                        //////////
  fetch('http://localhost:3000/failure_coordinates_by_id?failure_id='+String(document.getElementById("f_id").textContent)).then(response => response.json())//fetch list of open failures coordinates from rest api
  .then(response => {
    
    
    old_x=response['coordinates_x']; 
    old_y=response['coordinates_y']; 
    draw_X(ctx,old_x,old_y,20,line_width=2,color='#ffa500');
    ctx.font = '17px serif';
    ctx.fillText('Νύν τοποθεσία', old_x-40, old_y+25);
    
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
  //console.log("Coordinate x: " + x,"Coordinate y: " + y);
  ctx.clearRect(0,0,1100,600);
  let img_to_draw = document.getElementById("load_it");
  ctx.drawImage(img_map, 0, 0); //draw map on canvas                        //////////
  fetch('http://localhost:3000/failure_coordinates_by_id?failure_id='+String(document.getElementById("f_id").textContent)).then(response => response.json())//fetch list of open failures coordinates from rest api
  .then(response => {
    
    
    old_x=response['coordinates_x']; 
    old_y=response['coordinates_y']; 
    draw_X(ctx,old_x,old_y,20,line_width=2,color='#ffa500');
    ctx.font = '17px serif';
    ctx.fillText('Νύν τοποθεσία', old_x-40, old_y+25);

    

    
  });


  draw_X(ctx,x,y,20,line_width=2,color='#ff0000');
  ctx.font = '17px serif';
  ctx.fillText('Νέα τοποθεσία', x-40, y+25);
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