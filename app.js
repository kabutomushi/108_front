serialport = require('serialport');
var redis = require('redis');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');

var serialport = "";
var serialport_n = 9600;
var subscriber = redis.createClient(6379, 'tk2-244-31758.vs.sakura.ne.jp');
var client = redis.createClient(6379, 'tk2-244-31758.vs.sakura.ne.jp');
var publisher = redis.createClient(6379, 'tk2-244-31758.vs.sakura.ne.jp');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');

  //var subscriber = redis.createClient();
  subscriber.subscribe('bnNotify');
  console.log("connected redis");
  subscriber.on("message", function(channel, message) {
    console.log("get bonnou");
    console.log(message);
    redis.get(bnData);
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');

});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
});

//終了をサーバに通知
function finish(id){
    client.lpush("bnDelete", id);
    publisher.publish("bnComplete", id);
}
