var serialport = require('serialport');
var redis = require('redis');
var path = require('path');
var express = require('express');
var app = express();
var path = require('path');
var ejs = require('ejs');
var http = require("http").createServer(app);
var io = require('socket.io')(http);
http.listen(8080, "localhost");

var serialport = "";
var serialport_n = 9600;
var subscriber = redis.createClient(6379, 'tk2-244-31758.vs.sakura.ne.jp');
var client = redis.createClient(6379, 'tk2-244-31758.vs.sakura.ne.jp');
var publisher = redis.createClient(6379, 'tk2-244-31758.vs.sakura.ne.jp');

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {

  // levelを変えるとHTMLが変化
  var level = 'level1';
  res.render('index', bonnou[level]);

  //var subscriber = redis.createClient();
  subscriber.subscribe('bnNotify');
  console.log("connected redis");
  subscriber.on("message", function(channel, message) {
    console.log("get bonnou");
    console.log(message);
    redis.get(bnData);
  });
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');

});

io.on('connection', function(socket) {
  console.log('a user connected');

  sleep(1000, function() {
    io.emit("bonnou", "bonnou");
    console.log("send");
  });

});
//テスト用
function sleep(time, callback) {
  setTimeout(callback, time);
}

//終了をサーバに通知
function finish(id) {
  client.lpush("bnDelete", id);
  publisher.publish("bnComplete", id);
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
