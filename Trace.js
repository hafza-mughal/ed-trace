let paper = Raphael("tracingContainer", 500, 500);
let currentLetterIndex = 0;
let tracingPath;
let drawnPath;
let isDrawing = false;
let currentPath = "";
let tracingCompleted = false;
let clapSound = document.getElementById("clapSound");
let animationTarget = document.getElementById("animationTarget");  

//---pointer---///
document.addEventListener("mousemove", function(event) {
    let cursor = document.getElementById("cursor");
    let tracing = document.getElementById("tracingContainer");

    let tracingRect = tracing.getBoundingClientRect();
    let cursorX = event.clientX;
    let cursorY = event.clientY;

    let centerX = tracingRect.left + tracingRect.width / 2;
    let centerY = tracingRect.top + tracingRect.height / 2;

    let distance = Math.sqrt((cursorX - centerX) ** 2 + (cursorY - centerY) ** 2);

    if (distance < 180) { 
        cursor.style.display = "block";
        document.body.style.cursor = "none"; 
    } else {
        cursor.style.display = "none"; 
        document.body.style.cursor = "default"; 
    }

    cursor.style.left = cursorX + "px";
    cursor.style.top = cursorY + "px";
});


function drawLetter() {
    paper.clear();
    tracingCompleted = false;
    tracingPath = paper.path(letters[currentLetterIndex].path).attr({
        stroke: "#959595",
        "stroke-width": 38,
        "stroke-opacity": 0.6,
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
    });

    drawnPath = paper.path("").attr({
        stroke: "#ff512f",
        "stroke-width": 36.5,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-opacity": 0
    });
    currentPath = "";
    clapSound.pause();
    clapSound.currentTime = 0;
    document.getElementById("currentLetter").textContent = letters[currentLetterIndex].letter;
}

function startDrawing(event) {
    event.preventDefault(); // Prevent scrolling issue on mobile
    isDrawing = true;
    let { x, y } = getTouchOrMousePosition(event);
    const closestPoint = getClosestPointOnPath(x, y);

    if (currentPath === "") {
        currentPath = `M${closestPoint.x} ${closestPoint.y}`;
    } else {
        currentPath += ` M${closestPoint.x} ${closestPoint.y}`;
    }

    drawnPath.attr({ path: currentPath });
    drawnPath.animate({ "stroke-opacity": 1 }, 500);
}

let lastX = null;
let lastY = null;

function addShakeEffect() {
    tracingPath.node.classList.add("shake-effect");
    drawnPath.node.classList.add("shake-effect"); // Add shake effect to both tracing and drawn paths
    setTimeout(() => {
        tracingPath.node.classList.remove("shake-effect");
        drawnPath.node.classList.remove("shake-effect");
    }, 300);
}

function applyTransparency() {
    drawnPath.attr({ "stroke-opacity": 0.3 }); // Reduce opacity for incorrect strokes
    setTimeout(() => {
        drawnPath.attr({ "stroke-opacity": 1 }); // Restore opacity after some time
    }, 1000);
}

function trace(event) {
    if (!isDrawing) return;
    event.preventDefault();

    let { x, y } = getTouchOrMousePosition(event);
    const closestPoint = getClosestPointOnPath(x, y);

    const distance = Math.sqrt((x - closestPoint.x) ** 2 + (y - closestPoint.y) ** 2);
    
    // Check if tracing is nearly complete (e.g., 95% done)
    let tracedLength = drawnPath.getTotalLength();
    let totalLength = tracingPath.getTotalLength();
    let completionRatio = tracedLength / totalLength;

    if (distance > 20 && completionRatio < 0.95) {
        addShakeEffect(); // Shake effect sirf galat tracing par hoga
        applyTransparency(); // Opacity bhi sirf incorrect tracing par kam hogi
        return;
    }

    if (lastX === null || lastY === null) {
        currentPath += ` M${closestPoint.x} ${closestPoint.y}`;
    } else {
        let midX = (lastX + closestPoint.x) / 2;
        let midY = (lastY + closestPoint.y) / 2;
        currentPath += ` L${midX} ${midY}`;
    }

    lastX = closestPoint.x;
    lastY = closestPoint.y;

    drawnPath.attr({ path: currentPath });

    if (!tracingCompleted && isTracingComplete()) {
        tracingCompleted = true;
        setTimeout(() => {
            triggerFallingBalls();
            clapSound.play();
            moveToBubbleEffect();
        }, 500);
    }
}


