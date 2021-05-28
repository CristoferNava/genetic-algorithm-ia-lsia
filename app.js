NUM_GENES = 250;
VEL = 25;
NUM_BALLS = 100;
MUTATION_RATE = 0.02;

avg_fitness = 0;
generation = 0;
balls = [];

document.addEventListener("DOMContentLoaded", setup)

class Ball {
    constructor(x, y, ctx) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
        this.radius = 10;
        this.index = 0;
        this.fitness = 0;
        this.done = false;
    }

    draw() {
        this.ctx.fillStyle = 'rgb(173, 216, 230)';
        if (this.done) {
            this.ctx.fillStyle = 'rgb(32, 171, 56)';
        }
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
        this.ctx.fill();
    }

    update() {
        if (this.x > 380 && this.x < 420 && this.y > 745 && this.y < 785) {
            this.done = true;
            this.index++;
        } else if (this.index < NUM_GENES) {
            this.x += VEL*this.genes[this.index][0];
            this.y += VEL*this.genes[this.index][1];
            this.index++;
        }
    }

    setGenes(genes) {
        this.genes = genes;
    }

    setRandomGenes() {
        this.genes = [];
        for (let i = 0; i < NUM_GENES; i++) { 
            this.genes[i] = [Math.random()-0.5, Math.random()-0.5]
        }
    }

    calcFitness() {
        let distance = Math.sqrt((this.x - 400)**2 + (this.y - 765)**2);
        this.fitness = Math.max(0, 1 - distance/800);
    }
}

function setup() {
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    
    for (let i = 0; i < NUM_BALLS; i++) {
        let ball = new Ball(395, 25, ctx);
        ball.setRandomGenes();
        balls.push(ball);
    }
    animateLoop();
}

function loop() {
    if (generation === 2000) return;

    for (let i = 0; i < NUM_GENES; i++) {
        for (let j = 0; j < NUM_BALLS; j++) {
            balls[j].update();
        }
    }
    nextGen();
    loop();
}

function animateLoop() {
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');

    requestAnimationFrame(animateLoop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < NUM_BALLS; i++) {
        let ball = balls[i];
        ball.update();
        ball.draw();
    }

    ctx.fillStyle = 'rgb(173, 216, 230)';
    ctx.fillRect(380, 745, 40, 40);
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.font = '30px Arial';
    ctx.fillText(`Generation: ${generation.toString()}`, 15, 45);
    ctx.fillText(`Avg fitness: ${avg_fitness.toFixed(2).toString()}`, 15, 90);

    if (balls[0].index === NUM_GENES) nextGen();
}

function nextGen() {
    generation++;

    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');

    // mating pool
    let candidates = [];
    let total_fitness = 0;
    for (let i = 0; i < NUM_BALLS; i++) {
        let ball = balls[i];
        ball.calcFitness();
        total_fitness += ball.fitness;
        for (let j = 0; j < (2**(ball.fitness * 10)); j++) {
            candidates.push(ball);
        }
    }
    avg_fitness = total_fitness / NUM_BALLS;

    // reproduce
    let newBalls = [];
    for (let i = 0; i < NUM_BALLS; i++) {
        // father
        let father = candidates[Math.floor(Math.random() * candidates.length)];
        // mother 
        let mother = candidates[Math.floor(Math.random() * candidates.length)];
        // child
        let child = new Ball(395, 25, ctx);
        // child's genes
        let genes = [];

        for (let j = 0; j < NUM_GENES; j++) {
            // chose random gene MUTATION_RATE % of time (currently 5%)
            if (Math.random() < MUTATION_RATE) genes.push([Math.random()-0.5, Math.random()-0.5]);
            else if (j % 2) genes.push(father.genes[j]); // father's genes first half
            else genes.push(mother.genes[j]); // mother's genes second 
        }
        child.setGenes(genes);
        newBalls.push(child)

    }
    balls = newBalls; // replace previous generation with current
}