// 3.37.26.196:57129
const fs = require('fs');
const express = require('express');
const socket = require('socket.io');
const http = require('http');
const app = express();

const server = http.createServer(app);
const io = socket(server);
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '',
	database : 'chatting'
});

app.use('/css', express.static('./static/css'));
app.use('/js', express.static('./static/js'));
app.set('view engine', 'ejs');
app.set('views', './views');
app.engine('html', require('ejs').renderFile);
app.use(session({
    secret: '',
    resave: false,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());


connection.connect(); // mysql 연결

app.get('/', (req, res)=>{
    sess = req.session;
    console.log(sess);
	if(req.session.isLogined==true){
		res.render('chat', {title: "Chatting", login:true, name:req.session.name});
	}else{
    	res.render('index', {title: 'MyChatting Login', login:false})
	}
});

app.post('/login_progress', (req, res)=>{
    const id = req.body.id;
	const pw = req.body.pw;
	connection.query('SELECT * from user where id=\''+id+'\' and pw=\''+pw+'\'', (err, rows)=>{
		if(err) throw console.log(err);
		if(rows.length != 0){
			// 사용자 등록 되어 있을 때
			//io.sockets.emit('connect', rows[0].name);
			req.session.name=rows[0].name;
			req.session.isLogined = true;
			req.session.user_id = req.body.id;
			req.session.save(()=>{
				res.redirect('/');
			})
		}else{
			res.send("Wrong Information.");
		}
	});
    
});

app.get("/register", (req, res)=>{
	res.render('register');
});

app.post("/register_progress", (req, res)=>{
	const id = req.body.id;
	const pw = req.body.pw1;
	const name = req.body.name;
	connection.query('insert into user values(\''+id+'\', \''+pw+'\', \''+name+'\')', (err, rows)=>{
		if(err) throw console.log(err);
		else{
			console.log(pw);
			res.redirect('/');
		}
	})
	console.log(id, pw, name);
});

/*Socket Code*/
io.sockets.on('connection', (socket)=>{
    socket.on('newUser', function(name) {
        console.log(name + ' 님이 접속했습니다.');
        
        socket.name = name;
        
        io.sockets.emit('update', {type: 'connect', name: 'SERVER', message: name+'님이 접속하였습니다.'});
    });
    
    socket.on('message', function(data){
        data.name = socket.name;
        
        console.log(data);
        
        socket.broadcast.emit('update', data); // 보낸 사람을 제외한 나머지 유저에게 메시지 전송
    });
    
    socket.on('disconnect', ()=>{
        console.log(socket.name + '님이 나가셨습니다.');
        
    	socket.broadcast.emit('update', {type: 'disconnect', name: 'SERVER', message:socket.name+'님이 나가셨습니다.'});
    });
});

server.listen(8080, function(){
   console.log('Server open at port 8080'); 
});