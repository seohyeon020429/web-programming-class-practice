const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200; // HTTP 상태 코드 설정
    res.setHeader('Content-Type', 'text/plain'); // 헤더 이름 수정: Content-Type
    res.end('Hello World'); // 클라이언트에게 응답
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`); // 템플릿 리터럴을 백틱으로 수정
});
