#include <zephyr/types.h> //includes a type of library
#include <stddef.h>	  //includes a type of library
#include <string.h>	  //includes a type of library
#include <errno.h> 	  //includes a type of library
#include <sys/printk.h>	  //includes a type of library
#include <sys/byteorder.h>//includes a type of library
#include <zephyr.h>	  //includes a type of library

#include <settings/settings.h>	//includes a type of library

#include <bluetooth/bluetooth.h>//includes a type of library
#include <bluetooth/hci.h>	//includes a type of library
#include <bluetooth/conn.h> 	//includes a type of library
#include <bluetooth/uuid.h>	//includes a type of library
#include <bluetooth/gatt.h>	//includes a type of library
#include <device.h>		//includes a type of library
#include <drivers/sensor.h>	//includes a type of library
#include <drivers/gpio.h>	//includes a type of library

#include <stdio.h>		//includes a type of library
#include <stdint.h>
		
#include "matrix.h" 		//includes matrix.h file in the directory assignment

#define BT_UUID_MAG_SERVICE_VAL 	BT_UUID_128_ENCODE(1, 2, 3, 4, (uint64_t)0x9000)		//defines the bluetooth identifier
#define BT_UUID_MAG_ID 			BT_UUID_128_ENCODE(1, 2, 3, 4, (uint64_t)0x9001)		//defines the bluetooth identifier

static struct bt_uuid_128 my_mag_uuid = BT_UUID_INIT_128( BT_UUID_MAG_SERVICE_VAL);		// the 128 bit UUID for this gatt value
static struct bt_uuid_128 mag_id = BT_UUID_INIT_128(BT_UUID_MAG_ID); 		   		// the 128 bit UUID for this gatt value

static const struct device *gpio0;
 
#define RESET_PORT_BIT 2
#define DC_PORT_BIT 34 

uint32_t mag_value;		// the gatt characateristic value that is being shared over BLE

struct bt_conn *active_conn=NULL; // use this to maintain a reference to the connection with the central device (if any)

gpio0 = device_get_binding("GPIO_0");
if (gpio0 == NULL) {
	printf("Error Getting GPIO_0 interface\n");
	return -3;
}

ret = gpio_pin_configure(gpio0,RESET_PORT_BIT,GPIO_OUTPUT);
ret = gpio_pin_configure(gpio0,DC_PORT_BIT,GPIO_OUTPUT);

static ssize_t read_mag(struct bt_conn *conn, const struct bt_gatt_attr *attr, void *buf, uint16_t len, uint16_t offset);
//callback that is activated when the characteristic is read by central
static ssize_t write_mag(struct bt_conn *conn, const struct bt_gatt_attr *attr, void *buf, uint16_t len, uint16_t offset)
{
	
	
	uint8_t *value = attr->user_data;		
	printf("Got a write to led state %x\n", value);	//when writing value this prints
	memcpy(value, buf, len); // copy the incoming value in the memory occupied by our characateristic variable
	uint8_t rows = 1;			//initilising rows
	uint8_t cols = 1;			//initilising cols
	matrix_begin();				//initilises the LED's
	if(mag_value == 0x31)			// if the value is written as a 1, the microbit see 0x31. 
	{
		rows =  0b11111;		// sets the rows to all on		
           	cols = 0b11111; 		//sets the cols to all off		
		matrix_put_pattern(rows, ~cols);//put the pattern on the matrix (tilda, ~ inverts cols)
		
	}
	if(mag_value == 0x32)			// if the value is written as a 2, the microbit see 0x32.
	{
		rows =  0b00000;		//sets the 1st, 3rd and 5th rows to on
           	cols = 0b00000; 		//sets the 1st, 3rd and 5th cols to off
		matrix_put_pattern(rows, ~cols);//put the pattern on the matrix
	}
	return len;				//returns the len value
	
}

