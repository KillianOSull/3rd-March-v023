//MQTT broker dashboard available at 	http://www.hivemq.com/demos/websocket-client/

//the code assumes that the setup for the peripheral of interest is as follows: 
//***LED service : uuid startw with a000, with read and write characteristic uuid starts with a001
//***accel service : uuid starts with a012, with read chars uuids start wtih a013, a014, a015
//***button A service : uuid starts with ieee, read and notify char uuid starts with 2019

//code to read listen for a button A press, send it to the topic, topicToPublishTo & listen for commands from topic, topicToSubscribeTo
//simulating e.g. hand sanitiser dispenser button, counting nof times dispenser has been used, command to turn LED on when nof times exceeds a certain value
//button B press resets the counter for the dispenser


const deviceOfInterest = 'CC:0C:27:E4:90:EC'						//mac address of device

const serviceOfInterestUuid = '00000001-0002-0003-0004-000000000000' 			//uuid of accel service
const characteristicOfInterestUuid = '00000001-0002-0003-0004-000000000006' 		//uuid of read/write characteristic of y accel service

const notifyServiceOfInterestUuid = '00000001-0002-0003-0004-000000002000' 		//uuid of button service
const notifyCharacteristicOfInterestUuid = '00000001-0002-0003-0004-000000002001' 	//uuid of read/notify characteristic of button A service
const notifyCharacteristic2OfInterestUuid = '00000001-0002-0003-0004-000000002002' 	//uuid of read/notify characteristic of button B service

const actuatorServiceOfInterestUuid = '00000001-0002-0003-0004-000000003000' 		//uuid of LED service
const actuatorCharacteristicOfInterestUuid = '00000001-0002-0003-0004-000000003001' 	//uuid of read/write characteristic of LED service


var actuatorChar;									//variable actuatorChat
var notifyChar;										//variable notifychar
var button_press_count;									//variable button_press_count
var choice = 0;
var services;										//variable choice

//MQTT events and handlers
mqttClient.on('connect', connectCallback); 						//when a 'connect' event is received call the connectCallback listener function
        
													//error checking for subscribing to topic

function writeDataCallback(error, data) { 
	if (error) {
		console.log("error writing data");
	} else {	
		//disconnect the central device from the peripheral device
		//peripheralGlobal.disconnect(disconnectCallback); //this should not be called until all characteristics for a service have been read/written to
		//if the program is terminated manually enter the command 'sudo service bluetooth restart' to disconnect the peripheral
    }
}

														//this callback function is called when a message has been published to the broker

