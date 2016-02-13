var serialport = require('serialport');
var redis = require('redis');
var path = require('path');
var express = require('express');
var app = express();
var path = require('path');
var ejs = require('ejs');
var http = require("http").createServer(app);
var io = require('socket.io')(http);
var exec = require('child_process').exec;
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
  io.emit("bonnou_init", {});
});

app.listen(8080, function() {
  //煩悩待ち
  subscriber.subscribe('bnNotify');
  console.log("waiting bonnou data....");
  io.emit("bonnou_loading", {});
  subscriber.on("message", function(channel, message) {
    console.log("get bonnou");
    sendBonnoData();
  });

});

//煩悩データをクライアントに送る 
function sendBonnoData(){
//redisをsubscribeして来たらクライアントに通知
  client.get("bnData", function(err, val) {
    if (err) return console.log(err);
    bonnouData = JSON.parse(val);
    console.log(bonnouData);
    level = setLevel(bonnouData.level);
    io.emit("bonnou_result", level);
    id = bonnou.id;
    console.log("bonnou id:"+id);
  });
}
//レベル判定
function setLevel(level){
  switch (level) {
    case 1:
      return bonnou.level1;
    case 2:
      return bonnou.level2;
    default:
      return bonnou.level3;
  }
}

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

//鐘の入力を受け付ける
sp.on('data', function(input) {
  var buffer = new Buffer(input, 'utf8');
  var stop = buffer.toString();
  try {
    if (stop === "1") {
      clearBonno(bonnouData);
    }
  } catch (e) {
    return;
  }
});

//煩悩を払う
function clearBonno(bonnnouData){
  console.log("stop");
  playBell();
  io.emit("bonnou_clear", {});
  finish(id);
}

function playBell() {
  var filename = 'lib/bell.mp3';
  var command = 'afplay ' + filename;
  exec(command, function(err, stdout, stderr) {
    if (err) {
      console.log(err);
    }
  });
}

//テスト用
function sleep(time, callback) {
  setTimeout(callback, time);
}

//終了をサーバに通知
function finish(id) {
  console.log("clear id:"+ id);
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
