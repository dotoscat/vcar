var socket = io.connect();

socket.on('updateClient', function (players) {
	//here update client sprites
	/*
	var keys = Object.keys(players);
	console.log(keys);
	for (var i = 0; i < keys.length; i++){
		var car = cars[keys[i]];
		var player = players[keys[i]];
		//console.log(car, player);
	}
	*/
});

socket.on("connection", function (socket) {
	console.log("Client id", socket);
});

function preload() {
	game.load.image("background", "background.png");
	game.load.image("car", "coche.png");
}

var cars = {};

function createCar (id) {
	cars[id] = game.add.sprite(400, 300, "car");
	cars[id].pivot = new Phaser.Point(16.0, 16.0);
}

function create () {
	cursors = game.input.keyboard.createCursorKeys();
	game.add.image(0,0, "background");
	//car.tint = Math.random * Math.pow(2, 32);
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
