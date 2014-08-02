var canvasBg = document.getElementById('canvasBg');
var ctxBg = canvasBg.getContext('2d');
var canvasJet = document.getElementById('canvasJet');
var ctxJet = canvasJet.getContext('2d');
var canvasEnemy = document.getElementById('canvasEnemy');
var ctxEnemy = canvasEnemy.getContext('2d');
var canvasBonus = document.getElementById('canvasBonus');
var ctxBonus = canvasBonus.getContext('2d');
var canvasHUD = document.getElementById('canvasHUD');
var ctxHUD = canvasHUD.getContext('2d');

var jet1 = new Jet();
var btnPlay = new Button(331, 569, 261, 349);
var gameWidth = canvasBg.width;
var gameHeight = canvasBg.height;
var bgDrawX1 = 0;
var bgDrawX2 = 1600;
var mouseX = 0;
var mouseY = 0;
var isPlaying = false;
var checkLife = false;
var requestAnimFrame =  window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.oRequestAnimationFrame ||
                        window.msRequestAnimationFrame ||
                        function(callback) {
                            window.setTimeout(callback, 1000 / 60);
                        };
var enemies = [];
var imgSprite = new Image();
var drawBonus = false;
imgSprite.src = 'images/sprite.png';
imgSprite.addEventListener('load', init, false);


// main functions

//draws the menu

function init() {
    spawnEnemy(level+4);
    drawMenu();
    document.addEventListener('click', mouseClicked, false);
}


function playGame() {
    drawBg();
    startLoop();
    document.addEventListener('keydown', checkKeyDown, false);
    document.addEventListener('keyup', checkKeyUp, false);
}

function spawnEnemy(number) {
    for (var i = 0; i < number; i++) {
        var enemy = new Enemy();
        enemy.speed += speedChange;
        enemies[enemies.length] = enemy;
    }
}

function drawAllEnemies() {
    clearCtxEnemy();
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].draw();
    }
}
var bonus = new Bonus();
var interval = setInterval(function(){drawBonus = true;},20000);
function drawBonuses(){
        clearCtxBonus();
        bonus.draw();
}

function loop() {
    if (isPlaying) {
        moveBg();
        updateHUD();
        jet1.draw();
        if(drawBonus){
            drawBonuses();
        }
        drawAllEnemies();

        requestAnimFrame(loop);
    }
}

function startLoop() {
    isPlaying = true;
    loop();
}

function stopLoop() {
    isPlaying = false;
}

function drawMenu() {
    ctxBg.drawImage(imgSprite, 0, 735, gameWidth, gameHeight, 0, 0, gameWidth, gameHeight);
}

function drawBg() {
    ctxBg.clearRect(0, 0, gameWidth, gameHeight);
    ctxBg.drawImage(imgSprite, 0, 0, 1600, gameHeight, bgDrawX1, 0, 1600, gameHeight);
    ctxBg.drawImage(imgSprite, 0, 0, 1600, gameHeight, bgDrawX2, 0, 1600, gameHeight);
}

function moveBg() {
    bgDrawX1 -= 5;
    bgDrawX2 -= 5;
    if (bgDrawX1 <= -1600) {
        bgDrawX1 = 1600;
    } else if (bgDrawX2 <= -1600) {
        bgDrawX2 = 1600;
    }
    drawBg();
}

function updateHUDValues(){
    ctxHUD.fillStyle = "hsla(212, 98%, 94%, 0.7)";
    ctxHUD.font = "bold 20px Arial";
}

var counter = 20;
var speedChange = 0;
var level = 1;

function startTime() {
    if (counter === 0) {
        enemies = [];
        counter = 20;
        speedChange += 2;
        level++;
        spawnEnemy(level+4);
    } else {
        counter--;
    }
}

// info function(lives counter,timer,score)

function updateHUD() {
    updateHUDValues();
    ctxHUD.clearRect(0, 0, gameWidth, gameHeight);
    ctxHUD.fillText("Score: " +  jet1.score, 750, 30);
    ctxHUD.fillText("Lives: " + jet1.lifes, 50,30);
    ctxHUD.fillText("Level up in: " + counter + " seconds",300,30);
    ctxHUD.fillText("Level: " + level,50,60);
}
// end of main functions