const shakeStyle = document.createElement("style");
shakeStyle.innerHTML = `
.shake-effect {
    animation: shake 0.3s ease-in-out;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-3px); }
    50% { transform: translateX(3px); }
    75% { transform: translateX(-3px); }
}`;

document.head.appendChild(shakeStyle);


function getClosestPointOnPath(x, y) {
    const path = tracingPath;
    const pathLength = path.getTotalLength();
    let closestPoint = null;
    let closestDistance = Infinity;
    for (let i = 0; i <= pathLength; i += 1) {
        const point = path.getPointAtLength(i);
        const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestPoint = point;
        }
    }
    return closestPoint;
}

function isTracingComplete() {
    return drawnPath.getTotalLength() >= tracingPath.getTotalLength();
}

function stopDrawing() {
    isDrawing = false;
    lastX = null;
    lastY = null; 
}



function triggerFallingBalls() {
    const container = document.getElementById("tracingContainer");
    const pastelColors = [
        "#FFB6C1", "#FFD700", "#FF69B4", "#E0FFFF", "#F0E68C", "#98FB98", "#D8BFD8"
    ];

    for (let i = 0; i < 20; i++) { 
        setTimeout(() => {
            const ball = document.createElement("div");
            ball.className = "falling-ball";
            ball.style.left = `${Math.random() * 380}px`;

            const randomColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];
            ball.style.backgroundColor = randomColor;
            ball.style.animation = `fall 2s ease-in-out forwards, bounce 1s ease infinite`;

            container.appendChild(ball);
            setTimeout(() => ball.remove(), 2000);
        }, i * 100);
    }
}
const style = document.createElement("style");
style.innerHTML = `
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}

@keyframes glowingPath {
  0% { stroke: #ff512f; }
  50% { stroke: #ff0; }
  100% { stroke: #ff512f; }
}
`;
document.head.appendChild(style);
function addParticleEffect(x, y) {
    const container = document.getElementById("tracingContainer");
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.position = "absolute";
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = "10px";
    particle.style.height = "10px";
    particle.style.borderRadius = "50%";
    particle.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
    particle.style.animation = "particleAnimation 0.5s ease-in-out forwards";

    container.appendChild(particle);

    setTimeout(() => particle.remove(), 500); 
}
const particleStyle = document.createElement("style");
particleStyle.innerHTML = `
@keyframes particleAnimation {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(3); opacity: 0; }
}
`;
document.head.appendChild(particleStyle);

function moveToBubbleEffect() {
    drawnPath.animate(
        {
            transform: "scale(0)", 
            "stroke-opacity": 0, 
        },
        2000, 
        "ease-in-out",
        function() {
            createBubbles();
            drawnPath.remove();
            setTimeout(() => {
                resetTracing();
            }, 1000);
        }
    );
}

function createBubbles() {
    const pathLength = drawnPath.getTotalLength();
    for (let i = 0; i < pathLength; i += 5) {
        const point = drawnPath.getPointAtLength(i);
        const bubble = document.createElement("div");
        bubble.className = "bubble";
        bubble.style.left = `${point.x}px`;
        bubble.style.top = `${point.y}px`;

        const randomSize = Math.random() * 10 + 5; 

        bubble.style.width = `${randomSize}px`;
        bubble.style.height = `${randomSize}px`;
        bubble.style.animation = `bubbleAnimation 2s ease-out forwards`;
        document.getElementById("tracingContainer").appendChild(bubble);
        setTimeout(() => bubble.remove(), 2000);
    }
}

function resetTracing() {
    currentLetterIndex = (currentLetterIndex + 1) % letters.length;
    drawLetter();  
}
function showColorfulParticles(x, y) {
    let container = document.getElementById("tracingContainer");
    const colors = ["#FF6B6B", "#FFB86C", "#FFD93D", "#6BCB77", "#4D96FF", "#A76BCB"]; 

    for (let i = 0; i < 10; i++) { // More particles!
        setTimeout(() => {
            const particle = document.createElement("div");
            particle.className = "colorful-particle";
            particle.style.left = `${x + (Math.random() * 15 - 7)}px`;
            particle.style.top = `${y + (Math.random() * 15 - 7)}px`;
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            container.appendChild(particle);
            setTimeout(() => particle.remove(), 600); // Stays for a bit longer
        }, i * 50);
    }
}

