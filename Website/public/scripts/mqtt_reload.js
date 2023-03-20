let mqtt;
scripts = document.getElementsByTagName('script');
script = scripts[scripts.length-1];
let greenhouse_id = script.getAttribute('greenhouse_id');
let reconnectionTimeout = 2000;
let host = "test.mosquitto.org";
let port = 8080 ;
let topic = 'GreenhouseMonitor' + greenhouse_id;

window.onload = function(message) {
    var reloading = sessionStorage.getItem("reloading");
    if (reloading) {
        sessionStorage.removeItem("reloading");
        let message = sessionStorage.getItem("measurement_message")
        let close_button = "\n<button type='button' class='btn-close' data-bs-dismiss='alert' aria-label='Close'></button>";
        let alert = "<div class='alert alert-info alert-dismissible fade show' role='alert'>" + message + close_button + "</div>";
        document.getElementById("pop-up message").innerHTML = alert;
        document.getElementById("modal-message").innerHTML = "<p>" + message + "</p>";
        $("#myModal").modal("show")
        sessionStorage.removeItem("measurement_message")
    }
}

function onConnect(){
    mqtt.subscribe(topic);
    console.log('Subscribed to topic ' + topic)
}

function onFailure(){
    console.log("Connection attempt to host " + host + " at port " + port + " failed")
    setTimeout(MQTTconnect, reconnectionTimeout);
}

function onMessageArrived(message){
    console.log("Received message for topic " + message.destinationName + ":\n" + message.payloadString);
    sessionStorage.setItem("reloading", "true");
    sessionStorage.setItem("measurement_message", message.payloadString);
    setTimeout(() => {  document.location.reload(); }, 5000);
    
}

function MQTTconnect(){
    console.log("Connecting to host " + host);
    mqtt = new Paho.MQTT.Client(host,port,'client.js');

    let options = {
        timeout:3,
        onSuccess: onConnect,
        onFailure: onFailure,
    }
    mqtt.onMessageArrived = onMessageArrived;
    mqtt.connect(options);
}

MQTTconnect()