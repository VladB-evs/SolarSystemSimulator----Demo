// Solar System Simulation JavaScript

// Canvas setup
const canvas = document.getElementById('solarSystem');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Simulation variables
let simulationSpeed = 1;
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let simulationDate = new Date();
let simulationStartDate = new Date();
let animationStartTime = 0;

// Set default date to today
const datePicker = document.getElementById('dateSelector');
const today = new Date();
const formattedDate = today.toISOString().split('T')[0];
datePicker.value = formattedDate;
document.getElementById('currentDate').textContent = today.toLocaleDateString();

// Astronomical constants
const AU = 149597870.7; // Astronomical Unit in km

// Planet data with actual information
const planets = [
    {
        name: "Sun",
        radius: 30,
        realRadius: 696340, // km
        color: "#FDB813",
        orbitRadius: 0,
        realOrbitRadius: 0,
        orbitSpeed: 0,
        orbitPeriod: 0, // days
        orbitalInclination: 0, // degrees
        startAngle: 0,
        moons: [],
        description: "The Sun is the star at the center of our Solar System. It's about 4.6 billion years old and will continue to radiate energy for another 5 billion years."
    },
    {
        name: "Mercury",
        radius: 5,
        realRadius: 2439.7, // km
        color: "#A0A0A0",
        orbitRadius: 60,
        realOrbitRadius: 0.387 * AU, // in km
        orbitPeriod: 87.97, // days
        orbitalInclination: 7.0, // degrees
        longAscNode: 48.33, // longitude of ascending node
        longPerihelion: 77.46, // longitude of perihelion
        meanLongitude: 252.25, // mean longitude
        eccentricity: 0.205,
        moons: [],
        description: "Mercury is the smallest and innermost planet in the Solar System. It completes an orbit around the Sun every 88 days and has no atmosphere to retain heat."
    },
    {
        name: "Venus",
        radius: 9,
        realRadius: 6051.8, // km
        color: "#E39E65",
        orbitRadius: 90,
        realOrbitRadius: 0.723 * AU, // in km
        orbitPeriod: 224.7, // days
        orbitalInclination: 3.39, // degrees
        longAscNode: 76.68, // longitude of ascending node
        longPerihelion: 131.53, // longitude of perihelion
        meanLongitude: 181.98, // mean longitude
        eccentricity: 0.007,
        moons: [],
        description: "Venus is the second planet from the Sun. It's a terrestrial planet with a thick atmosphere that traps heat, making it the hottest planet in our solar system."
    },
    {
        name: "Earth",
        radius: 10,
        realRadius: 6371, // km
        color: "#2073BE",
        orbitRadius: 130,
        realOrbitRadius: 1.0 * AU, // in km
        orbitPeriod: 365.26, // days
        orbitalInclination: 0.0, // degrees
        longAscNode: -11.26, // longitude of ascending node
        longPerihelion: 102.94, // longitude of perihelion
        meanLongitude: 100.46, // mean longitude
        eccentricity: 0.017,
        moons: [
            {
                name: "Moon",
                radius: 3,
                realRadius: 1737.4, // km
                color: "#CCCCCC",
                orbitRadius: 20,
                realOrbitRadius: 384400, // km
                orbitPeriod: 27.32, // days
                startAngle: 0
            }
        ],
        description: "Earth is the third planet from the Sun and the only astronomical object known to harbor life. It has one natural satellite, the Moon."
    },
    {
        name: "Mars",
        radius: 7,
        realRadius: 3389.5, // km
        color: "#E27B58",
        orbitRadius: 180,
        realOrbitRadius: 1.524 * AU, // in km
        orbitPeriod: 686.98, // days
        orbitalInclination: 1.85, // degrees
        longAscNode: 49.57, // longitude of ascending node
        longPerihelion: 336.04, // longitude of perihelion
        meanLongitude: 355.45, // mean longitude
        eccentricity: 0.093,
        moons: [
            {
                name: "Phobos",
                radius: 1.5,
                realRadius: 11.267, // km
                color: "#BBBBBB",
                orbitRadius: 15,
                realOrbitRadius: 9376, // km
                orbitPeriod: 0.32, // days
                startAngle: Math.random() * Math.PI * 2
            },
            {
                name: "Deimos",
                radius: 1,
                realRadius: 6.2, // km
                color: "#AAAAAA",
                orbitRadius: 20,
                realOrbitRadius: 23463, // km
                orbitPeriod: 1.26, // days
                startAngle: Math.random() * Math.PI * 2
            }
        ],
        description: "Mars is the fourth planet from the Sun. Often called the 'Red Planet' due to its reddish appearance, it has two small moons, Phobos and Deimos."
    },
    {
        name: "Jupiter",
        radius: 20,
        realRadius: 69911, // km
        color: "#C88B3A",
        orbitRadius: 250,
        realOrbitRadius: 5.204 * AU, // in km
        orbitPeriod: 4332.59, // days
        orbitalInclination: 1.31, // degrees
        longAscNode: 100.55, // longitude of ascending node
        longPerihelion: 14.75, // longitude of perihelion
        meanLongitude: 34.4, // mean longitude
        eccentricity: 0.048,
        moons: [
            {
                name: "Io",
                radius: 2,
                realRadius: 1821.6, // km
                color: "#F7CD7F",
                orbitRadius: 30,
                realOrbitRadius: 421700, // km
                orbitPeriod: 1.77, // days
                startAngle: Math.random() * Math.PI * 2
            },
            {
                name: "Europa",
                radius: 2,
                realRadius: 1560.8, // km
                color: "#FFFFC0",
                orbitRadius: 35,
                realOrbitRadius: 671034, // km
                orbitPeriod: 3.55, // days
                startAngle: Math.random() * Math.PI * 2
            },
            {
                name: "Ganymede",
                radius: 3,
                realRadius: 2634.1, // km
                color: "#CCCCDD",
                orbitRadius: 40,
                realOrbitRadius: 1070412, // km
                orbitPeriod: 7.15, // days
                startAngle: Math.random() * Math.PI * 2
            },
            {
                name: "Callisto",
                radius: 2.5,
                realRadius: 2410.3, // km
                color: "#AAAAAA",
                orbitRadius: 45,
                realOrbitRadius: 1882709, // km
                orbitPeriod: 16.69, // days
                startAngle: Math.random() * Math.PI * 2
            }
        ],
        description: "Jupiter is the fifth planet from the Sun and the largest in the Solar System. It's a gas giant with dozens of moons and a Great Red Spot - a giant storm."
    },
    {
        name: "Saturn",
        radius: 17,
        realRadius: 58232, // km
        color: "#E4AE7F",
        orbitRadius: 320,
        realOrbitRadius: 9.583 * AU, // in km
        orbitPeriod: 10759.22, // days
        orbitalInclination: 2.49, // degrees
        longAscNode: 113.71, // longitude of ascending node
        longPerihelion: 92.43, // longitude of perihelion
        meanLongitude: 49.94, // mean longitude
        eccentricity: 0.054,
        hasRings: true,
        ringsInnerRadius: 22,
        ringsOuterRadius: 30,
        ringsColor: "rgba(210, 180, 140, 0.6)",
        moons: [
            {
                name: "Titan",
                radius: 2.5,
                realRadius: 2574.73, // km
                color: "#FFD700",
                orbitRadius: 40,
                realOrbitRadius: 1221870, // km
                orbitPeriod: 15.95, // days
                startAngle: Math.random() * Math.PI * 2
            }
        ],
        description: "Saturn is the sixth planet from the Sun, known for its distinctive ring system. It's a gas giant with numerous moons, the largest being Titan."
    },
    {
        name: "Uranus",
        radius: 14,
        realRadius: 25362, // km
        color: "#B5E3E3",
        orbitRadius: 380,
        realOrbitRadius: 19.201 * AU, // in km
        orbitPeriod: 30688.5, // days
        orbitalInclination: 0.77, // degrees
        longAscNode: 74.01, // longitude of ascending node
        longPerihelion: 170.96, // longitude of perihelion
        meanLongitude: 313.23, // mean longitude
        eccentricity: 0.047,
        moons: [],
        description: "Uranus is the seventh planet from the Sun. It's an ice giant with a unique sideways rotation, meaning it rotates on its side with its poles facing the Sun."
    },
    {
        name: "Neptune",
        radius: 14,
        realRadius: 24622, // km
        color: "#3454FF",
        orbitRadius: 440,
        realOrbitRadius: 30.048 * AU, // in km
        orbitPeriod: 60195, // days
        orbitalInclination: 1.77, // degrees
        longAscNode: 131.79, // longitude of ascending node
        longPerihelion: 44.97, // longitude of perihelion
        meanLongitude: 304.88, // mean longitude
        eccentricity: 0.009,
        moons: [],
        description: "Neptune is the eighth and farthest-known planet from the Sun. It's an ice giant similar to Uranus and has powerful winds, with some of the fastest in the Solar System."
    }
];

