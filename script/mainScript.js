"use strict";

let mainObj = {};

setInterval(update, 15);

;(function start(){
    getAllGameObjects();
    setEdibleObjects();
    mainObj.scoreSteps = [];
    mainObj.score = document.querySelector('#score');
    mainObj.unit = 'em';
    mainObj.wrapper = getGameObjectBySelector('#wrapper');
    mainObj.field = getGameObjectBySelector('#field');
    mainObj.player = createGameObject('div', 'player', false, [20, 20, 20, 20], mainObj.field);
    mainObj.cursor = createGameObject('div', 'cursor', false, [5, 5, 5, 5], mainObj.field);
    mainObj.cursor.hasCollision = false;
    
    addFuncs(mainObj.player);

    window.addEventListener('mousemove', (event)=>cursorMove(event));
    window.addEventListener('keypress', (event)=>spawnEater(event, [mainObj.player.width / 2, mainObj.player.top - mainObj.player.width / 2, mainObj.player.left + mainObj.player.width / 4]));
})();

function update(){
    updateAllGameObjects();
    objsBounce();
    mainObj.field.borderRepulsion();
    mainObj.allDivs = mainObj.field.elem.querySelectorAll('div');
    
    sizeUpdate(mainObj.cursor);
    sizeUpdate(mainObj.field);
    spawnEdible('food', 10);
    spawnEdible('poison', 5, mainObj.score.textContent % 10 == 0 && !mainObj.scoreSteps.includes(mainObj.score.textContent));
    sizeUpdate(mainObj.player);
    edibleUpdateSize('food');
    edibleUpdateSize('poison');
    if(mainObj.player.targetChange){
        mainObj.player.target = mainObj.cursor;
    }
    mainObj.player.repulsion('eater');
    mainObj.player.moveToTarget(mainObj.player.target);
    mainObj.player.eating('food');
    
    
    if(mainObj.eater){
        sizeUpdate(mainObj.eater);
        mainObj.eater.repulsion('food');
        mainObj.eater.repulsion('player');
        if(mainObj.eater.targetChange){
            mainObj.eater.getTarget('poison');
        }
        mainObj.eater.moveToTarget(mainObj.eater.target);
        mainObj.eater.eating('poison');
    }
}

function objsBounce(){
    for(let obj of mainObj.allObj){
        if(obj.repulsor){
            obj.bouncing();
        }
    }
}

function edibleUpdateSize(type){
    for(let obj of mainObj[type].arr){
        sizeUpdate(obj);
    }
}

function foodMove(){
    for(let obj of mainObj.food.arr){
        if(obj.target){
            obj.moveToTarget(obj.target);
        }
    }
};

function getAllGameObjects(){
    mainObj.allObj = [];
    for(let obj in mainObj){
        if(mainObj[obj].elem){
            mainObj.allObj.push(mainObj[obj]);
        }else if(mainObj[obj].arr){
            for(let i = 0; i < mainObj[obj].arr.length; i++){
                mainObj.allObj.push(mainObj[obj].arr[i])
            }
        }
    }
}

function updateAllGameObjects(){
    for(let i = 0; i < mainObj.allObj.length; i++){
        mainObj.allObj.splice(i, 1);
    }
    for(let obj in mainObj){
        if(mainObj[obj].elem){
            mainObj.allObj.push(mainObj[obj]);
        }else if(mainObj[obj].arr){
            for(let i = 0; i < mainObj[obj].arr.length; i++){
                mainObj.allObj.push(mainObj[obj].arr[i])
            }
        }
    }
}

function getEdibleArrs(){
    mainObj.food.arr = getGameObjects('.food');
    mainObj.poison.arr = getGameObjects('.poison');
}

function setEdibleObjects(){
    mainObj.food = {};
    mainObj.poison = {};

    mainObj.food.count = 1;
    mainObj.poison.count = 1;
    mainObj.food.arr = [];
    mainObj.poison.arr = [];
}

