export default class GameMap {


    constructor(tileSize, speed, enemyspeed, mapSize,enemies,collectibles,followRate,health,seed) {
        this.map = new Array(mapSize);
        this.tileSize=tileSize;
        this.wall = this.#image("wall.png");
        this.cat = this.#image("cat.png");
        this.blob = this.#image("blob.png");
        this.empty = this.#image("empty.png");
        this.ball = this.#image("stringball.png");
        this.mapSize = mapSize;
        this.speed =speed;
        this.mapSize=mapSize;
        this.enemyspeed=enemyspeed;
        this.enemies = new Array(enemies);
        this.collectibles = new Array();
        this.points=0;
        this.canBeDamagedIn=0;
        this.followRate=followRate;
        this.health=health;
        this.seed=seed;

        this.createMap();
        this.spawnEnemies(enemies);
        this.spawnCollectibles(collectibles);
        this.hero = this.spawnHero();

    }
    spawnHero(){
        let row = Math.floor(Math.random() * this.mapSize);
        let col = Math.floor(Math.random() * this.mapSize);
        while(this.map[row][col].type==1 ||this.map[row][col].containsEnemy||this.map[row][col].containsCollectible){
            row = Math.floor(Math.random() * this.mapSize);
            col = Math.floor(Math.random() * this.mapSize);
        }
        return new Character(row,col,"hero");
    }
    spawnEnemies(amount){
        for (let i = 0; i < amount; i++) {
            let row = Math.floor(Math.random() * this.mapSize);
            let col = Math.floor(Math.random() * this.mapSize);
            while(this.map[row][col].type==1 ||this.map[row][col].containsEnemy){
                row = Math.floor(Math.random() * this.mapSize);
                col = Math.floor(Math.random() * this.mapSize);
            }
            this.enemies[i]=new Character(row,col,"enemy")
            this.map[row][col].addEnemy();
        }
    }
    spawnCollectibles(amount){
        for (let i = 0; i < amount; i++) {
            let row = Math.floor(Math.random() * this.mapSize);
            let col = Math.floor(Math.random() * this.mapSize);
            while(this.map[row][col].type==1 ||this.map[row][col].containsCollectible){
                row = Math.floor(Math.random() * this.mapSize);
                col = Math.floor(Math.random() * this.mapSize);
            }
            this.collectibles[i]=new Character(row,col,"collectible")
            this.map[row][col].addCollectible();
        }
    }
    createMap(){
        let params=new Array(4);
        params[0]=Math.floor(this.seed/1000);
        params[1]=Math.floor((this.seed-(params[0]*1000))/100);
        params[2]=Math.floor(((this.seed-(params[1]*100))-(params[0]*1000))/10);
        params[3]=Math.floor(((this.seed-(params[1]*100))-(params[0]*1000))-(params[2]*10));
        for (let i = 0; i < 4; i++) {
            if(params[i]==0){
                let sum=0;
                for (let j = 0; j < 4; j++) {
                    sum=params[j]+sum;
                }
                params[i]=sum;
            }
        }
        if(params[0]==params[1]){
            params[0]=params[0]*29/7;
            params[1]=params[1]*11/19;
        }
        if(params[2]==params[3]){
            params[2]=params[2]*29/7;
            params[3]=params[3]*11/19;
        }

        console.log(params[0]+""+params[1]+""+params[2]+""+params[3]);

        for (let i = 0; i < this.mapSize; i++) {
            this.map[i]=new Array(this.mapSize);
            for (let j = 0; j < this.mapSize; j++) {
                this.map[i][j]=new Tile(0,false,false);
                if(i%params[0]>params[1] && j%params[2]<params[3]){
                    this.map[i][j].makeWall();
                }
            }
        }
    }

