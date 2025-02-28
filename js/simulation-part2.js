// Update planet positions based on the current simulation date

// Update planet positions based on the current simulation date
function updatePlanetPositions() {
    planets.forEach(planet => {
        const position = calculateOrbitPosition(planet, simulationDate);
        planet.x = position.x;
        planet.y = position.y;
        
        // Update moons
        planet.moons.forEach(moon => {
            // Calculate days elapsed since simulation start
            const daysElapsed = (simulationDate - simulationStartDate) / (1000 * 60 * 60 * 24);
            
            // Calculate moon angle based on its orbital period
            const moonAngle = moon.startAngle + (daysElapsed * 2 * Math.PI / moon.orbitPeriod);
            
            // Set moon position relative to its planet
            moon.x = planet.x + moon.orbitRadius * Math.cos(moonAngle);
            moon.y = planet.y + moon.orbitRadius * Math.sin(moonAngle);
        });
    });
}

// Draw orbits
function drawOrbits() {
    ctx.save();
    ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
    ctx.scale(scale, scale);
    
    planets.forEach(planet => {
        if (planet.orbitRadius > 0) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.arc(0, 0, planet.orbitRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    });
    
    ctx.restore();
}

// Draw planets and moons
function drawPlanets() {
    ctx.save();
    ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
    ctx.scale(scale, scale);
    
    // Draw planets
    planets.forEach(planet => {
        // Draw planet
        ctx.beginPath();
        ctx.fillStyle = planet.color;
        ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw Saturn's rings if applicable
        if (planet.hasRings) {
            ctx.beginPath();
            ctx.fillStyle = planet.ringsColor;
            ctx.ellipse(planet.x, planet.y, planet.ringsOuterRadius, planet.ringsOuterRadius / 3, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.fillStyle = "#000";
            ctx.ellipse(planet.x, planet.y, planet.ringsInnerRadius, planet.ringsInnerRadius / 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw moons
        planet.moons.forEach(moon => {
            ctx.beginPath();
            ctx.fillStyle = moon.color;
            ctx.arc(moon.x, moon.y, moon.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw planet name
        if (scale > 0.5) {
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.font = `${10/scale}px Arial`;
            ctx.fillText(planet.name, planet.x, planet.y - planet.radius - 5/scale);
        }
    });
    
    ctx.restore();
}

// Main animation loop
function animate(timestamp) {
    if (!animationStartTime) {
        animationStartTime = timestamp;
    }
    
    // Calculate time elapsed in the simulation based on speed
    const timeElapsed = (timestamp - animationStartTime) * simulationSpeed;
    simulationDate = new Date(simulationStartDate.getTime() + timeElapsed);
    
    // Update date display
    document.getElementById('currentDate').textContent = simulationDate.toLocaleDateString();
    
    // Clear canvas - no need to fill with black as we'll use gradient in drawStars()
    
    // Draw stars
    drawStars();
    
    // Update planet positions
    updatePlanetPositions();
    
    // Draw orbits and planets
    drawOrbits();
    drawPlanets();
    
    // Request next frame
    requestAnimationFrame(animate);
}

// Create background stars
const stars = [];
function createStars() {
    for (let i = 0; i < 800; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5,
            brightness: Math.random() * 0.6 // Reduce maximum brightness to 0.6
        });
    }
}

function drawStars() {
    // Draw a subtle gradient background
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
    );
    gradient.addColorStop(0, 'rgba(15, 30, 60, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars with reduced opacity
    stars.forEach(star => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Handle canvas resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createStars(); // Recreate stars for new dimensions
});

// Handle mouse wheel for zooming
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomAmount = e.deltaY * -0.001;
    const newScale = Math.max(0.2, Math.min(3, scale + zoomAmount));
    
    // Zoom towards mouse position
    if (newScale !== scale) {
        const mouseX = e.clientX - canvas.width / 2;
        const mouseY = e.clientY - canvas.height / 2;
        
        offsetX = mouseX - (mouseX - offsetX) * (newScale / scale);
        offsetY = mouseY - (mouseY - offsetY) * (newScale / scale);
        
        scale = newScale;
    }
});

// Handle mouse drag for panning
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    canvas.style.cursor = 'grabbing';
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
});

window.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        
        offsetX += deltaX;
        offsetY += deltaY;
        
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }
    
    // Check if mouse is over a planet for tooltip
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const centerX = canvas.width / 2 + offsetX;
    const centerY = canvas.height / 2 + offsetY;
    
    let hoveredPlanet = null;
    
    planets.forEach(planet => {
        const planetScreenX = centerX + planet.x * scale;
        const planetScreenY = centerY + planet.y * scale;
        const distance = Math.sqrt(
            Math.pow(mouseX - planetScreenX, 2) + 
            Math.pow(mouseY - planetScreenY, 2)
        );
        
        if (distance <= planet.radius * scale) {
            hoveredPlanet = planet;
        }
    });
    
    const planetInfo = document.getElementById('planetInfo');
    const planetName = document.getElementById('planetName');
    const planetDescription = document.getElementById('planetDescription');
    
    if (hoveredPlanet) {
        // Position the info card near the cursor but keep it within viewport
        const cardWidth = 300; // Width of the card
        const cardHeight = 250; // Approximate height
        
        // Calculate position to ensure card stays in viewport
        let posX = mouseX + 20; // 20px offset from cursor
        let posY = mouseY + 20;
        
        // Adjust if would go off-screen
        if (posX + cardWidth > window.innerWidth) {
            posX = mouseX - cardWidth - 20;
        }
        if (posY + cardHeight > window.innerHeight) {
            posY = mouseY - cardHeight - 20;
        }
        
        // Set position
        planetInfo.style.left = posX + 'px';
        planetInfo.style.top = posY + 'px';
        
        // Update content
        planetName.textContent = hoveredPlanet.name;
        planetDescription.textContent = hoveredPlanet.description;
        
        // Add additional facts if available
        let factsHTML = '';
        if (hoveredPlanet.realRadius) {
            factsHTML += `
            <div class="planet-facts">
                <div class="planet-fact">
                    <span class="fact-label">Radius</span>
                    <span class="fact-value">${(hoveredPlanet.realRadius).toLocaleString()} km</span>
                </div>
                <div class="planet-fact">
                    <span class="fact-label">Orbit Period</span>
                    <span class="fact-value">${hoveredPlanet.orbitPeriod.toLocaleString()} days</span>
                </div>
            `;
            
            if (hoveredPlanet.eccentricity !== undefined) {
                factsHTML += `
                <div class="planet-fact">
                    <span class="fact-label">Eccentricity</span>
                    <span class="fact-value">${hoveredPlanet.eccentricity.toFixed(3)}</span>
                </div>
                `;
            }
            
            if (hoveredPlanet.moons && hoveredPlanet.moons.length > 0) {
                factsHTML += `
                <div class="planet-fact">
                    <span class="fact-label">Moons</span>
                    <span class="fact-value">${hoveredPlanet.moons.length}</span>
                </div>
                `;
            }
            
            factsHTML += '</div>';
        }
        
        // Add facts after description
        const existingFacts = planetInfo.querySelector('.planet-facts');
        if (existingFacts) {
            existingFacts.remove();
        }
        
        if (factsHTML) {
            planetDescription.insertAdjacentHTML('afterend', factsHTML);
        }
        
        // Show the card with animation
        planetInfo.style.display = 'block';
        setTimeout(() => {
            planetInfo.classList.add('visible');
        }, 10);
    } else {
        planetInfo.classList.remove('visible');
        setTimeout(() => {
            if (!planetInfo.classList.contains('visible')) {
                planetInfo.style.display = 'none';
            }
        }, 300); // Match transition duration
    }
});

