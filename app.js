var serialport = require('serialport');
var redis = require('redis');
var path = require('path');
var express = require('express');
var app = express();
var path = require('path');
var ejs = require('ejs');
var http = require("http").createServer(app);
var io = require('socket.io')(http);
http.listen(3000, "localhost");

var serialportname = "";
var serialport_n = 9600;
var subscriber = redis.createClient(6379, 'tk2-244-31758.vs.sakura.ne.jp');
var client = redis.createClient(6379, 'tk2-244-31758.vs.sakura.ne.jp');
var publisher = redis.createClient(6379, 'tk2-244-31758.vs.sakura.ne.jp');
var id = 0;

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {

  res.render('index', {title: "test"});

  //var subscriber = redis.createClient();
  subscriber.subscribe('bnNotify');
  console.log("connected redis");
  subscriber.on("message", function(channel, message) {
    console.log("get bonnou");
    console.log(message);
    redis.get(bnData);
    io.emit("bonnou", bnData);
    id = bnData.id;
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

var sp = new serialport.SerialPort(serialportname, {
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    parser: serialport.parsers.readline("\n")
});

sp.on('data', function(input) {
    var buffer = new Buffer(input, 'utf8');
    try {
        if(buffer === "0"){
          console.log("stop");
          finish(id);
        }
    } catch(e) {
        return;
    }
});

//テスト用
function sleep(time, callback){
  setTimeout(callback, time);
}

//終了をサーバに通知
function finish(id){
  client.lpush("bnDelete", id);
  publisher.publish("bnComplete", id);
  id="";
}