    #image(fileName){
        const img = new Image();
        img.src = `images/${fileName}`;
        return img;
    }


    draw(canvas,ctx,timer,enemytimer){
        this.#setCanvasSize(canvas);
        this.#clearCanvas(canvas,ctx,timer,enemytimer);
    }
    #setCanvasSize(canvas){
        canvas.height = this.map.length*this.tileSize;
        canvas.width = this.map[0].length*this.tileSize;
    }
    #clearCanvas(canvas,ctx,timer,enemytimer){
        ctx.fillStyle="black";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        this.#drawMap(ctx,timer,enemytimer);
    }
    #drawMap(ctx,timer,enemytimer){
        for (let row = 0; row < this.map.length; row++) {
            for (let col = 0; col < this.map[row].length; col++) {
                const tile = this.map[row][col].type;
                let image =null;
                switch (tile){
                    case 0:
                        image = this.empty;
                        break;
                    case 1:
                        image = this.wall;
                        break;
                }
                ctx.drawImage(image,col*this.tileSize,row*this.tileSize,this.tileSize,this.tileSize);
            }
        }

        this.renderCollectibles(ctx);
        this.renderCat(ctx,timer);
        this.renderEnemies(ctx, enemytimer);

    }
    renderCat(ctx,timer){
        //render char
        if(timer<this.speed){
            let offset=(this.tileSize/this.speed)*timer;
            ctx.drawImage(this.cat,this.hero.preCol*this.tileSize+((this.hero.col-this.hero.preCol)*offset),this.hero.preRow*this.tileSize+((this.hero.row-this.hero.preRow)*offset),this.tileSize,this.tileSize);
        }else{
            this.hero.moving=false;
            ctx.drawImage(this.cat,this.hero.col*this.tileSize,this.hero.row*this.tileSize,this.tileSize,this.tileSize);
        }
    }
    renderEnemies(ctx, enemytimer){
        //render enemies
        for (let i = 0; i < this.enemies.length; i++) {
            if(enemytimer<this.enemyspeed){
                let offset=(this.tileSize/this.enemyspeed)*enemytimer;
                ctx.drawImage(this.blob,this.enemies[i].preCol*this.tileSize+((this.enemies[i].col-this.enemies[i].preCol)*offset),
                    this.enemies[i].preRow*this.tileSize+((this.enemies[i].row-this.enemies[i].preRow)*offset),this.tileSize,this.tileSize);
            }else{
                this.enemies[i].moving=false;
                ctx.drawImage(this.blob,this.enemies[i].col*this.tileSize,this.enemies[i].row*this.tileSize,this.tileSize,this.tileSize);
            }
        }
    }
    renderCollectibles(ctx){
        //collectibles
        for (let i = 0; i < this.collectibles.length; i++) {
            if(this.map[this.collectibles[i].row][this.collectibles[i].col].containsCollectible){
                ctx.drawImage(this.ball,this.collectibles[i].col*this.tileSize,this.collectibles[i].row*this.tileSize,this.tileSize,this.tileSize);
            }

        }
    }
    moveCharacter(direction){
        this.hero.Move(direction,this.map);

        this.positionCheck();
    }
    getHealth(){
        return this.health;
    }
    positionCheck(){
        this.enemyCheck();
        if(this.map[this.hero.row][this.hero.col].containsCollectible){
            this.pickUp();
        }
    }
    enemyCheck(){
        if(this.map[this.hero.row][this.hero.col].containsEnemy && this.canBeDamagedIn==0){
            //console.log("MEOOOWW!!!");
            if(this.health>0){
                this.health--;
                //console.log("HP:"+this.health);
            }
            this.canBeDamagedIn=7;


        }
    }
    pickUp(){
        this.points++;
        console.log("points: "+this.points);
        this.map[this.hero.row][this.hero.col].removeCollectible();
    }
    followsPlayer(i){
        let chance=Math.random();

        if(chance<this.followRate){
            //console.log("chance:"+chance+", rate="+this.followRate+", , /2="+this.followRate/2);

            if(chance<(this.followRate/2)){
                //prioritize ROW gap closing
                //console.log("ROWPRIO");
                if(this.enemies[i].row>=this.hero.row){
                    if(this.enemies[i].row==this.hero.row){
                        if(this.enemies[i].col>this.hero.col){
                            this.enemies[i].Move("ArrowLeft",this.map);
                            return true;
                        }else{
                            this.enemies[i].Move("ArrowRight",this.map);
                            return true;
                        }
                    }//enemy row larger, is under the character
                    this.enemies[i].Move("ArrowUp",this.map);
                    return true;
                }//enemy row is smaller, is above the character
                    this.enemies[i].Move("ArrowDown",this.map);
                return true;
            }else{
                //prioritize COL gap closing
                //console.log("COLPRIO");
                if(this.enemies[i].col>=this.hero.col){
                    if(this.enemies[i].col==this.hero.col){
                        if(this.enemies[i].row>this.hero.row){
                            this.enemies[i].Move("ArrowUp",this.map);
                            return true;
                        }else{
                            this.enemies[i].Move("ArrowDown",this.map);
                            return true;
                        }
                    }
                    //enemy col bigger - enemy is to the right
                    this.enemies[i].Move("ArrowLeft",this.map);
                    return true;
                }
                //enemy col smaller, is to the left
                this.enemies[i].Move("ArrowRight",this.map);
                return true;
            }

        }else{

        }
        return false;
    }
    updateEnemies(){
        this.enemyCheck();
        for (let i = 0; i < this.enemies.length; i++) {
            this.map[this.enemies[i].row][this.enemies[i].col].removeEnemy();
            if (!this.followsPlayer(i)) {
            if (this.enemies[i].row == this.enemies[i].preRow && this.enemies[i].col == this.enemies[i].preCol || Math.random() >= 0.8) {
                let direction = Math.floor(Math.random() * 4);
                switch (direction) {
                    case 0:
                        this.enemies[i].Move("ArrowUp", this.map);
                        break;
                    case 1:
                        this.enemies[i].Move("ArrowDown", this.map);
                        break;
                    case 2:
                        this.enemies[i].Move("ArrowLeft", this.map);
                        break;
                    case 3:
                        this.enemies[i].Move("ArrowRight", this.map);
                        break;
                }
            } else {
                this.enemies[i].Move(this.enemies[i].direction, this.map);
            }
        }

            this.map[this.enemies[i].row][this.enemies[i].col].addEnemy();
            //console.log("row: "+this.enemies[i].row + "col: "+this.enemies[i].col);
            //console.log("prerow: "+this.enemies[i].preRow + "precol: "+this.enemies[i].preCol);
        }
    }
    isHeroMoving(){
        return this.hero.moving;
    }
    charTickHappened(){
        if(this.canBeDamagedIn>0){
            this.canBeDamagedIn--;
        }
    }

}
class Character {
    constructor(row, col,type) {
        this.row = row;
        this.col = col;
        this.preRow = row;
        this.preCol = col;
        this.moving=false;
        this.direction="None";
        this.type=type;
    }
    Move(direction,map){
        this.preRow=this.row;
        this.preCol=this.col;
        switch (direction){
            case "ArrowUp":
                if(this.row>0) {
                    if(map[this.row-1][this.col].type!=1 && (!map[this.row-1][this.col].containsEnemy ||this.type=="hero")){
                        this.moving=true;
                        this.row--;
                        this.direction=direction;
                    }
                }
                break;
            case "ArrowDown":
                if(this.row< map.length-1){
                    if(map[this.row+1][this.col].type!=1 && (!map[this.row+1][this.col].containsEnemy ||this.type=="hero")){
                        this.moving = true;
                        this.row++;
                        this.direction=direction;
                    }
                }
                break;
            case "ArrowLeft":
                if(this.col>0) {
                    if(map[this.row][this.col-1].type!=1 && (!map[this.row][this.col-1].containsEnemy ||this.type=="hero")){
                        this.moving = true;
                        this.col--;
                        this.direction=direction;
                    }
                }
                break;
            case "ArrowRight":
                if(this.col<map[this.row].length-1){
                    if(map[this.row][this.col+1].type!=1 && (!map[this.row][this.col+1].containsEnemy ||this.type=="hero")){
                        this.moving = true;
                        this.col++;
                        this.direction=direction;
                    }
                }
                break;
        }
    }
}
class Tile{
    constructor(type,containsEnemy,containsCollectible) {
        this.type=type;
        this.containsEnemy=containsEnemy;
        this.containsCollectible=containsCollectible;
    }
    removeCollectible(){
        this.containsCollectible=false;
    }
    addCollectible(){
        this.containsCollectible=true;
    }
    removeEnemy(){
        this.containsEnemy=false;
    }
    addEnemy(){
        this.containsEnemy=true;
    }
    makeWall(){
        this.type=1;
    }
    destroyWall(){
        this.type=0;
    }
}