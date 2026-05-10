const canvas = document.getElementById('pinballCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400; canvas.height = 600;

let score = 0; let lives = 3;
const gravity = 0.2; 
const maxSpeed = 0.011; // 1. Limit definiert
const ball = { x: 200, y: 50, vx: 0, vy: 0, radius: 8 };

const fWidth = 125; const fHeight = 18;
const leftF = { x: 0, y: 540, angle: 0.4, targetAngle: 0.4, isLeft: true };
const rightF = { x: 400, y: 540, angle: -0.4, targetAngle: -0.4, isLeft: false };

const bumpers = [{x: 100, y: 150, r: 30}, {x: 300, y: 150, r: 30}, {x: 200, y: 280, r: 40}];

window.addEventListener('keydown', e => {
    if(e.code === 'ArrowLeft') leftF.targetAngle = -0.5;
    if(e.code === 'ArrowRight') rightF.targetAngle = 0.5;
});
window.addEventListener('keyup', e => {
    if(e.code === 'ArrowLeft') leftF.targetAngle = 0.4;
    if(e.code === 'ArrowRight') rightF.targetAngle = -0.4;
});

function spawn() {
    ball.x = 180 + Math.random() * 40; 
    ball.y = 40;
    ball.vx = (Math.random() - 0.5) * 4; 
    ball.vy = 2;
}

// 2. Hilfsfunktion zur Begrenzung
function limitSpeed() {
    const speed = Math.sqrt(ball.vx**2 + ball.vy**2);
    if (speed > maxSpeed) {
        const ratio = maxSpeed / speed;
        ball.vx *= ratio;
        ball.vy *= ratio;
    }
}

function collideFlipper(f) {
    let dx = ball.x - f.x;
    let dy = ball.y - f.y;
    let cos = Math.cos(-f.angle);
    let sin = Math.sin(-f.angle);
    let localX = dx * cos - dy * sin;
    let localY = dx * sin + dy * cos;

    let fXStart = f.isLeft ? 0 : -fWidth;
    
    if (localX > fXStart - ball.radius && localX < fXStart + fWidth + ball.radius &&
        localY > -fHeight/2 - ball.radius && localY < fHeight/2 + ball.radius) {
        
        if (Math.abs(f.targetAngle - f.angle) > 0.01) {
            let speed = Math.sqrt(ball.vx**2 + ball.vy**2);
            let outAngle = f.angle - Math.PI/2;
            ball.vx = Math.cos(outAngle) * (speed + 12);
            ball.vy = Math.sin(outAngle) * (speed + 12);
            ball.y -= 15; 
        } else {
            let rollForce = Math.sin(f.angle) * 0.5;
            ball.vx += rollForce;
            ball.vy *= -0.2; 
            ball.y = f.y + (localX * Math.sin(f.angle)) - 25; 
        }
        
        if(Math.abs(ball.vx) < 0.1) ball.vx = f.isLeft ? 0.2 : -0.2;
        limitSpeed(); // Nach Flipper-Kontakt prüfen
    }
}

function update() {
    for (let i = 0; i < 8; i++) {
        ball.vy += gravity / 8;
        ball.x += ball.vx / 8;
        ball.y += ball.vy / 8;

        limitSpeed(); // Permanent während der Bewegung prüfen[cite: 1]

        if (ball.x < ball.radius || ball.x > canvas.width - ball.radius) {
            ball.vx *= -0.6; 
            ball.x = ball.x < ball.radius ? ball.radius : canvas.width - ball.radius;
        }
        if (ball.y < ball.radius) { ball.vy *= -0.5; ball.y = ball.radius; }

        leftF.angle += (leftF.targetAngle - leftF.angle) * 0.2;
        rightF.angle += (rightF.targetAngle - rightF.angle) * 0.2;

        collideFlipper(leftF);
        collideFlipper(rightF);
    }

    bumpers.forEach(b => {
        let dx = ball.x - b.x; let dy = ball.y - b.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < ball.radius + b.r) {
            let angle = Math.atan2(dy, dx);
            ball.vx = Math.cos(angle) * 12; ball.vy = Math.sin(angle) * 12;
            limitSpeed(); // Nach Bumper-Stoß prüfen[cite: 1]
            score += 50; document.getElementById('score').innerText = score;
        }
    });

    if (ball.y > canvas.height) {
        lives--; document.getElementById('lives').innerText = lives;
        if (lives <= 0) { alert("GAME OVER! Score: " + score); score = 0; lives = 3; document.getElementById('score').innerText = score; }
        spawn();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    bumpers.forEach(b => {
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
        ctx.fillStyle = "#ff007f"; ctx.fill();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
    });

    ctx.fillStyle = "#0ff";
    [leftF, rightF].forEach(f => {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.angle);
        ctx.fillRect(f.isLeft ? 0 : -fWidth, -fHeight/2, fWidth, fHeight);
        ctx.restore();
    });

    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = "#fff"; ctx.shadowBlur = 10; ctx.shadowColor = "#fff"; ctx.fill(); ctx.closePath();
    ctx.shadowBlur = 0;

    update();
    requestAnimationFrame(draw);
}
spawn();
draw();