document.getElementById("tracingContainer").addEventListener("click", function(event) {
    let tracingRect = tracingContainer.getBoundingClientRect();
    let x = event.clientX - tracingRect.left;
    let y = event.clientY - tracingRect.top;
    showColorfulParticles(x, y);
});

const colorfulParticleStyle = document.createElement("style");
colorfulParticleStyle.innerHTML = `
.colorful-particle {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    opacity: 0.8;
    animation: colorfulParticleAnimation 0.6s ease-out;
}

@keyframes colorfulParticleAnimation {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(2.5); opacity: 0; }
}`;
document.head.appendChild(colorfulParticleStyle);



function getTouchOrMousePosition(event) {
    let x, y;
    if (event.touches && event.touches.length > 0) {
        let rect = tracingContainer.getBoundingClientRect();
        x = event.touches[0].clientX - rect.left;
        y = event.touches[0].clientY - rect.top;
    } else {
        x = event.offsetX;
        y = event.offsetY;
    }
    return { x, y };
}

// Mouse Events
document.addEventListener("DOMContentLoaded", function() {
    let tracingContainer = document.getElementById("tracingContainer");

    if (tracingContainer) {
        tracingContainer.addEventListener("mousedown", startDrawing);
        tracingContainer.addEventListener("mousemove", trace);
        tracingContainer.addEventListener("mouseup", stopDrawing);
        tracingContainer.addEventListener("touchstart", startDrawing, { passive: false });
        tracingContainer.addEventListener("touchmove", trace, { passive: false });
        tracingContainer.addEventListener("touchend", stopDrawing);
    } else {
        console.error("tracingContainer not found!");
    }

    // Initial drawing
    drawLetter();
});


document.getElementById("clearButton").addEventListener("click", function() {
    drawnPath.attr({ path: "" }); // Clear the drawing
    currentPath = "";
    tracingCompleted = false;
});
function resizeTracingContainer() {
    let tracingContainer = document.getElementById("tracingContainer");
    let screenWidth = window.innerWidth;

    if (screenWidth <= 480) {
        tracingContainer.style.width = "90vw";
        tracingContainer.style.height = "90vw";
        paper.setSize(tracingContainer.clientWidth, tracingContainer.clientHeight);
    } else {
        tracingContainer.style.width = "400px";
        tracingContainer.style.height = "400px";
        paper.setSize(400, 400);
    }
}
document.getElementById("clearButton").addEventListener("click", function() {
    paper.clear(); // Raphael.js canvas clear karega
});
















document.addEventListener("touchstart", function (e) {
    let touchX = e.touches[0].clientX;
    let touchY = e.touches[0].clientY;

    let color = `hsl(${Math.random() * 360}, 100%, 50%)`; // Random color
    let particle = paper.circle(touchX, touchY, 5).attr({
        fill: color,
        opacity: 1
    });

    // Animation (Particle expand & fade out)
    particle.animate({ r: 20, opacity: 0 }, 1000, "ease-in", function () {
        this.remove(); // Remove particle after animation
    });
});
function fadeInOut(element) {
    element.animate({ opacity: 0.2 }, 500, "linear", function () {
        element.animate({ opacity: 1 }, 500, "linear", function () {
            fadeInOut(element);
        });
    });
}

// Example: Opacity animation on a circle
let fadingCircle = paper.circle(200, 200, 40).attr({ fill: "blue", opacity: 1 });
fadeInOut(fadingCircle);
function shakeElement(element) {
    let dx = 5; // Shake intensity

    function shake(times) {
        if (times > 0) {
            element.animate({ transform: `t${dx},0` }, 50, "linear", function () {
                element.animate({ transform: `t-${dx},0` }, 50, "linear", function () {
                    shake(times - 1);
                });
            });
        } else {
            element.animate({ transform: "t0,0" }, 50);
        }
    }

    shake(5); // Shake 5 times
}

// Example: Call shake on any Raphael.js element
let myCircle = paper.circle(100, 100, 30).attr({ fill: "red" });
shakeElement(myCircle);












































// Call function on load and resize
window.addEventListener("load", resizeTracingContainer);
window.addEventListener("resize", resizeTracingContainer);

