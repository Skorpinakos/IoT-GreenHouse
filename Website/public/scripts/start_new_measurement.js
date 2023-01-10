
let object = document.getElementById("new_button");
object.onclick = function(){
    let ip = document.getElementById("new_button_hidden").textContent;

    fetch('http://localhost:4000/start_new_measurement?IP='+ip).then(response => response.json())
    .then(response => {
        console.log(response);
    });
};