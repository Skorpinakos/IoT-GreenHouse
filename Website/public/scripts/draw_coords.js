function draw_X(id,ctx,x,y,size,line_width=2,color='#ff0000') { //function for drawing X on canvas
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

    ctx.font = '27px serif';
    ctx.fillText(id, x+25, y+25);
  
  
    return 0
  }
  
  
  var c = document.getElementById("myCanvas");
  var ctx = c.getContext("2d");
  let coords=[{"id":12,"x":100,"y":112},{"id":35,"x":210,"y":500},{"id":69,"x":700,"y":68},{"id":72,"x":400,"y":300},{"id":158,"x":30,"y":190},{"id":167,"x":400,"y":60},{"id":184,"x":590,"y":270}];
  
  
  
  
  var img_map = new Image(835,635);   // Create new img element
  img_map.addEventListener('load', function() {
    ctx.drawImage(img_map, 0, 0); //draw map on canvas
    
    //console.log(document.getElementById("coords_to_use_y"));
    let j=0;
    for(j=0;j<coords.length;j++){
        x=coords[j].x;
        y=coords[j].y;
        id=coords[j].id;
        draw_X(id,ctx,x,y,30,line_width=4,color='#ffff00');
        console.log(x,y);
    }

  
    
  
  
  }, false);
  img_map.src = 'images/image.png'; //set source path for map png

  function getMousePosition(c, event) { //this function (like the code bellow it) has no place here, it just logs clicks on the map
    let threshold=25;
    let rect = c.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    let coords=[{"id":12,"x":100,"y":112},{"id":35,"x":210,"y":500},{"id":69,"x":700,"y":68},{"id":72,"x":400,"y":300},{"id":158,"x":30,"y":190},{"id":167,"x":400,"y":60},{"id":184,"x":590,"y":270}];
  
  
    console.log("Coordinate x: " + x,"Coordinate y: " + y);

      
  
      open_failures=coords;
      let diff_array=[];
      for(let i=0; i<open_failures.length;i++){
        diff_array.push({'id':open_failures[i]['id'],'diff':Math.sqrt((Math.pow((open_failures[i]['x']-x),2)+Math.pow((open_failures[i]['y']-y),2)))}); // store in an array the distances between 
        //each displayed failure and the click
      };
      diff_array.sort(function(a, b){return a['diff'] - b['diff']});
      if (diff_array[0]['diff']<threshold){
        let clicked_failure=diff_array[0]['id'];
        location.assign('/greenhouse?ID='+clicked_failure);
  
      }}
  
  let canvasElem = document.querySelector("canvas");
  
  canvasElem.addEventListener("mousedown", function(e)
  {
    getMousePosition(canvasElem, e);
  });