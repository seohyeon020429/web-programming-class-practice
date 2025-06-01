const express=require('express');
const mysql=require('mysql');
const app = express();
const sha=require('sha256');

let multer = require('multer');

let storage=multer.diskStorage({
  destination  : function(req, file, done){
    done(null, './public/image')
  },
  filename : function(req, file, done){
    done(null, file.originalname)
  }
})

let upload = multer({storage : storage});
let imagepath='';

const Conn = mysql.createConnection({
  host: 'localhost',      // DB 주소
  user: 'root',           // DB 사용자명
  password: '0070',     // DB 비밀번호
  database: 'myboard2' // DB 이름
});

Conn.connect(function(err){
  if(err){
    console.error('DB 연결 실패: ' + err.stack);
    return;
  }
  console.log('DB 연결 성공!');
});


const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine', 'ejs');

app.use(express.static("public"));

app.listen(8080,function(){
  console.log("포트 8080으로 대기중...");
});

app.get('/book',function(req,res){
  res.send('도서목록 관련 페이지 입니다.');
});

// app.get('/',function(req,res){
//   res.send(
//     '<html>\
//       <body>\
//       <h1>홈입니다.</h1>\
//       <marquee>이창현님 반갑습니다.</marquee>\
//       </body>\
//       </html>'
//     );
// });

// app.get('/',function(req,res){
//   res.render("index.ejs");
// });

app.get('/enter',function(req,res){
  res.render('enter.ejs')
});

app.post('/save', upload.single('picture'), function(req, res) {
  console.log('제목:', req.body.title);
  console.log('내용:', req.body.content);

  let imagepath = req.file ? '\\' + req.file.path : null;
  console.log('이미지 경로:', imagepath);

  let sql = "INSERT INTO post (title, content, image_path, date) VALUES (?, ?, ?, NOW())";
  let params = [req.body.title, req.body.content, imagepath];

  Conn.query(sql, params, function(err, result) {
    if (err) {
      console.error(err);
      res.status(500).send('DB 오류 발생');
      return;
    }
    console.log("데이터 추가 성공");
    res.send('데이터 추가 성공');
  });
});


// app.get('/list',function(req,res){
//   Conn.query("select * from post", function(err, rows, fields){
//     if(err) throw err;
//     console.log("rows");
//   });
//   res.sendFile(__dirname + '/list.ejs');
// });

app.get('/list', function(req, res) {
  Conn.query("SELECT * FROM post", function(err, rows, fields) {
    if (err) {
      console.error(err);
      res.status(500).send('DB 오류 발생');
      return;
    }
    console.log(rows);
    res.render('list', { data: rows }); // list.ejs를 렌더링하면서 데이터 넘김
  });
});

app.post("/delete",function(req,res){
  console.log(req.body);
  console.log('삭제완료');
});

app.post("/delete", function(req, res){
  let id = req.body.id;
  console.log('삭제할 id:', id);

  let sql = "DELETE FROM post WHERE id = ?";
  Conn.query(sql, [id], function(err, result){
    if(err){
      console.error(err);
      res.status(500).send('DB 오류 발생');
      return;
    }
    console.log("데이터 삭제 성공");
    res.send('데이터 삭제 성공');
  });
});

// app.get('/content/:id', function(req,res){
//   console.log(req.params.id);
//   req.params.id=new ObjectId(req.params.id);
//   mydb
//   .collection("post")
//   .fidnOne({_id:req.params.id})
//   .then((result)=>{
//     console.log(result);
//     res.render('content.ejs', {data:result});
//   });
// });

app.get('/content/:id', function(req, res) {
  console.log(req.params.id);

  let sql = "SELECT * FROM post WHERE id = ?";
  let params = [req.params.id];

  Conn.query(sql, params, function(err, rows) {
    if (err) {
      console.error(err);
      res.status(500).send('DB 오류 발생');
      return;
    }
    if (rows.length > 0) {
      console.log(rows[0]);
      res.render('content.ejs', { data: rows[0] });
    } else {
      res.status(404).send('게시글을 찾을 수 없습니다.');
    }
  });
});

app.get('/edit/:id', function(req,res){
  console.log(req.params.id);

  let sql = "SELECT * FROM post WHERE id = ?";
  let params = [req.params.id];

  Conn.query(sql, params, function(err, rows) {
    if (err) {
      console.error(err);
      res.status(500).send('DB 오류 발생');
      return;
    }
    if (rows.length > 0) {
      console.log(rows[0]);
      res.render('edit.ejs', { data: rows[0] });
    } else {
      res.status(404).send('게시글을 찾을 수 없습니다.');
    }
  });
});