// Calculate the mean anomaly for a planet at a given date
function calculateMeanAnomaly(planet, date) {
    // Reference date: J2000.0 (January 1, 2000, 12:00 UTC)
    const referenceDate = new Date('2000-01-01T12:00:00Z');
    const daysElapsed = (date - referenceDate) / (1000 * 60 * 60 * 24);
    
    // Calculate mean anomaly
    const meanMotion = 360 / planet.orbitPeriod; // degrees per day
    let meanAnomaly = (meanMotion * daysElapsed) % 360;
    
    // Adjust for the planet's mean longitude at J2000.0
    if (planet.meanLongitude !== undefined) {
        meanAnomaly = (meanAnomaly + planet.meanLongitude - planet.longPerihelion) % 360;
    }
    
    return meanAnomaly * (Math.PI / 180); // Convert to radians
}

// Solve Kepler's equation using Newton-Raphson method
function solveKepler(meanAnomaly, eccentricity) {
    let eccentricAnomaly = meanAnomaly; // Initial guess
    
    // Newton-Raphson iteration
    for (let i = 0; i < 10; i++) {
        const error = eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly;
        const derivative = 1 - eccentricity * Math.cos(eccentricAnomaly);
        eccentricAnomaly = eccentricAnomaly - error / derivative;
    }
    
    return eccentricAnomaly;
}

