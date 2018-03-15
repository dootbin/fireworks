var canvas = document.querySelector('.fireworks'),
    ctx = canvas.getContext('2d'),
    
    // full screen dimension
    canvasWidth = window.innerWidth,
    canvasHeight = window.innerHeight,
    
    // particle object arrays
    fireworks = [],
    particles = [],
    smokePuffs = [],
    
    maxSmokeVelocity = 1,
    
    hue = 120,
    
    // When launching fireworks via a click (tap),
    // too many particles will get launched at once
    // without some limitation applied. We will use
    // the following to limit to one launch per 5 loop ticks.
    limiterTotal = 5,
    limiterTick = 0,
    
    // We also need to time auto launches of fireworks
    // to see one launch per 80 loop ticks.
    timerTotal = 80,
    timerTick = 0,
    
    mouseDown = false,
    mouseXPosition,
    mouseYPosition,
    
    smokeImage = new Image();


// Preload the smoke image
smokeImage.src = "smokeImages/smoke.png";

// Set our canvas dimensions to match the dimensions of our browser's
// inner window (viewport).
canvas.width = canvasWidth;
canvas.height = canvasHeight;

//
// Helper functions
//
function randRange(min, max) {
    return Math.random() * (max - min) + min;
}


// Calculate the distance between two given points
function calculateDistance(point1X, point1Y, point2X, point2Y) {
    
    var xDistance = point1X - point2X,
        yDistance = point1Y - point2Y;
    
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    
}




//
// Create a Firework particle object class constructor function
//
function Firework(startX, startY, targetX, targetY) {
    
    this.x = startX;
    this.y = startY;
    
    this.startX = startX;
    this.startY = startY;
    
    this.targetX = targetX;
    this.targetY = targetY;
    
    // distance between the starting and ending (target) points
    this.distanceToTarget = calculateDistance(startX, startY, targetX, targetY);
    
    this.distanceTraveled = 0;
    
    // Track the coordinates of where the Firework particle
    // has been as it is flying toward the target point so 
    // we can create a trail effect.
    this.coordinates = [];
    this.coordinateCount = 5;
    
    // Populate the initial coordinates collection (array) with
    // the current coordinates of the Firework particle.
    while (this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
    }
    
    this.angle = Math.atan2(targetY - startY, targetX - startX);
    
    this.speed = 2;
    
    this.acceleration = 1.05;
    
    this.brightness = randRange(50, 70);
    
    // circle target indicator radius
    this.targetRadius = 1;
    
}


/*
Firework.prototype = {
    
    draw: function() {},
    
    update: function() {}
    
};
*/
//
// Draw the Firework particle object - method of the Firework
// class.
//
Firework.prototype.draw = function() {
    
    ctx.beginPath();
    
    // Move to the last tracked coordinate (last element)
    // in our this.coordinates array property
    ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
    
    // Now, specify the ending point of the line to be drawn.
    ctx.lineTo(this.x, this.y);
    
    ctx.strokeStyle = 'hsl(' + hue + ', 100%, ' + this.brightness + '%)';
    
    ctx.stroke();
    
    // Draw a pulsing circle to represent this Firework's target
    ctx.beginPath();
    ctx.arc(this.targetX, this.targetY, this.targetRadius, 0, Math.PI * 2);
    ctx.stroke();
    
};


// 
// Update (animate) the Firework particle
//
Firework.prototype.update = function(index) {
    
    // Remove the last element in the coordinates array property
    this.coordinates.pop();
    
    // Now, add the point the Firework is now at to the 
    // beginning of our coordinates array property (insert)
    this.coordinates.unshift([this.x, this.y]);
    
    // Make the target circle pulsate by adjusting its radius
    if (this.targetRadius < 8) {
        this.targetRadius += .3;
    } else {
        this.targetRadius = 1;
    }
    
    // Speed up the firework
    this.speed *= this.acceleration;
    
    // Calculate the current velocities based on angle and speed
    var velocityX = Math.cos(this.angle) * this.speed,
        velocityY = Math.sin(this.angle) * this.speed;
    
    // How far will the firework have traveled with the 
    // above velocities applied
    this.distanceTraveled = calculateDistance(this.startX, this.startY, this.x + velocityX, this.y + velocityY);
    
    // If the distance traveled, including velocities,
    // is greater than the intial distance to target,
    // then the target is reached.
    if (this.distanceTraveled >= this.distanceToTarget) {
        
        //console.log("Arrived");
        // Create explosion
        createExplosion(this.targetX, this.targetY);
        
        // Create smoke
        createSmoke(this.targetX, this.targetY);
        
        // Clean up Firework particle by removing it from 
        // our fireworks array.
        fireworks.splice(index, 1);
        
    } else {  // not there yet...  Move the Firework
        
        this.x += velocityX;
        this.y += velocityY;
        
    }
    
};


//
// Create Explosion Particles
//
function createExplosion(x, y) {
    
    var particlesCount = 80;
    
    while (particlesCount--) {
        particles.push(new ExplosionParticle(x, y));
    }
    
}


