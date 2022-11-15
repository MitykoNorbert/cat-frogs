import GameMap from "./GameMap.js";

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const hudcanvas = document.getElementById("HUD");
const hudctx = hudcanvas.getContext("2d");
const tileSize = 32;
const points= document.getElementById("points");
const totalPoints=document.getElementById("totalpoints");
let restartButton = document.getElementById("restart");
restartButton.addEventListener('click', restart);
let newGameButton = document.getElementById("newGame");
newGameButton.addEventListener('click', reload);
let speed;
let enemyspeed;
let health;
let direction;
let timer;
let enemytimer;
let gameMap;
let collectibles;
let enemies;
let total;
let mapSize;
let followRate;
let seed;
StartPage();

function reload(){
    location.reload();
}
function setVariables() {
    document.getElementById("HUD").style.display="";
    document.getElementById("pointcontainer").style.display="";
    document.getElementById("settings").style.display="none";

    speed = 20-document.getElementById("speed").value;
    enemyspeed = 30-document.getElementById("enemyspeed").value;
    health = 9;
    direction = "None";
    timer = 0;
    enemytimer = 0;
    collectibles=document.getElementById("collectibles").value;
    enemies=document.getElementById("enemies").value;
    total = 0;
    mapSize=document.getElementById("mapsize").value;
    followRate=document.getElementById("followrate").value/100;
    health=document.getElementById("maxhealth").value;
    seed=document.getElementById("seed").value;


    gameMap = new GameMap(tileSize, speed, enemyspeed, mapSize, enemies, collectibles, followRate, health,seed);
    
}
    document.getElementById("restart").style.display="none";
    document.getElementById("newGame").style.display="none";

function StartPage(){
    let startButton=document.getElementById("start");
        startButton.addEventListener('click', startGame,);
        document.getElementById("HUD").style.display="none";
        document.getElementById("pointcontainer").style.display="none";

}
function startGame(){
    setVariables();
    setInterval(gameLoop,1000 / 60);
    document.addEventListener('keydown', function(event) {
        if(!gameMap.isHeroMoving()){
            timer=speed;
        }
        direction=event.key;
    });
    document.addEventListener('keyup', function(event) {
        if(direction==event.key){
            direction="None";
        }
    });
}
function gameLoop(){
    renderHealth();
    updatePoints();
    if(health>0&&gameMap.points<collectibles){
        gameMap.draw(canvas,ctx,timer,enemytimer);
        health=gameMap.getHealth();
        if(timer==speed){
            gameMap.moveCharacter(direction);
            gameMap.charTickHappened();
            timer=0;
        }
        if(enemytimer==enemyspeed){
            gameMap.updateEnemies();
            enemytimer=0;
        }
        enemytimer++;
        timer++;

        //console.log("tick");
    }else{
        if(gameMap.points==collectibles){
            EndGameScreen(true);
        }else{
            EndGameScreen(false);
        }


    }


}

function EndGameScreen(win){
    const img = new Image();
    if(win){
        img.src = `images/winner.png`;
        document.getElementById("newGame").style.display="";
    }else{
        img.src = `images/gameover.png`;
    }
    document.getElementById("restart").style.display="";
    ctx.drawImage(img,canvas.width/2-200,canvas.height/2-100,400,200);


}

function renderHealth(){
    let heartImg=new Image();
    heartImg.src =`images/heart.png`;
    let emptyHeartImg=new Image();
    emptyHeartImg.src =`images/emptyheart.png`;
    hudcanvas.height = tileSize;
    hudcanvas.width = 9*tileSize;
    hudctx.fillStyle="#676767";
    hudctx.fillRect(0,0,hudcanvas.width,hudcanvas.height);
    for (let i = 0; i <= 9; i++) {

        if(i>=health){
            hudctx.drawImage(emptyHeartImg,i*tileSize,0,tileSize,tileSize);
        }else{
            hudctx.drawImage(heartImg,i*tileSize,0,tileSize,tileSize);

        }
    }
}
function updatePoints(){
    if(total!=gameMap.points||total==0){
        total=gameMap.points;
        points.innerHTML=gameMap.points+"/"+collectibles;
        totalPoints.innerHTML="Total: "+total;
        //console.log("coll:"+collectibles+", points:"+gameMap.points);
    }


}
function restart(){
    setVariables();
    document.getElementById("restart").style.display="none";
    document.getElementById("newGame").style.display="none";
}
