var
	LAMBSCALER = 0.4,
	DEMONSCALER = 0.55,

	L_MINSEC = 0.2,
	L_MAXSEC = 1.0,

	D_MINSEC = 0.5,
	D_MAXSEC = 2.0,

	XMARGIN = 31,
	YMARGIN = 27,
	LAMBCOUNT = 0,
	DEMONCOUNT = 1,
	SKYGROUNDDIVISOR = 3,

	stageW = 0,
	stageH = 0,
	stageX = 0,
	stageY = 0,
	preloadQueue = null,
	mouseDownX,
	stage,
	walkSprite,
	demonSprite,
	backgroundMusic,
	listenerFunc;

//different eases to choose from
var easeProvider = [
	createjs.Ease.backIn, createjs.Ease.backInOut,
	createjs.Ease.backOut, createjs.Ease.bounceIn,
	createjs.Ease.bounceInOut, createjs.Ease.bounceOut,
	createjs.Ease.circIn, createjs.Ease.circInOut,
	createjs.Ease.circOut, createjs.Ease.cubicIn,
	createjs.Ease.cubicInOut, createjs.Ease.cubicOut,
	createjs.Ease.elasticInOut, createjs.Ease.elasticOut,
	createjs.Ease.linear, createjs.Ease.none,
	createjs.Ease.quadIn, createjs.Ease.quadInOut,
	createjs.Ease.quadOut, createjs.Ease.quartIn,
	createjs.Ease.quartInOut, createjs.Ease.quartOut,
	createjs.Ease.quintIn, createjs.Ease.quintInOut,
	createjs.Ease.quintOut, createjs.Ease.sineIn,
	createjs.Ease.sineInOut, createjs.Ease.sineOut,
	createjs.Ease.getBackIn(2.5), createjs.Ease.getBackInOut(2.5),
	createjs.Ease.getBackOut(2.5), createjs.Ease.getElasticIn(2,5),
	createjs.Ease.getElasticInOut(2,5), createjs.Ease.getElasticOut(2,5),
	createjs.Ease.getPowIn(2.5), createjs.Ease.getPowInOut(20.5),
	createjs.Ease.getPowOut(2.5), createjs.Ease.elasticIn,
];

var punishmentArr = [
	"Don't touch the demonlambs! All the caught lambs have been released as a punishment.",
	"Don't touch the demonlambs! More demonlambs have been added as a punishment.",
];

function initVars(){

	lambsInPlay = 0;
	demonsAdded = 1;
	groundObject = {};
	scoreTextObject = {};
	sunObject = {};
	cloudObject = {};
	lambObject = {};
}

//load all resources
function startPreload() {

	console.log("in startPreload");
	preloadQueue = new createjs.LoadQueue();
	preloadQueue.installPlugin(createjs.Sound);

	preloadQueue.loadManifest( [
		{id: "baa", src: "sounds/baa.mp3"},
		{id: "boomSound", src: "sounds/explosion.mp3"},
		{id: "blackLamb", src: "imgs/blacklambstand.png"},
		{id: "whiteLamb", src: "imgs/result.png"},
		{id: "applause", src: "sounds/applause.mp3"},
		{id: "laughter", src: "sounds/laughter.mp3"},
		{id: "squek", src: "sounds/squek1.mp3"},
		{id: "bennyhill", src: "sounds/bennyhill.mp3"},
		{id: "lambFace", src: "imgs/lambface.png"},
		{id: "logo", src: "imgs/logo1.png"},
		{id: "fence", src: "imgs/fence.png"},
		{id: "cloud", src: "imgs/cloud1.png"},
	] );
}

//create stage
function main() {

	stage = new createjs.Stage("can");
	playDimensions();
	setTicker();
}

function setTicker() {

	createjs.Ticker.setPaused(true);
	listenerFunc = createjs.Ticker.on ("tick", function(ev){
		if( !ev.paused ) stage.update();
	});
}

function playDimensions(){

	stage.canvas.width = $(window).width();
	stage.canvas.height = $(window).height();
	stageW = stage.canvas.width;
	stageH = stage.canvas.height;
	stageX = 0;
	stageY  = stageH / SKYGROUNDDIVISOR;
}

