


//********************************************************BT-UUID-of-services-in-microbit***********************************************************************//
//												//								//
const buttonServiceOfInterestUuid = '00000001-0002-0003-0004-000000002000' 			//uuid of button service					//
const buttonACharacteristicOfInterestUuid = '00000001-0002-0003-0004-000000002001' 		//uuid of read/notify characteristic of button A service	//
const buttonBCharacteristicOfInterestUuid = '00000001-0002-0003-0004-000000002002' 		//uuid of read/notify characteristic of button B service	//
//												//								//
const counterServiceOfInterestUuid = '00000001-0002-0003-0004-000000004000' 			//uuid of counter service					//
const unlockCounterCharacteristicOfInterestUuid = '00000001-0002-0003-0004-000000004001'	//uuid of read/notify characteristic of counter			//
const lockCounterCharacteristicOfInterestUuid = '00000001-0002-0003-0004-000000004002' 		//uuid of read/notify characteristic of counter			//
//												//								//
const codeServiceOfInterestUuid = '00000001-0002-0003-0004-000000005000' 			//uuid of code service						//
const unlockCodeCharacteristicOfInterestUuid = '00000001-0002-0003-0004-000000005001' 		//uuid of read/notify characteristic of code			//
const lockCodeCharacteristicOfInterestUuid = '00000001-0002-0003-0004-000000005002' 		//uuid of read/notify characteristic of code			//
//												//								//
//********************************************************BT-UUID-of-services-in-microbit***********************************************************************//

//********************************************************BLE OPTIONS AND CONNECTING TO A DEVICE************************************************//
const deviceOfInterest = 'CC:0C:27:E4:90:EC'					//mac address of device		
const magLockOfInterest = 'D0:0C:89:48:AC:D0'				//
										//								//
const main = async() => { 							//main function							//
console.log('||      NODEJS     	||	Start of programme')		//prints on console						//
//mqttClient.on('message', messageEventHandler);				//handeling messages from mqtt broker				//
										//								//
										//								//
  	const {createBluetooth}=require('node-ble') 				//nodejs ble module/library					//
  	const { bluetooth, destroy } = createBluetooth()			//get bluetooth adapter						//
  	const keyadapter = await bluetooth.defaultAdapter() 			//get an available Bluetooth adapter				//
  	//if(!await adapter.isDiscovering()){					//								//
  	await keyadapter.startDiscovery() 						//using the adapter, start a device discovery session  		//
  	//}									//								//
  	console.log('||      NODEJS     	||	Discovering for Key')		//prints on command line					//
  										//								//
  	key = await keyadapter.waitDevice(deviceOfInterest)			//usese devices specified mac addess from top of programme	//
  	console.log('||      NODEJS     	||	got device', await key.getAddress())			//await device.getAddress())	//
  	const keyName = await key.getName()				//gets the name of the device					//
  	console.log('||      NODEJS     	||	got device remote name', keyName)			//prints on command line	//
  	console.log('||      NODEJS     	||	got device user friendly name', await key.toString())	//prints on command line//
  	console.log('||      NODEJS     	||	Device: [', keyName , '] is within range')		//prints on command line	//
										//								//
  	await keyadapter.stopDiscovery() 						//stops looking for devices					//
  	console.log("||      NODEJS     	||	Stopping Discovery")					//prints on command line	//
  										//								//
  	await key.connect()							//connect to the specific device				//
  	console.log("||      NODEJS     	||	Connected to device: " + keyName)			//prints on command line	//
  										//								//
  	const keyGattServer = await key.gatt()					//for recieving GATT services					//
  	keyServices = await keyGattServer.services()					//for getting the serices					//
	console.log("||      NODEJS     	||	services are " + keyServices)					//prints on command line//
  										//								//
//********************************************************BLE OPTIONS AND CONNECTING TO A DEVICE************************************************//

	const magadapter = await bluetooth.defaultAdapter()
	await magadapter.startDiscovery()

	console.log('||      NODEJS     	||	Discovering for mag')
	mag = await magadapter.waitDevice(magLockOfInterest)
	console.log('||      NODEJS     	||	got device', await mag.getAddress())
	const magName = await key.getName()									
  	console.log('||      NODEJS     	||	got device remote name', magName)			
  	console.log('||      NODEJS     	||	got device user friendly name', await mag.toString())	
  	console.log('||      NODEJS     	||	Device: [', magName , '] is within range')		

	await magadapter.stopDiscovery() 
	
	await mag.connect()
	console.log("||      NODEJS     	||	Connected to device: " + magName)
	
	const magGattServer = await key.gatt()
	magServices = await magGattServer.services()
	console.log("||      NODEJS     	||	services are " + magServices)

} 
main()
  .then()
   .catch(console.error)
