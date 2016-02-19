
var cars = {};
var socket = null;

function preload() {
	game.load.image("background", "background.png");
	game.load.image("car", "coche.png");
}

function createCar (id, tint) {
	cars[id] = game.add.sprite(400, 300, "car");
	cars[id].pivot = new Phaser.Point(16.0, 16.0);
	cars[id].tint = isNaN(tint) ? 0xFFFFFF : tint ;
}

function create () {
	cursors = game.input.keyboard.createCursorKeys();
	game.add.image(0,0, "background");
	
	socket = io.connect();

	$(window).bind ("beforeunload", function () {
		socket.emit("kill", {id: socket.id});
	});

	socket.on('updateClient', function (players) {
		var playerKeys = Object.keys(players);
		var playerKeysLength = playerKeys.length;
		
		var carKeys = Object.keys(cars);
		var carKeysLength = carKeys.length;

		//destroy client sprites that don't exist on server
		if (playerKeysLength < carKeysLength){
			console.log("destroy %d sprite", carKeysLength - playerKeysLength);
			for (var i = 0; i < carKeysLength; i++){
				var key = carKeys[i];
				if (typeof players[key] === 'undefined'){
					cars[key].destroy();
					delete cars[key];
				}
			}
		}
		
		//create and update cars
		for (var i = 0; i < playerKeysLength; i++){
			var key = playerKeys[i];
			if (typeof cars[key] === "undefined"){
				if (key === socket.id){
					createCar(key, Math.random() * Math.pow(2, 32));
				}else{
					createCar(key);
				}
				
			}
			var player = players[key];
			var car = cars[key];
			car.angle = player.a;
			car.position.x = player.x;
			car.position.y = player.y;
		}
	});

	socket.on("connection", function (socket) {
		console.log("Client id", socket);
	});
		
}

function update () {
	if (cursors.up.isDown){
		console.log("accelerate!");
		socket.emit("accelerate", {id: socket.id});
	}
	if (cursors.left.isDown){
		console.log("turn left");
		socket.emit("turnLeft", {id: socket.id});
	}
	else if (cursors.right.isDown){
		console.log("turn right");
		socket.emit("turnRight", {id: socket.id});
	}
}

var state = {preload: preload, create: create, update: update};

var game = new Phaser.Game(800, 600, Phaser.AUTO, "", state, false, false);