//
// ExplosionParticle constructor
//
function ExplosionParticle(x, y) {
    
    this.x = x;
    this.y = y;
    
    // Track the past coordinates of each explosion
    // particle to create a trail effect.
    this.coordinates = [];
    this.coordinateCount = Math.round(randRange(10, 20));
    
    // Populate the initial coordinates array will the 
    // current coordinates
    while (this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
    }
    
    this.angle = randRange(0, Math.PI*2);
    
    this.speed = randRange(1, 10);
    
    this.friction = .95;
    
    this.gravity = 1;
    
    this.hue = randRange(hue - 20, hue + 20);
    this.brightness = randRange(50, 80);
    this.alpha = 1;
    
    this.decay = randRange(.003, .006);
    
}


ExplosionParticle.prototype.draw = function() {
    
    ctx.beginPath();
    
    // Move to the last tracked coordinate (last element)
    // in our this.coordinates array property
    ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
    
    // Now, draw a curve.
    ctx.quadraticCurveTo(this.x + 1, this.y - Math.round(randRange(5, 10)), this.x, this.y);
    
    ctx.strokeStyle = 'hsla(' + hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
    
    ctx.stroke();
    
};


// 
// Update (animate) the Explosion particle
//
ExplosionParticle.prototype.update = function(index) {
    
    // Remove the last element in the coordinates array property
    this.coordinates.pop();
    
    // Now, add the point the Explosion Particle is now at to the 
    // beginning of our coordinates array property (insert)
    this.coordinates.unshift([this.x, this.y]);
    
    // Slow down the explosion particle slightly
    this.speed *= this.friction;
    
    // Calculate the current velocities based on angle and speed
    // to reset the current particle location
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    
    this.alpha -= this.decay;
    
    if (this.alpha <= this.decay) {
        particles.splice(index, 1);  // remove this particle
    }
    
};

// Create smoke constructor. 

function createSmoke(x, y) {

  var puffCount = 1;

  for (var i = 0; i < puffCount; i++) {

    smokePuffs.push(new SmokePuff(x,y));
  }

}

//SmokePuff Constructor
function SmokePuff(x,y) {

  this.x = randRange(x - 25, x + 25);
  this.y = randRange(y - 15, y + 15);
  
  this.xVelocity = randRange(.2, maxSmokeVelocity);
  this.yVelocity = randRange(-.1, -maxSmokeVelocity);

  this.alpha = 1;
}

SmokePuff.prototype.draw = function() {

if (smokeImage) {

  // DRAW IMAGE ON CANVAS
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.drawImage(smokeImage, this.x - smokeImage.width/2, this.y - smokeImage.height/2);
  ctx.restore();
}


}

SmokePuff.prototype.update = function(index) {

  this.x += this.xVelocity;
  this.y += this.yVelocity;
  this.alpha -= .001;

  if (this.alpha < 0) {
    smokePuffs.splice(index, 1);
  }

}

// 
// heartBeat will be called framerate times per second
//
function heartBeat() {
    
    // Call heartBeat recursively framerate times per second
    requestAnimationFrame(heartBeat);
    
    // Increase the hue value slightly to get different
    // firework colors over time.
    hue += 0.5;
    
    // Normally, ctx.clearRect() would be used to clear
    // the canvas (either all of it or a rectangular portion
    // of it), but we want to create a trail effect on our
    // firework as it travels through the sky.
    //
    // Setting the composition operation of the context
    // object to a value of 'destination-out' will allow us
    // to clear the canvas at a specific opacity, rather
    // than wiping it completely clear.
    ctx.globalCompositeOperation = 'destination-out';
    
    // Note: decrease the alpha value to create more 
    //       prominent trails.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Setting a new composite operation value of 'lighter'
    // creates bright highlight points as the fireworks
    // and the explosion particles overlap each other.
    ctx.globalCompositeOperation = 'lighter';
    
    
    // Loop over each Firework particle, draw it, and 
    // animate it.
    var i = fireworks.length;
    
    while (i--) {
        fireworks[i].draw();
        fireworks[i].update(i);
    }
    
    // Loop over each Explosion particle, draw it, and 
    // animate it.
    var i = particles.length;
    
    while (i--) {
        particles[i].draw();
        particles[i].update(i);
    }

    var i = smokePuffs.length;
    
    while (i--) {
        smokePuffs[i].draw();
        smokePuffs[i].update(i);
    }
    
    // Launch a firework automatically to a random target
    // coordinate when the mouse is not pressed down...
    if (timerTick >= timerTotal) {
        
        if (!mouseDown) {  // mouse is not pressed down
            
            // Launch a firework particle from bottom-middle
            // of the screen (ground), then set a random
            // target point (coordinates).  Note: target y-position
            // should always be in top half of screen - safety first!
            fireworks.push(new Firework(canvasWidth/2, canvasHeight, randRange(0, canvasWidth), randRange(0, canvasHeight/2)));
            
            timerTick = 0;
            
        }
        
    } else {
        timerTick++;
    }
    
}



// Get our heartBeat started - jump around!
window.onload = heartBeat;