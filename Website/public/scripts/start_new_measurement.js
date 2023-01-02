//hi

let object = document.getElementById("new_button");
object.onclick = function(){
    console.log("i was clicked!");
    let my_ip = document.getElementById("new_button_hidden").textContent;

    fetch('http://localhost:4000/start_new_measurement?IP='+my_ip).then(response => response.json())//fetch list of open failures coordinates from rest api
    .then(response => {
        console.log(response);
    });
};