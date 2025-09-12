const canvas = document.getElementById("mouseCanvas");
const ctx = canvas.getContext("2d");

// Make canvas responsive
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let particles = [];
let mousePosition = { x: 0, y: 0 };
let isMouseMoving = false;
let lastMousePosition = { x: 0, y: 0 };

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 6 + 2;
        this.speedX = (Math.random() - 0.5) * 3;
        this.speedY = (Math.random() - 0.5) * 3;
        this.alpha = 1;
        this.color = this.generateColor();
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    generateColor() {
        // Use colors from the provided palette
        const colors = [
            'rgba(0, 174, 255, 0.8)',    // Bright blue
            'rgba(99, 89, 233, 0.8)',     // Purple
            'rgba(2, 28, 30, 0.8)',       // Dark green
            'rgba(0, 119, 182, 0.8)',     // Deep blue
            'rgba(202, 240, 248, 0.8)',   // Light blue
            'rgba(25, 25, 112, 0.8)'      // Midnight blue
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= 0.02;
        this.rotation += this.rotationSpeed;
        this.size = Math.max(0, this.size - 0.05);
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.beginPath();
        for(let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i;
            const x = Math.cos(angle) * this.size;
            const y = Math.sin(angle) * this.size;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
    }
}

window.addEventListener("mousemove", function(e) {
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;
    
    const dx = mousePosition.x - lastMousePosition.x;
    const dy = mousePosition.y - lastMousePosition.y;
    const speed = Math.sqrt(dx * dx + dy * dy);
    
    const particleCount = Math.floor(speed / 10) + 1;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(
            mousePosition.x + (Math.random() - 0.5) * 20,
            mousePosition.y + (Math.random() - 0.5) * 20
        ));
    }
    
    lastMousePosition = { ...mousePosition };
    isMouseMoving = true;
    setTimeout(() => isMouseMoving = false, 100);
});

function animateParticles() {
    // Just clear the canvas without filling with any color
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles = particles.filter(particle => particle.alpha > 0);
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Update connecting lines between particles
    for(let i = 0; i < particles.length; i++) {
        for(let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if(distance < 100) {
                ctx.beginPath();
                // Make lines more visible against dark background
                ctx.strokeStyle = `rgba(64, 224, 208, ${0.3 * (1 - distance/100)})`; // Using turquoise color
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    
    requestAnimationFrame(animateParticles);
}

animateParticles(); 