BT_GATT_SERVICE_DEFINE(my_mag_svc,				//creates a new service for LED
	BT_GATT_PRIMARY_SERVICE(&my_mag_uuid),
		BT_GATT_CHARACTERISTIC(&mag_id.uuid,		
		BT_GATT_CHRC_READ | BT_GATT_CHRC_WRITE,
		BT_GATT_PERM_READ | BT_GATT_PERM_WRITE,
		read_mag, write_mag, &mag_value),			//enables the write feature
);

static ssize_t read_mag(struct bt_conn *conn, const struct bt_gatt_attr *attr, void *buf, uint16_t len, uint16_t offset)
{
	printf("Got a read to led state %p\n",attr); 	//prints when reading the led state
	matrix_begin();					//function to initilise all LED's on microbit
	// Could use 'const char *value =  attr->user_data' also here if there is the char value is being maintained with the BLE STACK
	const char *value = (const char *)&mag_value; // point at the value in memory
	return bt_gatt_attr_read(conn, attr, buf, len, offset, value, sizeof(mag_value)); // pass the value back up through the BLE stack
	
}

static const struct bt_data ad[] = {
	BT_DATA_BYTES(BT_DATA_FLAGS, (BT_LE_AD_GENERAL | BT_LE_AD_NO_BREDR)),	/* specify BLE advertising flags = discoverable, BR/EDR not supported (BLE only) */
        BT_DATA_BYTES(BT_DATA_UUID128_ALL, BT_UUID_MAG_SERVICE_VAL),		/* A 128 Service UUID for the our custom service follows */
        //BT_DATA_BYTES(BT_DATA_UUID128_SOME, BT_UUID_COUNTER_SERVICE_VAL),	/* A 128 Service UUID for the our custom service follows */
        //BT_DATA_BYTES(BT_DATA_UUID128_SOME, BT_UUID_CODE_SERVICE_VAL)		/* A 128 Service UUID for the our custom service follows */
};



static void connected(struct bt_conn *conn, uint8_t err)
{
	if (err) {
		printf("Connection failed (err 0x%02x)\n", err); //prints if the connection fails
	} else {
		printf("Connected\n");
		active_conn = conn;				//puts conn into active_conn when connected
	}
}
// Callback that is activated when a connection with a central device is taken down
static void disconnected(struct bt_conn *conn, uint8_t reason)
{
	printk("Disconnected (reason 0x%02x)\n", reason);
	active_conn = NULL;					//puts NULL into active_conn when disconnected
}
// structure used to pass connection callback handlers to the BLE stack
static struct bt_conn_cb conn_callbacks = {
	.connected = connected,
	.disconnected = disconnected,
};
// This is called when the BLE stack has finished initializing
static void bt_ready(void)
{
	int err; 				//local veriable called err
	printf("Bluetooth initialized\n"); 	//prints when br_ready function is called
	err = bt_le_adv_start(BT_LE_ADV_CONN_NAME, ad, ARRAY_SIZE(ad), NULL, 0);
	if (err) {
		printf("Advertising failed to start (err %d)\n", err);
		return;
	} //prints if there a fault for advertising
	printf("Advertising successfully started\n");
}

void main(void)				//main
{
	int err;
	err = matrix_begin();
	
	//uint8_t rows = 1;		//initilsing rows for led matrix 
	//uint8_t cols = 1;		//initilsing cols for led matrix
		
	if (err < 0)
	{
		printf("\nError initializing buttons.  Error code = %d\n",err);	
	 while(1);
	}//error checking for led matrix
	
	err = bt_enable(NULL);
	
	if (err) {
		printk("Bluetooth init failed (err %d)\n", err);
		return;
	}	//error checking for bluetooth
	bt_ready(); // This function starts advertising
	bt_conn_cb_register(&conn_callbacks);
	printf("Zephyr Microbit V2 minimal BLE example! %s\n", CONFIG_BOARD);
	
	while (1);
	
}
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
