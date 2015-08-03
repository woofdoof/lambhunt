function setUpStart(){

	console.log("in setUpStart");
	startPreload();
	preloadQueue.on("complete", function(){
		console.log("preloadComplete");
		walkSprite = createLambWalkSpriteSheet();
		demonSprite = createDemonSpriteSheet();
	});
	main();
}
setUpStart();

function setUpFinal() {

	if( preloadQueue.loaded ) {
		startScreen();
	}

	else {
		//setTimeout(startScreen, 2000);
		setTimeout(setUpFinal, 500);
	}
}

$(window).resize(function(){

	if( $("#can").hasClass("gameBackground") && !createjs.Ticker.paused) {
		console.log("ready for settingupcanvas");
		setUpCanvas();
	}

	else {
		playDimensions();
	}
});