function setUpCanvas(){

	playDimensions();
	addGround();
	addSun();
	addClouds();
	lambsToStage();

	addScoreFrame();
	doTween();
}

//background and stage ready
function startGame() {

	initVars();
	$("#can").addClass("gameBackground");
	addBackgroundMusic();
	setUpCanvas();
	createjs.Ticker.setFPS(15);
	createjs.Ticker.setPaused(false);
	touches();
}

function addScoreFrame(){

	console.log("inside score " + lambsInPlay);
	stage.removeChild(scoreTextObject);
	var container = new createjs.Container();
	var counter = new createjs.Shape();
	counter.graphics.beginFill("#FFFFCC").beginStroke("#663300").drawRoundRect(10, 10, 100, 60, 4);
	var t = new createjs.Text("Score: " + (LAMBCOUNT - lambsInPlay) + "/" + LAMBCOUNT, "18px bold Arial");
	t.textAlign = "center";
	t.x = 60;
	t.y = 30;
	t.name = "score";
	container.addChild(counter, t);
	stage.addChild(container);
	scoreTextObject = container;
}

function addClouds(){

	stage.removeChild(cloudObject);
	var container = new createjs.Container();
	var num = Math.round( stageW / 150 );

	for(var i = 0; i < num; i++){

		var c = new createjs.Bitmap(preloadQueue.getResult("cloud"));
		c.name = "cloud";
		c.shadow = new createjs.Shadow("#c2c2c2", 0, 20, 25);
		var cb = c.getBounds();
		var minX = stageY * 100/ (5 * cb.height);
		var maxX = stageY * 100 / (1.5 * cb.height);
		var scaler = randomInt(minX, maxX) / 100;
		c.x = -cb.width * scaler; //starts out of view
		c.y = randomInt(0, stageY - (cb.height * scaler + 10));
		c.scaleX = scaler ;
		c.scaleY = scaler;
		container.addChild(c);

		var waitTime = i === 0 ? 0 : randomInt(0, 8) * 1000;
		var durationTime = randomInt(stageW / 60, stageW / 20 ) * 1000;
		createjs.Tween.get(c, {loop: true, override: true}).wait(waitTime).to({x: stageW}, durationTime);
	}
	stage.addChild(container);
	cloudObject = container;
}

function addGround(){

	stage.removeChild(groundObject);
	var g = new createjs.Shape();
	g.graphics.beginLinearGradientFill(["#FFFFFF", "#227B22", "#4FED11", "#85E085"], [0, 0.3, 0.6, 1], 0, 0, stageW, stageH);
	g.graphics.drawRect(stageX, stageY, stageW, stageH - stageY);
	g.shadow = new createjs.Shadow("blue", 0, 0, 110);
	groundObject = g;
	stage.addChild(groundObject);
}

function addSun(){

	stage.removeChild(sunObject);
	var container = new createjs.Container();

	var s = new createjs.Shape();
	var halfOfSky = stageY / 2;
	s.graphics.beginFill("yellow").drawCircle(stageW, 0, halfOfSky);
	s.shadow = new createjs.Shadow("yellow", -5, 15, 55);

	var ray1 = new createjs.Shape();
	ray1.graphics.setStrokeStyle(3).beginStroke("yellow");
	ray1.graphics.moveTo(stageW - halfOfSky + 15, halfOfSky - 15).lineTo(stageW - halfOfSky + 10, halfOfSky - 10);
	ray1.shadow = new createjs.Shadow("red", 0, 0, 15);
	createjs.Tween.get(ray1, {loop: true}).to({x: -halfOfSky, y : halfOfSky, alpha: 0}, 1500);

	var ray2 = new createjs.Shape();
	ray2.graphics.setStrokeStyle(4).beginStroke("yellow");
	ray2.graphics.moveTo(stageW - halfOfSky, 5).lineTo(stageW - halfOfSky - 10, 5);
	ray2.shadow = new createjs.Shadow("red", 0, 0, 15);
	createjs.Tween.get(ray2, {loop: true}).to({x: -halfOfSky, alpha: 0}, 1000);

	var ray3 = new createjs.Shape();
	ray3.graphics.setStrokeStyle(4).beginStroke("yellow");
	ray3.graphics.moveTo(stageW - 5, halfOfSky).lineTo(stageW - 5, halfOfSky + 10);
	ray3.shadow = new createjs.Shadow("red", 0, 0, 15);
	createjs.Tween.get(ray3, {loop: true}).to({y : halfOfSky, alpha: 0}, 1200);

	container.addChild(s, ray1, ray2, ray3);
	stage.addChild(container);
	sunObject = container;
}

