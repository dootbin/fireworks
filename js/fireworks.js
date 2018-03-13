var canvas = document.querySelector('.fireworks'),
  ctx = canvas.getContext('2d'),

  // full screen dimension

  canvasWidth = window.innerWidth,
  canvasHeight = window.innerHeight,

  //Particle object arrays
  fireworks = [],
  particles = [],
  smokePuffs = [],

  maxSmokeVelocity = 1,

  hue = 120,

  //When launching, fireworks via click itap,
  //too many particles will get launched at once
  //without some limitation applied. We will use
  //the following to limit to one launch per 5 loop ticks.
  //
  limiterTotal = 5;
  limiterTick = 0;
  
  //We also need to time the auto launch of fireworks
  //to see one launch per 80 loop ticks
  timerTotal = 80;
  timerTick = 0;

  mouseDown = false,
  mouseXPosition,
  mouseYPosition,

  smokeImage = new Image();

  // Preload the smoke image
  
smokeImage.src = "../smokeImages/smoke.png";

  // Set our canvas dimentions to match the dementions of our
  // browser's inner window. (viewport). 
canvas.width = canvasWidth;
canvas.height = canvadHeight;

function randRange( min, max ) {
  return Math.random() * (max - min) + min;
}

// Calculate the distance between two given points
//

function calculateDistance(point1X, point1Y, point2X, point2Y) {

  var xDistance = point1X - point2X; 
  var yDistance = point1Y - point2Y;

  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));

}

//Create a firework particle object class consturctor function
//
function Firework(startX, startY, targetX, targetX) {
  
  this.x = startX;
  this.y = startY;

  this.startX = startX;
  this.startY = startY;

  this.targetX = targetX;
  this.targetY = targetY;

  // distance between the starting and ending (target)

  this.distanceToTarget = calculateDistance(startX, startY, targetX, targetY);

  this.distanceTraveled = 0;

  // Track the coordinates of where the Firework particle 
  // has been as it is flying toward the target point. 
  // we can create a trail effect. 

  this.coordinates = [];
  this.coordinateCount = 5;

  //Populate the initial coordinates collection with the current 
  //coordinates of the Firework particle; 
  //

  while (this.coordinateCount--) {

    this.coordinates.push([this.x, this.y]);
    
  }
  
  this.angle = Math.atan2(targetY - startY, targetX - startX);
  this.speed = 2;
  this.acceleration = 1.05;
  this.brightness = randRange(50, 70);
  //circle target indicator radius
  this.targetRadius = 1;



}
//heartBeat will be called framerate times per second.

function heartBeat() {

  if ( timerTick >= timerTotal ) {

    if (!mouseDown) {

    fireworks.push(new Firework(canvasWidth/2,canvasHeight, randRange(0, canvasWidth),randRange(0, canvasHeight/2))); 
      
    timerTick = 0;
    }
   
  } else {

    timerTick ++;

  }

}

// Get our heartBeat started

window.onload = heartBeat;
