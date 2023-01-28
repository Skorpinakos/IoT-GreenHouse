let button = document.getElementById("measurement_trigger");
scripts = document.getElementsByTagName('script');
script = scripts[scripts.length-1];
let ip = script.getAttribute('ip');
button.onclick = function(){
    fetch('http://localhost:4000/start_new_measurement?IP='+ip).then(response => response.text())
    .then(response => {
        console.log(document.getElementById("pop-up message").innerHTML);
        document.getElementById("pop-up message").innerHTML = "<div class='alert alert-info' role='alert'>" + response+ "</div>";
    });
};