function createGameObject(selector, ident, identIsClass, [objWidth, objHeight, objTop, objLeft], parent){
    let gameObject = {};
    gameObject.elem = document.createElement(selector);
    if(identIsClass){
        gameObject.elem.classList.value = ident;
    }else{
        gameObject.elem.id = ident;
    }

    addFuncs(gameObject);

    gameObject.sizeEditor(objWidth, 'width');
    gameObject.sizeEditor(objHeight, 'height');

    gameObject.radius = objWidth / 2;

    gameObject.sizeEditor(objTop - gameObject.radius, 'top');
    gameObject.sizeEditor(objLeft - gameObject.radius, 'left');

    gameObject.hasCollision = true;
    gameObject.targetChange = true;

    gameObject.computedStyle = getComputedStyle(gameObject.elem);
    gameObject.identificator = Math.round(Math.random() * 100000);

    sizeUpdate(gameObject);
    parent.elem.append(gameObject.elem);

    return gameObject;
}

function sizeEditor(size, sizeType){
    if(size){
        this.elem.style[sizeType] = size + mainObj.unit;
    }
}

function getGameObjectBySelector(selector){
    let gameObject = {};

    gameObject.elem = document.querySelector(selector);
    gameObject.computedStyle = getComputedStyle(gameObject.elem);
    gameObject.marginLeft = parseInt(gameObject.computedStyle.marginLeft);
    gameObject.marginTop = parseInt(gameObject.computedStyle.marginTop);
    addFuncs(gameObject);
    sizeUpdate(gameObject);

    return gameObject;
}

function getGameObjectByElem(elem){
    let gameObject = {};

    gameObject.elem = elem;
    gameObject.computedStyle = getComputedStyle(gameObject.elem);

    addFuncs(gameObject);
    sizeUpdate(gameObject);
    gameObject.hasCollision = true;

    return gameObject;
}

function getGameObjectsBySelector(selector){
    let gameObjects = [];
    let elems = field.querySelectorAll(selector);

    for(let elem of elems){
        gameObjects.push(getGameObjectByElem(elem));
    }

    return gameObjects;
}

function eating(healType, destroyer = this){
    let obj = this.onCollisionEnter();

    if(obj){
        if(obj.elem.classList.contains('food') && healType != 'poison'){
            destroyFood(destroyer, obj);
        }
        if(obj.elem.classList.contains('poison')){
            destroyPoison(destroyer, obj, healType);
        }
    }
}

function destroyFood(destroyer, food){
    food.elem.remove();
    for(let i = 0; i < mainObj.food.arr.length; i++){
        if(mainObj.food.arr[i] == food){
            console.log(food);
            mainObj.food.arr.splice(i, 1);
        }
    }
    mainObj.score.textContent++;
    console.log('df');
    if(destroyer.width < 100){
        destroyer.elem.style.width = destroyer.width + (food.width / 2) + mainObj.unit;
        destroyer.elem.style.height = destroyer.elem.style.width;
    }
}

function destroyPoison(destroyer, poison, healType){
    poison.elem.remove();
    if(healType != 'poison'){
        mainObj.score.textContent -= 10;
            destroyer.elem.style.width =  destroyer.width / 2 + mainObj.unit;
            destroyer.elem.style.height = destroyer.elem.style.width;
    }else if(destroyer.width < 100){        
        destroyer.elem.style.width =  destroyer.width + (poison.width / 5) + mainObj.unit;
        destroyer.elem.style.height = destroyer.elem.style.width;
    }
    for(let i = 0; i < mainObj.poison.arr.length; i++){
        if(mainObj.poison.arr[i] == poison){
            mainObj.poison.arr.splice(i, 1);
        }
    }
}

function spawnEdible(type, size, poisonWave = false){
    if(mainObj[type].arr.length == 0 || poisonWave){
        let gameObjects = spawnGameObjects('div', type, [size, size], mainObj.field, mainObj[type].count++);
        mainObj[type].arr.push(...gameObjects);
    }
    if(poisonWave){
        mainObj.scoreSteps.push(mainObj.score.textContent)
    }
}

function spawnGameObjects(selector, ident, [objWidth, objHeight], parent, count){
    let gameObjects = [];
    for(let i = 0; i < count; i++){
        let randomTop = getRandomCoordinate(parseFloat(parent.computedStyle.height));
        let randomLeft = getRandomCoordinate(parseFloat(parent.computedStyle.width));
        gameObjects.push(createGameObject(selector, ident, true, [objWidth, objHeight, randomTop, randomLeft], parent));
    }
    return gameObjects;
}