// jet functions

function Jet() {
    this.srcX = 0;
    this.srcY = 600;
    this.width = 135;
    this.height = 65;
    this.speed = 3;
    this.drawX = 220;
    this.drawY = 200;
    this.noseX = this.drawX + 100;
    this.noseY = this.drawY + 30;
    this.leftX = this.drawX;
    this.rightX = this.drawX + this.width;
    this.topY = this.drawY;
    this.bottomY = this.drawY + this.height;
    this.isUpKey = false;
    this.isRightKey = false;
    this.isDownKey = false;
    this.isLeftKey = false;
    this.isSpacebar = false;
    this.isShooting = false;
    this.bullets = [];
    this.currentBullet = 0;
    for (var i = 0; i < 25; i++) {
        this.bullets[this.bullets.length] = new Bullet(this);
    }
    this.score = 0;
    this.lifes = 3;
}

Jet.prototype.draw = function() {
    clearCtxJet();
    this.updateCoors();
    this.checkDirection();
    this.checkShooting();
    this.drawAllBullets();
    this.checkCollision();
    this.updateLifes();
    this.checkLifes();
    ctxJet.drawImage(imgSprite, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
};

//jet coordinates update

Jet.prototype.updateCoors = function() {
    this.noseX = this.drawX + 130;
    this.noseY = this.drawY + 55;
    this.leftX = this.drawX;
    this.rightX = this.drawX + this.width;
    this.topY = this.drawY;
    this.bottomY = this.drawY + this.height;
};


Jet.prototype.checkDirection = function() {
    if (this.isUpKey && this.topY > 0) {
        this.drawY -= this.speed;
    }
    if (this.isRightKey && this.rightX < gameWidth) {
        this.drawX += this.speed;
    }
    if (this.isDownKey && this.bottomY < gameHeight) {
        this.drawY += this.speed;
    }
    if (this.isLeftKey && this.leftX > 0) {
        this.drawX -= this.speed;
    }
};

Jet.prototype.drawAllBullets = function() {
    for (var i = 0; i < this.bullets.length; i++) {
        if (this.bullets[i].drawX >= 0) this.bullets[i].draw();
        if (this.bullets[i].explosion.hasHit) this.bullets[i].explosion.draw();
    }
};

Jet.prototype.checkShooting = function() {
    if (this.isSpacebar && !this.isShooting) {
        this.isShooting = true;
        this.bullets[this.currentBullet].fire(this.noseX, this.noseY);
        this.currentBullet++;
        if (this.currentBullet >= this.bullets.length) this.currentBullet = 0;
    } else if (!this.isSpacebar) {
        this.isShooting = false;
    }
};

Jet.prototype.updateScore = function(points) {
    this.score += points;
    updateHUD();
};


function clearCtxJet() {
    ctxJet.clearRect(0, 0, gameWidth, gameHeight);
}

Jet.prototype.returnSrcX = function(){
    this.srcX=0;
};

Jet.prototype.checkCollision = function() {
    for (var i = 0; i < enemies.length; i++) {
        if (this.rightX-15 >= enemies[i].drawX &&
            this.leftX <=  enemies[i].drawX + enemies[i].width &&
        ( this.topY+5 >= enemies[i].drawY &&
            this.topY+5 <= enemies[i].drawY + enemies[i].height ||
            this.bottomY-5 >= enemies[i].drawY &&
            this.bottomY-5 <= enemies[i].drawY + enemies[i].height)){
            stopLoop();
            checkLife = true;
        }
    }
};

//when there is collision between the jet and an enemy this function is called

Jet.prototype.updateLifes = function(){
    if(checkLife){
        this.lifes = this.lifes - 1;
        checkLife = false;
        enemies = [];
        counter = 20;
        for(var i = 0;i<this.bullets.length;i++){
            this.bullets[i].recycle();
        }
        this.drawX = 220;
        this.drawY = 200;
        clearCtxEnemy();
        clearCtxJet();
        setTimeout(function(){
            playGame();
            spawnEnemy(level+4);
        },700);
    }
};


// lives counter function
// if lives = 0 the game stops

Jet.prototype.checkLifes = function(){
    if(this.lifes===0){
        ctxHUD.clearRect(0, 0, gameWidth, gameHeight);
        stopLoop();
        clearCtxEnemy();
        clearCtxJet();
        ctxHUD.fillStyle = "hsla(357, 87%, 57%, 0.7)";
        ctxHUD.font = "bold 50px Arial";
        ctxHUD.fillText("GAME OVER",300,250);

        ctxHUD.fillStyle = "hsla(264, 100%, 50%, 0.7)";
        ctxHUD.font = "bold 40px Arial";
        ctxHUD.fillText("Level: " + level,360,300);

        ctxHUD.fillStyle = "hsla(264, 100%, 50%, 0.7)";
        ctxHUD.font = "bold 40px Arial";
        ctxHUD.fillText("Score: " + jet1.score,360,350);


        this.recycle();
    }
};

// end of jet functions


// bullet functions

function Bullet(j) {
    this.jet = j;
    this.srcX = 360;
    this.srcY = 600;
    this.drawX = -20;
    this.drawY = 0;
    this.width = 15;
    this.height = 15;
    this.explosion = new Explosion();
}

Bullet.prototype.draw = function() {
    this.drawX += 10;
    ctxJet.drawImage(imgSprite, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
    this.checkHitEnemy();
    if (this.drawX > gameWidth) this.recycle();
};

Bullet.prototype.fire = function(startX, startY) {
    this.drawX = startX;
    this.drawY = startY;
};

//checks for collision between bullet and enemy(if coordinates are equal)

Bullet.prototype.checkHitEnemy = function() {
    for (var i = 0; i < enemies.length; i++) {
        if (this.drawX >= enemies[i].drawX &&
            this.drawX <= enemies[i].drawX + enemies[i].width &&
            this.drawY >= enemies[i].drawY &&
            this.drawY <= enemies[i].drawY + enemies[i].height) {
                this.explosion.drawX = enemies[i].drawX - (this.explosion.width / 2);
                this.explosion.drawY = enemies[i].drawY;
                this.explosion.hasHit = true;
                jet1.srcX=135;
                setTimeout(function(){jet1.returnSrcX()},300);
                this.recycle();
                enemies[i].recycleEnemy();
                this.jet.updateScore(enemies[i].rewardPoints);
        }
    }
};

//removes bullets after they hit the enemy

Bullet.prototype.recycle = function() {
    this.drawX = -20;
};

// end of bullet functions



// explosion functions

function Explosion() {
    this.srcX = 270;
    this.srcY = 600;
    this.drawX = 0;
    this.drawY = 0;
    this.width = 90;
    this.height = 85;
    this.hasHit = false;
    this.currentFrame = 0;
    this.totalFrames = 10;
}

Explosion.prototype.draw = function() {
    if (this.currentFrame <= this.totalFrames) {
        ctxJet.drawImage(imgSprite, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
        this.currentFrame++;
    } else {
        this.hasHit = false;
        this.currentFrame = 0;
    }
};


// end of explosion functions

// bonus functions

function Bonus(){
    this.srcX = 215;
    this.srcY = 674;
    this.width = 54;
    this.height = 54;
    this.speed = 3;
    this.drawX = Math.floor(Math.random() * 1000) + gameWidth;
    this.drawY = Math.floor(Math.random() * 500);
}

Bonus.prototype.draw = function() {
    this.drawX -= this.speed;
    ctxBonus.drawImage(imgSprite, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
    this.checkGet();
    this.checkEscaped();
};

Bonus.prototype.checkEscaped = function() {
    if (this.drawX + this.width <= 0) {
        this.recycleBonus();
    }
};

Bonus.prototype.recycleBonus = function() {
    this.drawX = Math.floor(Math.random() * 1000) + gameWidth;
    this.drawY = Math.floor(Math.random() * 360);
};

Bonus.prototype.checkGet = function() {
    if (jet1.rightX-15 >= this.drawX &&
        jet1.leftX <=  this.drawX + this.width &&
        ( jet1.topY+5 >= this.drawY &&
            jet1.topY+5 <= this.drawY + this.height ||
            jet1.bottomY-5 >= this.drawY &&
            jet1.bottomY-5 <= this.drawY + this.height)){
        this.recycleBonus();
        setTimeout(function(){drawBonus = false;},50);
        jet1.lifes += 1;
    }
};

Bonus.prototype.checkEscaped = function() {
    if (this.drawX + this.width <= 0) {
        drawBonus = false;
        this.recycleBonus();
    }
};

function clearCtxBonus() {
    ctxBonus.clearRect(0, 0, gameWidth, gameHeight);
}



// enemy functions

function Enemy() {
    var srcXArray=[0,70,140];
    this.srcX = srcXArray[Math.floor(Math.random()*srcXArray.length)];
    this.srcY = 665;
    this.width = 70;
    this.height = 70;
    this.speed = 2;
    this.drawX = Math.floor(Math.random() * 1000) + gameWidth;
    this.drawY = Math.floor(Math.random() * 500);
    this.rewardPoints = 5;

}

Enemy.prototype.draw = function() {
    this.drawX -= this.speed;
    ctxEnemy.drawImage(imgSprite, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
    this.checkEscaped();
};

Enemy.prototype.checkEscaped = function() {
    if (this.drawX + this.width <= 0) {
        this.recycleEnemy();
    }
};

Enemy.prototype.recycleEnemy = function() {
    this.drawX = Math.floor(Math.random() * 1000) + gameWidth;
    this.drawY = Math.floor(Math.random() * 360);
};


function clearCtxEnemy() {
    ctxEnemy.clearRect(0, 0, gameWidth, gameHeight);
}

// end enemy functions


// button functions

function Button(xL, xR, yT, yB) {
    this.xLeft = xL;
    this.xRight = xR;
    this.yTop = yT;
    this.yBottom = yB;
}

Button.prototype.checkClicked = function() {
    if (this.xLeft <= mouseX && mouseX <= this.xRight && this.yTop <= mouseY && mouseY <= this.yBottom) {
        ctxBg.drawImage(imgSprite, 387, 618, 238, 88, 331, 261, 238, 88);
        var timer = setInterval(function(){startTime()},1000);
        return true;
    }
};

// end of button functions


// event functions
function mouseClicked(e) {
    mouseX = e.pageX - canvasBg.offsetLeft;
    mouseY = e.pageY - canvasBg.offsetTop;
    if (!isPlaying) {
        if (btnPlay.checkClicked()) {
            jet1.lifes = 3;
            setTimeout(function(){
                playGame()
            },50);
        }
    }
}

function checkKeyDown(e) {
    var keyID = e.keyCode || e.which;
    if (keyID === 38 || keyID === 87) { //up arrow or W key
        jet1.isUpKey = true;
        e.preventDefault();
    }
    if (keyID === 39 || keyID === 68) { //right arrow or D key
        jet1.isRightKey = true;
        e.preventDefault();
    }
    if (keyID === 40 || keyID === 83) { //down arrow or S key
        jet1.isDownKey = true;
        e.preventDefault();
    }
    if (keyID === 37 || keyID === 65) { //left arrow or A key
        jet1.isLeftKey = true;
        e.preventDefault();
    }
    if (keyID === 32) { //spacebar
        jet1.isSpacebar = true;
        e.preventDefault();
    }
}

function checkKeyUp(e) {
    var keyID = e.keyCode || e.which;
    if (keyID === 38 || keyID === 87) { //up arrow or W key
        jet1.isUpKey = false;
        e.preventDefault();
    }
    if (keyID === 39 || keyID === 68) { //right arrow or D key
        jet1.isRightKey = false;
        e.preventDefault();
    }
    if (keyID === 40 || keyID === 83) { //down arrow or S key
        jet1.isDownKey = false;
        e.preventDefault();
    }
    if (keyID === 37 || keyID === 65) { //left arrow or A key
        jet1.isLeftKey = false;
        e.preventDefault();
    }
    if (keyID === 32) { //spacebar
        jet1.isSpacebar = false;
        e.preventDefault();
    }
}

// end of event functions
