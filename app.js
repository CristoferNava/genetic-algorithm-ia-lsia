RECTANGLE_X = 380; // The x-axis coordinate of the rectangle's starting point. 380
RECTANGLE_Y = 745; // The y-axis coordinate of the rectangle's starting point. 745
RECTANGLE_WIDTH = 40;
RECTANGLE_HEIGHT = 40;
BALL_START_X = 395; 
BALL_START_Y = 25;

POPULATION = 100;
NUM_GENES = 250; // More genes more movement per ball
MUTATION_RATE = 0.02;
MOBILITY = 25; // Grades of freedom of each ball
AVG_FITNESS = 0;
GENERATION = 0;
BALLS = [];

function test() {
    let population = document.getElementById('population').value;
    population = parseInt(population);
    POPULATION = population;

    let numGenes = document.getElementById('numGenes').value;
    numGenes = parseInt(numGenes);
    NUM_GENES = numGenes;

    let mutationRate = document.getElementById('mutationRate').value;
    mutationRate = parseInt(mutationRate);
    MUTATION_RATE = mutationRate;

    let mobility = document.getElementById('mobility').value;
    mobility = parseInt(mobility);
    MOBILITY = mobility;

    setup()
}

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
        // TODO Ayuda para poner otra cosa que no sea un círculo
        this.ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
        this.ctx.fill();
    }

    update() {
        if (this.x > RECTANGLE_X && this.x < (RECTANGLE_X+RECTANGLE_HEIGHT) && this.y > RECTANGLE_Y && this.y < (RECTANGLE_Y+RECTANGLE_HEIGHT)) {
            this.done = true;
            this.index++;
        } else if (this.index < NUM_GENES) {
            this.x += MOBILITY*this.genes[this.index][0];
            this.y += MOBILITY*this.genes[this.index][1];
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
        let distance = Math.sqrt((this.x - (RECTANGLE_X + (RECTANGLE_WIDTH/2)))**2 + (this.y - (RECTANGLE_Y+(RECTANGLE_HEIGHT/2)))**2);
        this.fitness = Math.max(0, 1 - distance/800);
    }
}

function setup() {
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    for (let i = 0; i < POPULATION; i++) {
        let ball = new Ball(BALL_START_X, BALL_START_Y, ctx);
        ball.setRandomGenes();
        BALLS.push(ball);
    }
    animateLoop();
}

// Infinite loop, listen for the animations (refresh)
function animateLoop() {
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');

    requestAnimationFrame(animateLoop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < POPULATION; i++) {
        let ball = BALLS[i];
        ball.update();
        ball.draw();
    }

    ctx.fillStyle = 'rgb(100, 135, 200)';
    // TODO Ayuda para poner otra cosa que no sea un rectángulo
    ctx.fillRect(RECTANGLE_X, RECTANGLE_Y, RECTANGLE_WIDTH, RECTANGLE_HEIGHT);
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.font = '30px Arial';
    ctx.fillText(`Generation: ${GENERATION.toString()}`, 15, 45);
    ctx.fillText(`Avg Fitness: ${AVG_FITNESS.toFixed(2).toString()}`, 15, 90);

    if (BALLS[0].index === NUM_GENES) nextGen();
}

function nextGen() {
    GENERATION++;

    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');

    // mating pool
    let candidates = [];
    let totalFitness = 0;
    for (let i = 0; i < POPULATION; i++) {
        let ball = BALLS[i];
        ball.calcFitness();
        totalFitness += ball.fitness;
        for (let j = 0; j < (2**(ball.fitness * 10)); j++) {
            candidates.push(ball);
        }
    }
    AVG_FITNESS = totalFitness / POPULATION;

    // reproduce
    let newBalls = [];
    for (let i = 0; i < POPULATION; i++) {
        // father
        let father = candidates[Math.floor(Math.random() * candidates.length)];
        // mother 
        let mother = candidates[Math.floor(Math.random() * candidates.length)];
        // child
        let child = new Ball(BALL_START_X, BALL_START_Y, ctx);
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
    BALLS = newBalls; // replace previous GENERATION with current
}