//touch and check for swipe
function touches() {

	createjs.Touch.enable(stage, true, false);
	stage.on("stagemousedown", function (ev){
		console.log("stage mousedown");
		mouseDownX = ev.stageX;
	});

	stage.on("stagemouseup", function (ev){
		if( snapShot.numChildren() == 1 ){
			console.log("only one child");
			return;
		}
		console.log("stage mouseup");
		var mouseUpX  = ev.stageX;
		if( Math.abs(mouseDownX - mouseUpX) > 80 ) {
			stage.removeAllEventListeners();
			var data = clearForMove();
			sendToPeer(data);
		}
	});
}

function getWelcomeText(){

	var welcomeText = "" +
	"There's a hole in the fence" +
	"\nand the lambs have escaped..." +
	"\nTry & catch them!" +
	"\nThe black ones are demonic" +
	"\nand should be avoided.\n" +
	"\n\nAfter you've started the game,\n" +
	"you can move it between browser-windows\n" +
	"by swiping on the playfield.\n\n " +
	"CLICK ANYWHERE TO START THE GAME!";

	return welcomeText;
}

//instructional screen to begin
function startScreen() {

	$("#can").addClass("preBackground");
	var text = new createjs.Text(getWelcomeText(), "20px bold Arial");
	text.y = stageH / 3;
	text.x = stageW / 2;
	text.textAlign = "center";
	stage.addChild(text);
	stage.update();
	startScreenSprite();
	stage.on("stagemouseup", clear);
}

//clear startscreen and prepare gamefield
function clear() {

	createjs.Sound.play("boomSound");
	stage.removeAllChildren();
	stage.removeAllEventListeners();
	$("#can").removeClass();
	startGame();
}

//attributes for each lamb
function lambAttrs( lamb, x, y, name, scaler ) {

	lamb.x = x;
	lamb.y = y;
	lamb.name = name;
	lamb.scaleX = scaler;
	lamb.scaleY = scaler;
	lamb.regY = lamb.getBounds().height / 2;
	lamb.regX = lamb.getBounds().width/ 2;
	lambObject.addChild(lamb);
}

//setup for each individual animated lamb
function createLambSprite(x, y){

	var l = new createjs.Sprite(walkSprite);
	lambAttrs(l, x, y, "lamb", LAMBSCALER);
	l.on("click", handleClick);
	l.gotoAndPlay();

	function handleClick(ev) {

		createjs.Sound.play("baa");
		createjs.Sound.play("boomSound");
		caughtLambTween(l.x, l.y);

		if( lambsInPlay <= 1)  {

			$("#can").removeClass();
			createjs.Ticker.setPaused(true);
			backgroundMusic.stop();
			stage.removeAllChildren();
			stage.removeAllEventListeners();
			createjs.Sound.play("applause");

			var text = new createjs.Text("CAUGHT\n 'EM ALL!", "30px Courier New");
			text.x = stageW / 2;
			text.y = stageH / 3;
			text.textAlign = "center";
			stage.addChild(text);
			stage.update();
		}
		else{

			lambObject.removeChild(l);
			--lambsInPlay;
			addScoreFrame();
		}
	}
}

function addLogos(){

	var x = 0;
	var y = 0;
	var container = new createjs.Container();

	var logo = new createjs.Bitmap(preloadQueue.getResult("logo"));
	x += 50;
	logo.x = x;
	container.addChild(logo);
	stage.addChild(container);
	stage.update();

	return container;
}

