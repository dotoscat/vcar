"use strict";

const os = require ("os");
const fs = require("fs");
const express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

const indexHTML = "./index.html";
var index = fs.readFileSync(indexHTML);

var nPlayer = 1;

function Player (x, y) {
	this.x = x;
	this.y = y;
	this.a = 0.0;
	this.t = Math.random() * Math.pow(2, 32);
	this.n = "Player_"+nPlayer;
	nPlayer++;
}

Player.prototype.turnLeft = function () {
	this.a += -8.0;
}

Player.prototype.turnRight = function () {
	this.a += 8.0;
}

Player.prototype.accelerate = function () {
	const PI = 3.14159;
	let rotation = this.a*PI/180.0;
	this.x += Math.cos(rotation) * 8.0;
	this.y += Math.sin(rotation) * 8.0;
}

var players = {};

function handler (request, response) {
	response.writeHead(200);
    response.end(index);
}

fs.watch(indexHTML, function(event, filename) {
    console.log(event, filename);
    //console.log("updating " + indexHTML);
    index = fs.readFileSync(indexHTML);
});

app.get("/", handler);

io.on("connection", function (socket, playerData){
	console.log("new player", socket.id);
	console.log(playerData);
	players[socket.id.replace(/\/#/, "")] = new Player(400.0, 300.0);
	console.log("PLAYERS");
	console.log(players);
	
	socket.on ("accelerate", (player) => {
		players[player.id].accelerate();
	});
	
	socket.on ("turnLeft", (player) => {
		players[player.id].turnLeft();
	});
	
	socket.on ("turnRight", (player) => {
		players[player.id].turnRight();
	});

	socket.on ("kill", (player) => {
		console.log("kill", player.id);
		delete players[player.id];
		console.log("PLAYERS");
		console.log(players);
	});
	
});

function updateClients(players, io) {
	io.emit("updateClient", players);
}

app.use(express.static(__dirname + "/"));
server.listen(1337);

setInterval(updateClients, 16, players, io);
