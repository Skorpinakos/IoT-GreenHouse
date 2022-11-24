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

function draw_sub(ctx,x,y,color_dict,margin) {
  draw_X(ctx,1075+x,546+y,12,line_width=2,color=color_dict['Υπό επισκευή']);
  ctx.font = '17px serif';
  ctx.fillText('Υπό επισκευή', 945, 550);
  draw_X(ctx,1075+x,546+y+margin,12,line_width=2,color=color_dict['Ανοιχτή']);
  ctx.font = '17px serif';
  ctx.fillText('Ανοιχτή', 945, 550+margin);
  draw_X(ctx,1075+x,546+y+margin*2,12,line_width=2,color=color_dict['Επιβεβαιωμένη']);
  ctx.font = '17px serif';
  ctx.fillText('Επιβεβαιωμένη', 945, 550+margin*2);
  draw_X(ctx,1075+x,546+y+margin*3,12,line_width=2,color=color_dict['Υπό επεξεργασία']);
  ctx.font = '17px serif';
  ctx.fillText('Υπό επεξεργασία', 945, 550+margin*3);
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
    open_failures=response['open_failures']; //list of dictionaires , looks like [{'id':1,'x':100,'y',200},{'x':700,'y',400},...]
    //draw_X(ctx,100,100,25);
    //console.log(open_failures.length);
    

    let color_dict={'Υπό επισκευή':'#00FF00','Ανοιχτή':'#FF8C00','Επιβεβαιωμένη':'#0096FF','Υπό επεξεργασία':'#FF0000'};
    for(let i=0; i<open_failures.length;i++){
        //console.log(open_failures[i]['x']);
        let status = open_failures[i]['state'];
        let color_hex=color_dict[status];
        draw_X(ctx,open_failures[i]['coordinates_x'],open_failures[i]['coordinates_y'],12,line_width=2,color=color_hex);  //for each failure draw an X on the map

    };

    draw_sub(ctx,0,0,color_dict,15);
  });
  


}, false);
img_map.src = 'images/map_screenshot.png'; //set source path for map png






/*var map_info = document.getElementById("Map");*/

function getMousePosition(c, event) { //this function (like the code bellow it) has no place here, it just logs clicks on the map
  let threshold=20;
  let rect = c.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  console.log("Coordinate x: " + x,"Coordinate y: " + y);
  fetch('http://localhost:3000/open_failures').then(response => response.json())//fetch list of open failures coordinates from rest api
  .then(response => {
    

    open_failures=response['open_failures']; //list of dictionaires , looks like [{'id':1,'x':100,'y',200},{'x':700,'y',400},...]
    let diff_array=[];
    for(let i=0; i<open_failures.length;i++){
      diff_array.push({'id':open_failures[i]['id'],'diff':Math.sqrt((Math.pow((open_failures[i]['coordinates_x']-x),2)+Math.pow((open_failures[i]['coordinates_y']-y),2)))}); // store in an array the distances between 
      //each displayed failure and the click
    };
    diff_array.sort(function(a, b){return a['diff'] - b['diff']});
    if (diff_array[0]['diff']<threshold){
      let clicked_failure=diff_array[0]['id'];
      location.assign('/failure?failure_id='+clicked_failure);

    }else{
      return 
    }
  })
}

let canvasElem = document.querySelector("canvas");

canvasElem.addEventListener("mousedown", function(e)
{
  getMousePosition(canvasElem, e);
});