function spawnEater(event, [size, top, left]){
    if(event.code == 'Space' && !mainObj.eater){
        mainObj.eater = createGameObject('div', 'eater', false, [size, size, top, left], mainObj.field);
    }
}

function getTarget(type){
    let distanceObj = {};

    for(let obj of mainObj[type].arr){
        distanceObj[getDistance(this, obj).diagonal] = obj;
    }

    this.target = distanceObj[Math.min(...Object.keys(distanceObj))];
}

function getRandomCoordinate(maxValue){
    let random = Math.round(Math.random() * maxValue);
    if(random > maxValue - 20){
        return random - 20;
    } else if(random < 20){
        return random + 20;
    } 
    return random;
}

function moveToTarget(target, speed = 20 / (this.width / 2)){
    let distance = getDistance(this, target);
    this.decreasingDistance( distance, speed);
}

function decreasingDistance( distance, speed){

    let nextTop = this.top -   (distance.diagonal / 100) * speed * distance.top / distance.diagonal;
    let nextLeft = this.left - (distance.diagonal / 100) * speed * distance.left / distance.diagonal;
    this.speed = (distance.diagonal / 100) * speed;
    if(nextTop > parseFloat(mainObj.field.computedStyle.height) - this.height){
        nextTop -= nextTop - parseFloat(mainObj.field.computedStyle.height) + this.height;
    }
    if(nextTop < 0){
        nextTop += -nextTop;
    }
    if(nextLeft > parseFloat(mainObj.field.computedStyle.width) - this.width){
        nextLeft -= nextLeft - parseFloat(mainObj.field.computedStyle.width) + this.width;
    }
    if(nextLeft < 0){
        nextLeft += -nextLeft;
    }
    this.elem.style.top = nextTop + mainObj.unit;
    this.elem.style.left = nextLeft + mainObj.unit;
}

function increasingDistance(distance, speed){
    let nextTop = this.top +   speed / distance.diagonal * 100 * distance.top / distance.diagonal;
    let nextLeft = this.left + speed / distance.diagonal * 100 * distance.left / distance.diagonal;
    speed--;
    this.speed = speed / distance.diagonal * 100;
    if(nextTop > parseFloat(mainObj.field.computedStyle.height) - this.height){
        nextTop -= nextTop - parseFloat(mainObj.field.computedStyle.height) + this.height;
    }
    if(nextTop < 0){
        nextTop += -nextTop;
    }
    if(nextLeft > parseFloat(mainObj.field.computedStyle.width) - this.width){
        nextLeft -= nextLeft - parseFloat(mainObj.field.computedStyle.width) + this.width;
    }
    if(nextLeft < 0){
        nextLeft += -nextLeft;
    }
    this.elem.style.top = nextTop + mainObj.unit;
    this.elem.style.left = nextLeft + mainObj.unit;
}

function getDistance(gameObject1, gameObject2){
        let distance = {};
    
        distance.top = (gameObject1.top + (gameObject1.width) / 2) - (gameObject2.top + (gameObject2.width) / 2);
        distance.left = (gameObject1.left + (gameObject1.height) / 2) - (gameObject2.left + (gameObject2.height) / 2);
        distance.diagonal = Math.sqrt(distance.top**2 + distance.left**2);
        return distance;
}

function onCollisionEnter(){
    for(let obj of mainObj.allObj){
        let distance = getDistance(this, obj);
        if(distance.diagonal < this.radius + obj.radius && obj != this && obj.hasCollision){
                return obj;
        }
    }
    return false;
}

function borderCollision(){
    let compStyle = getComputedStyle(this.elem);
    for(let obj of mainObj.allObj){
        if(obj.bottom > parseFloat(compStyle.height) - 2 || obj.top < 2 || obj.right > parseFloat(compStyle.width) - 2 || obj.left < 2){
            return obj;
        }
    }
    return false;
}