function demonClick(){

	var shape = new createjs.Shape();
	shape.graphics.beginFill("black").drawRect(0, 0, stageW, stageH);
	backgroundMusic.setPaused(true);
	createjs.Ticker.setPaused(true);

	var index = lambsInPlay === LAMBCOUNT ? 1 : 0;
	var textObj = new createjs.Text(punishmentArr[index], "20px bold Arial", "white");
	textObj.x =  stageW / 2;
	textObj.y =  stageH / 2;
	textObj.textAlign = "center";
	textObj.lineWidth = stageW / 1.5;
	stage.addChild(shape, textObj);

	var logoContainer = addLogos();
	var s = createjs.Sound.play("laughter");

	s.on("complete", function(){

		stage.removeChild(textObj, shape, logoContainer);
		if(index === 0){
			lambsInPlay = LAMBCOUNT;
		}
		if(index === 1){
			demonsAdded++;
		}

		lambsToStage();
		doTween();
		addScoreFrame();
		createjs.Ticker.setPaused(false);
		backgroundMusic.setPaused(false);
	});
}

function demonLambsToStage() {

	if(!peerLambsData){

		var limit = DEMONCOUNT * demonsAdded;
		for( var j = 0; j < limit; j++ ){

			var demonLamb = new createjs.Sprite(demonSprite);
			demonLamb.on("click", demonClick);
			var demonX = randomInt( XMARGIN, stage.canvas.width - XMARGIN );
			var demonY = randomInt( stageH / SKYGROUNDDIVISOR, stage.canvas.height - YMARGIN );
			lambAttrs(demonLamb, demonX, demonY, "demon", DEMONSCALER);
			demonLamb.gotoAndPlay();
		}
	}

	else{
		peerLambsData.demon.forEach(function(dem){

			var demonLamb = new createjs.Sprite(demonSprite);
			demonLamb.on("click", demonClick);
			lambAttrs(demonLamb, dem.x, dem.y, "demon", DEMONSCALER);
			demonLamb.gotoAndPlay();
		});
		demonsAdded = peerLambsData.demon.length / DEMONCOUNT;
	}
}

//background sound
function addBackgroundMusic(){

		backgroundMusic = createjs.Sound.play("bennyhill", {loop: -1, volume: 0.1});
		if(!!peerLambsData) {
			backgroundMusic.setPosition(peerLambsData.musicPos);
		}
}

//draw lambs
function lambsToStage () {

	var limit = lambsInPlay > 0 ? lambsInPlay : LAMBCOUNT;
	stage.removeChild(lambObject);
	lambsInPlay = 0;
	var container = new createjs.Container();
	lambObject = container;

	if( !peerLambsData) {

		for( var i = 0; i < limit; i++ ) {
			var x = randomInt( XMARGIN, stage.canvas.width - XMARGIN );
			var y = randomInt( stageH / SKYGROUNDDIVISOR,
				stage.canvas.height - YMARGIN );
			createLambSprite(x, y);
			++lambsInPlay;
		}
	}
	else {
		peerLambsData.free.forEach(	function(temp){

			var grassLimit = stageH / SKYGROUNDDIVISOR;
			var y = temp.y >  grassLimit ?  grassLimit : temp.y;
			var x = temp.x > stageW ?  stageW : temp.y;
			createLambSprite(x, y);
			++lambsInPlay;
		});
	}

	stage.addChild(lambObject);
	demonLambsToStage();
	peerLambsData = null;
}


//get new random x,y and ease
function doTween() {

	lambObject.children.forEach( function(lambWalk){

		var thisX = lambWalk.x;
		var thisY = lambWalk.y;

		var randMs = (lambWalk.name === "demon") ? randomInt( D_MINSEC, D_MAXSEC ) : randomInt( L_MINSEC, L_MAXSEC );
		var targetX = randomInt(-XMARGIN, stageW + XMARGIN);
		targetX = Math.abs(targetX - thisX) < 80 ?  targetX + 80 : targetX;
		var a = stageH / SKYGROUNDDIVISOR;
		var targetY = randomInt( a - YMARGIN, stageH + YMARGIN);
		targetY = Math.abs(targetY - thisY) < 80 ? targetY + 80 : targetY;
		var selectRandEase = easeProvider[randomInt( 0, easeProvider.length - 1 )];

		//flip the lamb's direction if needed
		if( (lambWalk.x > targetX && lambWalk.scaleX > 0) ||
			(lambWalk.x < targetX && lambWalk.scaleX < 0) ) {

			lambWalk.scaleX *= -1;
		}

		createjs.Tween
			.get(lambWalk, {override: true})
			.to({x: targetX, y: targetY}, randMs * 1000, selectRandEase).call(doTween);
	});
}

