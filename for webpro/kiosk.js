const readline=require('readline');

const rl=readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('커피를 선택하세요 : ',function(coffee){
    switch(coffee){
        case '아메리카노':
            console.log("아메리카노 주문이 완료되었습니다.");
            break;
        case '카페라때':
            console.log("카페라때 주문이 완료되었습니다.");
            break;
        case '연유유라때':
            console.log("연유유라때 주문이 완료되었습니다.");
            break;
        case '헤이즐넛넛':
            console.log("해이즐넛넛 주문이 완료되었습니다.");
            break;
        default:
            console.log("그런 상품은 없습니다.");
            break;
    }
    rl.close();
});