// Controls for simulation speed
document.getElementById('speedDown').addEventListener('click', () => {
    simulationSpeed = Math.max(0.1, simulationSpeed - 0.2);
    document.getElementById('speedDisplay').textContent = simulationSpeed.toFixed(1) + 'x';
});

document.getElementById('speedUp').addEventListener('click', () => {
    simulationSpeed += 0.2;
    document.getElementById('speedDisplay').textContent = simulationSpeed.toFixed(1) + 'x';
});

document.getElementById('resetView').addEventListener('click', () => {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
});

// Date selection controls
document.getElementById('dateSelector').addEventListener('change', (e) => {
    const selectedDate = new Date(e.target.value);
    resetSimulation(selectedDate);
});

document.getElementById('setCurrentDate').addEventListener('click', () => {
    datePicker.value = new Date().toISOString().split('T')[0];
    resetSimulation(new Date());
});

// Reset simulation with a new date
function resetSimulation(date) {
    simulationStartDate = date;
    simulationDate = new Date(date);
    animationStartTime = 0;
}

// Initialize and start animation
function initSimulation() {
    createStars();
    canvas.style.cursor = 'grab';
    requestAnimationFrame(animate);
}

// Export functions for use in other files
window.SolarSystem = {
    planets: planets,
    initSimulation: initSimulation
};