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
let x = parseInt(document.getElementById("x").textContent);
let y = parseInt(document.getElementById("y").textContent);




var img_map = new Image(1100,600);   // Create new img element
img_map.addEventListener('load', function() {
  ctx.drawImage(img_map, 0, 0); //draw map on canvas
  
  //console.log(document.getElementById("coords_to_use_y"));

  
  draw_X(ctx,x,y,30,line_width=4,color='#ff0000');
  console.log(x,y);

  


}, false);
img_map.src = 'images/map_screenshot.png'; //set source path for map png








