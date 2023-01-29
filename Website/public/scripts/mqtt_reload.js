let mqtt;
scripts = document.getElementsByTagName('script');
script = scripts[scripts.length-1];
let greenhouse_id = script.getAttribute('greenhouse_id');
let reconnectionTimeout = 2000;
let host = "test.mosquitto.org";
let port = 8080 ;
let topic = 'GreenhouseMonitor' + greenhouse_id;
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
    location.reload()
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