let button = document.getElementById("measurement_trigger");
scripts = document.getElementsByTagName('script');
script = scripts[scripts.length-1];
let ip = script.getAttribute('ip');
button.onclick = function(){
    try{
        fetch('http://localhost:4000/start_new_measurement?IP='+ip).then(response => response.text())
        .then(response => {
            console.log(document.getElementById("pop-up message").innerHTML);
            let close_button = "\n<button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button>";
            let alert = "<div class='alert alert-info alert-dismissible fade show' role='alert'>" + response + close_button + "</div>";
            document.getElementById("pop-up message").innerHTML = alert;
        });
    }
    catch(err){
        console.log("Frontend failed to initiate measurement for greenhouse with IP " + ip +" or to inform the user with a pop-up message.\n" + err)
    }
};