// Calculate true anomaly from eccentric anomaly
function calculateTrueAnomaly(eccentricAnomaly, eccentricity) {
    const numerator = Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2);
    const denominator = Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2);
    return 2 * Math.atan2(numerator, denominator);
}

// Calculate the position of a planet in its orbit
function calculateOrbitPosition(planet, date) {
    if (planet.name === "Sun") {
        return { x: 0, y: 0 };
    }
    
    // Mean anomaly
    const meanAnomaly = calculateMeanAnomaly(planet, date);
    
    // Eccentric anomaly
    const eccentricAnomaly = solveKepler(meanAnomaly, planet.eccentricity);
    
    // True anomaly
    const trueAnomaly = calculateTrueAnomaly(eccentricAnomaly, planet.eccentricity);
    
    // Distance from Sun (in AU)
    const distance = planet.realOrbitRadius * (1 - planet.eccentricity * Math.cos(eccentricAnomaly)) / AU;

    // Position in orbital plane
    let x = distance * Math.cos(trueAnomaly);
    let y = distance * Math.sin(trueAnomaly);

    // Adjust for visualization (scale and make circular for simplicity)
    const scaledDistance = planet.orbitRadius;
    const angle = trueAnomaly + (planet.longPerihelion || 0) * (Math.PI / 180);

    return {
        x: scaledDistance * Math.cos(angle),
        y: scaledDistance * Math.sin(angle)
    };
}