app.post('/edit', function(req, res) {
  console.log('수정 요청:', req.body);

  let sql = "UPDATE post SET title=?, content=?, date=? WHERE id=?";
  let params = [req.body.title, req.body.content, req.body.someDate, req.body.id];

  Conn.query(sql, params, function(err, result) {
    if (err) {
      console.error(err);
      res.status(500).send('DB 오류 발생');
      return;
    }
    console.log("데이터 수정 성공");
    res.redirect('/list'); // 수정 후 목록으로 이동
  });
});

let cookieParser = require('cookie-parser');

app.use(cookieParser('key value'));
app.get('/cookie', function(req,res){
let milk=parseInt(req.signedCookies.milk)+1000;
if(isNaN(milk)){
  milk=0;
}

  res.cookie('milk',milk,{signed:true});
  res.send('product : '+ milk + "won");
});

let session=require('express-session');
app.use(session({
  secret : '',
  resave:false,
  saveUninitialized : true
}))

app.get("/session", function(req,res){
  if(isNaN(req.session.milk)){
    req.session.milk=0;
  }
  req.session.milk=req.session.milk + 1000;
  res.send("session:"+req.session.milk+"won");
});

app.get('/', function(req, res) {
  res.render('index.ejs', { user: req.session.user || null });
});

app.get("/login", function(req, res) {
  console.log('로그인 페이지 요청');
  res.render("login.ejs", { user: req.session.user || null });
});

app.post("/login", function(req, res) {
  let userid = req.body.userid;
  let userpw = req.body.userpw;

  let sql = "SELECT * FROM account WHERE username = ?";
  Conn.query(sql, [userid], function(err, rows) {
    if (err) {
      console.error(err);
      res.status(500).send('DB 오류 발생');
      return;
    }

    if (rows.length === 0) {
      res.send('아이디가 존재하지 않습니다.');
    } else {
      let dbUser = rows[0];
    if (dbUser.password === userpw) {
      req.session.user = dbUser;
      res.redirect('/'); // ✅ 로그인 성공 후 index.ejs로 이동
    }
    else {
        res.send('비밀번호가 틀렸습니다.');
    }
    }
  });
});

app.get('/logout', function(req,res){
  console.log('로그아웃');
  req.session.destroy(function(err){
    if(err){
      console.error(err);
      res.status(500).send('세션 삭제 오류');
      return;
    }
    res.redirect('/login'); // 세션 제거 후 로그인 페이지로 이동
  });
});

app.get('/signup', function(req, res) {
  res.render('signup.ejs');
});


app.post('/signup', function(req, res) {
  console.log(req.body.userid);
  console.log(sha(req.body.userpw));
  console.log(req.body.usergroup);
  console.log(req.body.useremail);

  let userid = req.body.userid;
  let userpw = sha(req.body.userpw);
  let usergroup = req.body.usergroup;
  let useremail = req.body.useremail;

  // 쿼리 작성
  let sql = "INSERT INTO account (username, password, usergroup, email, created_at) VALUES (?, ?, ?, ?, NOW())";
  let params = [userid, userpw, usergroup, useremail];

  // DB 저장
  Conn.query(sql, params, function(err, result) {
    if (err) {
      console.error(err);
      res.status(500).send('DB 오류 발생');
      return;
    }
    console.log("회원가입 성공");
    res.send('회원가입이 완료되었습니다!');
  });
});

app.post('/photo',function(req,res){
  console.log('서버에 파일 첨부하기');
});


app.post('/photo',upload.single('picture'),function(req,res){
  console.log(req.file.path);
  imagepath='\\'+req.file.path;
})

app.get('/search', function(req, res) {
  let searchValue = req.query.value;
  console.log(searchValue);

  let sql = "SELECT * FROM post WHERE title LIKE ?";
  let params = ['%' + searchValue + '%'];

  Conn.query(sql, params, function(err, rows) {
    if (err) {
      console.error(err);
      res.status(500).send('DB 오류 발생');
      return;
    }
    console.log(rows);
    // 🔵 검색 결과를 sresult.ejs로 렌더링
    res.render('sresult', { data: rows }); 
  });
});


