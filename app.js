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

var serialportname = "/dev/tty.usbmodemfa131";
var serialport_n = 9600;
var subscriber = redis.createClient(6379, 'tk2-244-31758.vs.sakura.ne.jp');
var client = redis.createClient(6379, 'tk2-244-31758.vs.sakura.ne.jp');
var publisher = redis.createClient(6379, 'tk2-244-31758.vs.sakura.ne.jp');
var id = 0;

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {

  res.render('index', {
    title: '108(ワン・オー・エイト)'
  });

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

// socket.io test
app.get('/init', function(req, res) {
  io.emit("bonnou_init", {});
});
app.get('/clear', function(req, res) {
  io.emit("bonnou_clear", {});
});
app.get('/loading', function(req, res) {
  io.emit("bonnou_loading", {});
});
app.get('/result', function(req, res) {
  io.emit("bonnou_result", bonnou[req.query.result]);
});
app.listen(8080, function() {
  console.log('Example app listening on port 3000!');
});

io.on('connection', function(socket) {
  console.log('a user connected');
});

var sp = new serialport.SerialPort(serialportname, {
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    parser: serialport.parsers.raw
});

sp.on('data', function(input) {
    var buffer = new Buffer(input, 'utf8');
    var stop = buffer.toString();
    try {
          console.log(buffer);
          if(stop === "1"){
            console.log("stop");
            finish(id);
          }
    } catch(e) {
      return;
    }
});

//テスト用
function sleep(time, callback) {
  setTimeout(callback, time);
}

//終了をサーバに通知
function finish(id) {
  client.lpush("bnDelete", id);
  publisher.publish("bnComplete", id);
  id = "";
}

var bonnou = {
  'level1': {
    bonnou_level: 'level1',
    bonnou_level_name: '仏級',
    bonnou_level_name_ruby: 'ほとけきゅう',
    bonnou_level_description: 'もはや人間ではありません。'
  },
  'level2': {
    bonnou_level: 'level2',
    bonnou_level_name: '人間級',
    bonnou_level_name_ruby: 'にんげんきゅう',
    bonnou_level_description: 'ほどほどに煩悩です。鐘を鳴らしましょう。'
  },
  'level3': {
    bonnou_level: 'level3',
    bonnou_level_name: '畜生級',
    bonnou_level_name_ruby: 'ちくしょうきゅう',
    bonnou_level_description: 'かなりの畜生です。すぐに鐘を鳴らしましょう。'
  }
};
