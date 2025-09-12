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
        const hue = Math.random() * 60 + 180; // Blue to purple range
        return `hsl(${hue}, 100%, 70%)`;
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
        
        // Draw geometric shape
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

// Enhanced mouse movement tracking
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

// Add touch support
canvas.addEventListener("touchmove", function(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    window.dispatchEvent(mouseEvent);
});

function animateParticles() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    particles = particles.filter(particle => particle.alpha > 0);
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Add connecting lines between nearby particles
    for(let i = 0; i < particles.length; i++) {
        for(let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if(distance < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance/100)})`;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    
    requestAnimationFrame(animateParticles);
}

animateParticles(); 