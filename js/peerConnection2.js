var
	DBREF = new Firebase("https://sheepfull2.firebaseIO.com/"),
	PUSHREF = DBREF.child("peers"),		
	snapShot,
	STARTERREF = DBREF.child("starter"),
	GETRANDOMPEER = true,
	peerLambsData,
	yoursTruly;
	

	
//when peerId-data changes, update snapShot
PUSHREF.on("value", function(s){ 

	snapShot = s; 	
});

PUSHREF.once("child_added", function(s){

	setTimeout(test, 2000);
	function test() {

		if( !!snapShot && snapShot.numChildren() == 1) {
			setUpFinal();	
		}
	}
});

//signalling, add yoursTruly to server and db
var yoursTruly = new Peer({key: '7fyp1gnx2x2edn29'});
yoursTruly.on("open", function(id){

	console.log("Id for pcon is " + id);
	var tempRef = PUSHREF.child(id);		
	tempRef.set({ id:id });
	tempRef.onDisconnect().remove();
});

window.onunload = window.onbeforeunload = removeYoursTruly;	

//remove yoursTruly from server and db
function removeYoursTruly(ev){

	if( !!yoursTruly && !yoursTruly.destroyed ) {		
		yoursTruly.destroy();
	}
}

//get dataConnection from a peer and receive data
yoursTruly.on("connection", function(receivedDC){

	receivedDC.on("data", function(data) {
		data = JSON.parse(data);		
		peerLambsData = data;
		startGame();
	});
});

//start action
function sendToPeer(data) {

	var someId = getId();		
	//create your dataConnection
	var dC = yoursTruly.connect(someId, { serialization: "json" });
	dC.on("open", function() {	
		data = JSON.stringify(data);
		dC.send(data);
	});		
};

//find a random peer-index from db
function getId(){

	var ids = Object.keys(snapShot.val());
	var ownId = $.inArray(yoursTruly.id, ids);
	ids.splice(ownId, 1);
	var index = 0;
	
	if( GETRANDOMPEER ) {
	
		index = randomInt(0, ids.length - 1);
	}
	
	var someId = ids[index];	
	return someId;
}