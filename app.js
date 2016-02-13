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
  // levelを変えるとHTMLが変化
  var level = 'level1';
  res.render('index', bonnou[level]);
});

app.listen(3000, function() {
  subscriber.subscribe('bnNotify');

  //redisをsubscribeして来たらクライアントに通知
  console.log("connected redis");
  subscriber.on("message", function(channel, message) {
    console.log("get bonnou");
    client.get("bnData", function(err, val){
      if(err) return console.log(err);
      bonnouData = JSON.parse(val);
      console.log(bonnouData);
      io.emit("bonnou", bonnouData);
      id = bonnou.id;
    });
  });
});

io.on('connection', function(socket) {
  console.log('a user connected');

  sleep(1000, function() {
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
    parser: serialport.parsers.raw
});

sp.on('data', function(input) {
    var buffer = new Buffer(input, 'utf8');
    var stop = buffer.toString();
    try {
          console.log(buffer);
          if(stop === "1"){
            console.log("stop");
            playBell();
            finish(id);
          }
    } catch(e) {
      return;
    }
});

function playBell() {
  var filename = 'lib/bell.mp3';
  var command = 'afplay ' + filename;
  exec(command, function(err, stdout, stderr) {
    if (!err) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
    } else {
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
  client.lpush("bnDelete", id);
  publisher.publish("bnComplete", id);
  id="";
}

var bonnou = {
  'level1': {
    title: '108(ワン・オー・エイト)',
    bonnou_level: 'level1',
    bonnou_level_name: '仏級',
    bonnou_level_name_ruby: 'ほとけきゅう',
    bonnou_level_description: 'もはや人間ではありません。'
  },
  'level2': {
    title: '108(ワン・オー・エイト)',
    bonnou_level: 'level2',
    bonnou_level_name: '人間級',
    bonnou_level_name_ruby: 'にんげんきゅう',
    bonnou_level_description: 'ほどほどに煩悩です。鐘を鳴らしましょう。'
  },
  'level3': {
    title: '108(ワン・オー・エイト)',
    bonnou_level: 'level3',
    bonnou_level_name: '畜生級',
    bonnou_level_name_ruby: 'ちくしょうきゅう',
    bonnou_level_description: 'かなりの畜生です。すぐに鐘を鳴らしましょう。'
  }
};
