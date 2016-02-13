//var serialport = require('serialport');
var redis = require('redis');
var path = require('path');
var express = require('express');
var app = express();
var http = require("http").createServer(app);
var io = require('socket.io')(http);
http.listen(3000, "localhost");

var serialport = "";
var serialport_n = 9600;
var subscriber = redis.createClient(6379, 'tk2-244-31758.vs.sakura.ne.jp');
var client = redis.createClient(6379, 'tk2-244-31758.vs.sakura.ne.jp');
var publisher = redis.createClient(6379, 'tk2-244-31758.vs.sakura.ne.jp');
var slppe = require('sleep');

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

  sleep(1000, function(){
    io.emit("bonnou", "bonnou");
    console.log("send");
  });
      
});
//テスト用
function sleep(time, callback){
  setTimeout(callback, time);
}

//終了をサーバに通知
function finish(id){
  client.lpush("bnDelete", id);
  publisher.publish("bnComplete", id);
}