//get state data and clear stage
function clearForMove() {

	createjs.Touch.disable(stage);
	createjs.Tween.removeAllTweens();
	var stateData = {};
	var free = [];
	var demon = [];

	lambObject.children.forEach( function( obj, index ){

		if(obj.name === "lamb") free.push( {x: obj.x, y: obj.y} );
		if(obj.name === "demon") demon.push( {x: obj.x, y: obj.y} );
	});

	stateData.free = free;
	stateData.demon = demon;
	stateData.musicPos =  backgroundMusic.getPosition();
	backgroundMusic.stop();
	stage.removeAllChildren();
	$("#can").removeClass();
	createjs.Ticker.setPaused(true);
	stage.update();
	return stateData;
}

//only needs to be done once
function createLambWalkSpriteSheet() {

	//set up lamb and lambWalk-spriteObject
	var walkFrames = [
			[217, 100, 126, 120, 0, 0, 0],
			[217, 528, 126, 102, 0, 0, 0],
			[217, 940, 126, 108, 0, 0, 0]
	];

	var walkData = {
		images: [preloadQueue.getResult("whiteLamb")],
		frames: walkFrames,
		animations: {
			walk: [0, 2]
		},
		framerate: 1
	};
	return new createjs.SpriteSheet(walkData);
}

//only needs to be done once
function createDemonSpriteSheet() {

	//set up demon-spriteObject
	var walkFrames = [
			[165, 0, 137, 108, 0, 0, 0],
			[0, 15, 137, 108, 0, 0, 0],
			[329, 0, 137, 108, 0, 0, 0],
			[0, 0, 137, 108, 0, 0, 0],
	];

	var walkData = {
		images: [preloadQueue.getResult("blackLamb")],
		frames: walkFrames,
		animations: {
			walk: [0, 2]
		},
		framerate: 1
	};
	return new createjs.SpriteSheet(walkData);

}

//for getting random integers
function randomInt( min, max ) {
	min = Math.floor(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function caughtLambTween(x, y){

	var num = "#" + (LAMBCOUNT - lambsInPlay + 1);
	var text = new createjs.Text(num, "40px bold Courier New", "yellow");
	text.x = x;
	text.y = y;
	stage.addChild(text);
	createjs.Tween.get(text).to({rotation: 360, override: true}, 1000).call(popper);
	function popper(){
		stage.removeChild(text);
	}
}

function createStartScreenSpritesheet(){
	//set up lambFace-spriteObject
	var hw = 250;
	var faceFrames = {width: hw, height: hw, spacing: 10};

	var faceData = {
		images: [preloadQueue.getResult("lambFace")],
		frames: faceFrames,
		animations: {
			standard: [0, 10, "blink", 0.3],
			blink: [6, 10,, 0.3]
		},
		framerate: 24
	};

	var face = new createjs.SpriteSheet(faceData);
	var blink = new createjs.Sprite(face);

	return blink;
}

//setup for startScreen lamb
function startScreenSprite() {

	var f = new createjs.Bitmap(preloadQueue.getResult("fence"));
	var blink = createStartScreenSpritesheet();
	var startText = stage.children[0];
	f.x = blink.x = startText.x - 400;
	blink.y = stageH / 4;
	f.y = stageH / 1.5;

	stage.addChild(f, blink);
	blink.gotoAndPlay("standard");
	createjs.Ticker.setFPS(60);
	createjs.Ticker.addEventListener("tick", stage);
	createjs.Sound.play("baa");
	createjs.Sound.play("squek");
	//createjs.Tween.get(l).to({x:100}, 5200, createjs.Ease.linear);
}