const main = async() => { 											//main function
														//async function main () {
  	const {createBluetooth}=require('node-ble') 								//nodejs ble module/library
  	const { bluetooth, destroy } = createBluetooth()
														//get bluetooth adapter
  	const adapter = await bluetooth.defaultAdapter() 							//get an available Bluetooth adapter
  	await adapter.startDiscovery() 										//using the adapter, start a device discovery session  
  	console.log('discovering')										//prints on command line
  														//look for a specific device 
  	const device = await adapter.waitDevice(deviceOfInterest)						//usese devices specified mac addess from top of programme
  	console.log('got device', await device.getAddress())							//await device.getAddress())
  	const deviceName = await device.getName()								//gets the name of the device
  	console.log('got device remote name', deviceName)							//prints on command line
  	console.log('got device user friendly name', await device.toString())					//prints on command line	

  	await adapter.stopDiscovery() 										//stops looking for devices
  	console.log("Stopping Discovery")
  														//connect to the specific device
  	device.connect()											//connects to specified device
  	console.log("connected to device : " + deviceName)							//prints on command line
  
  	const gattServer = await device.gatt()										//gets the generic attributes of the device
  	const services = gattServer,(deviceOfInterest)									//gets the services of the device
  	console.log("services are " + gattServer)									//prints on command line

if (services.includes(actuatorServiceOfInterestUuid)) { 							//uuid of LED service
  	console.log('got the LED service')									//prints on command line
  	 const primaryActuatorService = await gattServer.getPrimaryService(actuatorServiceOfInterestUuid)	
	 actuatorChar = await primaryActuatorService.getCharacteristic(actuatorCharacteristicOfInterestUuid)  	//uuid of read/write characteristic of LED service
}
if (services.includes(serviceOfInterestUuid)) { 								//uuid of accel service
	console.log('got the Accel service')									//prints on command line
	
}														
if (services.includes(notifyServiceOfInterestUuid)) { 								//uuid of notify service
	console.log('got the button service')
	
}




	
								//looks for messages coming from the broker

async function messageEventHandler(topic, message, packet) { 							//function for messages, packets or topics
    //console.log("Received message'" + message + "' on topic '" + topic + "'");
	if (message.toString().toLowerCase() == "on") { 							//message from broker is 'on' (not case sensitive)
		//writeChar.write(new Buffer.from([1]), false, writeDataCallback); //turn LED on 
		console.log("command received from MQTT broker to turn LED on");				//prints on command line
		mqttClient.publish(topicToPublishTo, 'command received from MQTT broker to turn LED on', publishCallback); // publish a message to the topic specified above
		await actuatorChar.writeValue(Buffer.from([0x31]))						//writes 0x31 to the microbit over the LED service

	} 													
	else if(message.toString().toLowerCase() == "commands"){						//message from broker is 'commands' (not case sensitive)
		mqttClient.publish(topicToPublishTo, 'Commands are as follows:', publishCallback);			// publish a message to the topic specified above
  		mqttClient.publish(topicToPublishTo, '- Enter "on" to turn the LEDs on', publishCallback);		// publish a message to the topic specified above
  		mqttClient.publish(topicToPublishTo, '- Enter "off" to turn the LEDs off', publishCallback);		// publish a message to the topic specified above
  		mqttClient.publish(topicToPublishTo, '- Enter "read" to read the Y accel value', publishCallback);	// publish a message to the topic specified above		
  		mqttClient.publish(topicToPublishTo, '- Enter "stop" to stop reading the Y accel value', publishCallback);// publish a message to the topic specified above
  		mqttClient.publish(topicToPublishTo, '- Enter "exit" to exit the programme', publishCallback);		// publish a message to the topic specified above
		console.log("Enter 'on' to turn the LED's on")							//prints on command line
		console.log("Enter 'off' to turn the LED's off")						//prints on command line
		console.log("Enter 'read' to read the Y accel value")						//prints on command line
		console.log("Enter 'stop' to stop reading the Y accel value")					//prints on command line
		console.log("Enter 'exit' to exit the programme")						//prints on command line
	}
	else if(message.toString().toLowerCase() == "off"){							//message from broker is 'off' (not case sensitive)
		//writeChar.write(new Buffer.from([0]), false, writeDataCallback);
		console.log("command received from MQTT broker to turn LED off");				//prints on command line
		mqttClient.publish(topicToPublishTo, 'command received from MQTT broker to turn LED off', publishCallback);
		await actuatorChar.writeValue(Buffer.from([0x32]))						//writes 0x32 to the microbit over the LED service
	}
	else if(message.toString().toLowerCase() == "exit"){							//message from broker is 'exit' (not case sensitive)
		for(let i = 0; i < 2; i++){									//repeat whats in the curly brackets 2 times
			await actuatorChar.writeValue(Buffer.from([0x31]))					//writes 0x31 to the microbit over the LED service
			await actuatorChar.writeValue(Buffer.from([0x32]))					//writes 0x32 to the microbit over the LED service
		}
		console.log("Command received from MQTT broker: Exiting programme");				//prints on command line
		mqttClient.publish(topicToPublishTo,"Command received from MQTT broker: Exiting programme", publishCallback);
		await device.disconnect()									//disconnects from device
  		console.log('disconnected')									//prints on command line
		process.exit()											//exits the process
	}
	else if(message.toString().toLowerCase() == "read"){							//message from broker is 'read' (not case sensitive)
		choice = 1;											//setting choice value to 1					
		if (services.includes(serviceOfInterestUuid)) { 						//uuid of notify service
	  										
	  		const primaryService = await gattServer.getPrimaryService(serviceOfInterestUuid)
			chars = await primaryService.characteristics()						//uuid of read/write characteristic of Accel service
			console.log("the service characteristics are : " + chars)				//prints on command line
        		console.log("uuid of characteristic of interest is : " + characteristicOfInterestUuid)	//prints on command line
			charact = await primaryService.getCharacteristic(characteristicOfInterestUuid)		//uuid of read/write characteristic of Accel service
			console.log("characteristic flags are : " + await charact.getFlags())
			console.log("the service characteristics for ACCEL are : " + chars)
			while(choice == 1)									//do while choice is 1
			{
				cval = await charact.readValue()						//read value from charastric
				mqttClient.publish(topicToPublishTo, "characteristic value is : " + cval.toString('hex'), publishCallback) //publish hex accel value	
	 		}
		}		
	}
	else if(message.toString().toLowerCase() == "stop"){							//message from broker is 'stop' (not case sensitive)
	  				mqttClient.publish(topicToPublishTo, 'Notifications from Accel service are stopping!', publishCallback);
	  				console.log("Notifications from Accel service are stopping!")				//prints on command line
	  				choice = 0;								//sets choice = 0 breaking out of while loop
	}	
	else{
		mqttClient.publish(topicToPublishTo, 'INVALID command received from MQTT broker, enter "commands" to see all commands', publishCallback);
		console.log("INVALID command received from MQTT broker, enter 'commands' to see all commands");	//if user enters anything bar previous commands
		for(let i = 0; i < 5; i++){								//repeat whats in the curly brackets 5 times
			await actuatorChar.writeValue(Buffer.from([0x31]))				//writes 0x31 to the microbit over the LED service
			await actuatorChar.writeValue(Buffer.from([0x32]))				//writes 0x32 to the microbit over the LED service
		}		
	}
   }
   
  
}
main()
  .then()
  .catch(console.error)