function repulsion(repelledType){
    let obj = this.onCollisionEnter();
    if(obj && (obj.elem.classList.contains(repelledType) || obj.elem.id == repelledType && this.radius >= obj.radius)){
        let distance = getDistance(obj, this);
        setTimeout(()=>{
            if(obj.repulsor != obj.onCollisionEnter()){
                obj.repulsor = false; console.log('false');
            }
        }, 500);

        obj.repulsor = this;
        obj.bouncingDistance = distance;
    }
}

function borderRepulsion(){
    let obj = this.borderCollision();
    if(obj && obj.hasCollision){
        let compStyle = getComputedStyle(this.elem);
        let distanceXRight = getDistance(obj, {top:0, left: parseFloat(compStyle.width) - 1, width: 1, height: 1}).left;
        let distanceXLeft = getDistance(obj, {top:0, left: 0, width: 1, height: 1}).left;
        let distanceYTop = getDistance(obj, {top:0, left: 0, width: 1, height: 1}).top;
        let distanceYBottom = getDistance(obj, {top: parseFloat(compStyle.height) - 1, left: 0, width: 1, height: 1}).top;
        console.log({distanceXRight, distanceXLeft, distanceYTop, distanceYBottom});
        if(distanceXRight < 30){
            obj.increasingDistance({top: distanceXRight - 30, left: obj.centerX, diagonal: distanceXRight - 30});
        }
    }
}

function bouncing(bouncer = this, repulsor = this.repulsor){
        let distance = getDistance(bouncer, repulsor);
        let speed = 20 / (repulsor.width / 2);
        let targetDistance = bouncer.radius + repulsor.radius * 4;
        if(distance.diagonal < targetDistance){
            bouncer.increasingDistance(distance, speed);
        } else {
            repulsor = false;
        }
        console.log((targetDistance / bouncer.speed) * 15);
}

function targetChanger(obj, target){
    obj.target = target;
    obj.targetChange = false;
    setTimeout(()=>{obj.targetChange = true}, 500);
    sizeUpdate(obj);
}

function isEdible(obj, type, func, params){
    if(obj.elem.classList.contains(type)){
        for(let elem of mainObj[type].arr){
            if(elem.identificator == obj.identificator){
                func(elem, ...params);
            }
        }
    }
}

function sizeUpdate(obj){
    if(obj){
        obj.top = parseFloat(obj.elem.style.top);
        obj.left = parseFloat(obj.elem.style.left);
        obj.width = parseFloat(obj.elem.style.width);
        obj.height = parseFloat(obj.elem.style.height);
        obj.radius = parseFloat(obj.elem.style.height) / 2;
        obj.right = parseFloat(obj.elem.style.left) + obj.width;
        obj.bottom = parseFloat(obj.elem.style.top) + obj.height;
        obj.centerY = obj.top + obj.radius;
        obj.centerX = obj.left + obj.radius;
        obj.deg45 = {y: [obj.centerY - (obj.radius / 100) * 70], x: [obj.centerX + (obj.radius / 100) * 70]};
        obj.deg315 = {y: [obj.centerY + (obj.radius / 100) * 70], x: [obj.centerX - (obj.radius / 100) * 70]};
        obj.deg225 = {y: [obj.centerY - (obj.radius / 100) * 70], x: [obj.centerX - (obj.radius / 100) * 70]};
        obj.deg135 = {y: [obj.centerY + (obj.radius / 100) * 70], x: [obj.centerX + (obj.radius / 100) * 70]};
    }
}

function addFuncs(obj){
    obj.moveToTarget = moveToTarget;
    obj.decreasingDistance = decreasingDistance;
    obj.increasingDistance = increasingDistance;
    obj.sizeEditor = sizeEditor;
    obj.eating = eating;
    obj.getDistance = getDistance;
    obj.getTarget = getTarget;
    obj.onCollisionEnter = onCollisionEnter;
    obj.repulsion = repulsion;
    obj.bouncing = bouncing;
    obj.borderCollision = borderCollision;
    obj.borderRepulsion = borderRepulsion;
}

function cursorMove(event){
    mainObj.cursor.elem.style.top = event.y - mainObj.wrapper.marginTop + mainObj.unit;
    mainObj.cursor.elem.style.left = event.x - mainObj.wrapper.marginLeft + mainObj.unit;
}
