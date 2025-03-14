import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import CarFactory from './cars/carFactory.js';
import CommandsModal from './ui/commandsModal.js';
import './ui/styles.css';
import { createEnvironmentSection } from './environment/prisonEnvironment.js';

// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x88ccff); // Light blue sky

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 20, 40);

// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMappingExposure = 0.8;
document.body.appendChild(renderer.domElement);

// Create materials that we'll reuse
const concreteMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.9,
    metalness: 0.1
});

const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0x666666,
    roughness: 0.4,
    metalness: 0.8
});

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Brighter ambient light
scene.add(ambientLight);

// Change moonlight to sunlight
const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
sunLight.position.set(-50, 100, 0);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.far = 200;
sunLight.shadow.camera.left = -100;
sunLight.shadow.camera.right = 100;
sunLight.shadow.camera.top = 100;
sunLight.shadow.camera.bottom = -100;
scene.add(sunLight);

// Remove fog or make it much less dense
scene.fog = new THREE.Fog(0x88ccff, 100, 300); // Pushed far back, matching sky color

// Create environment sections array
const environmentSections = [];

// Function to create infinite road segments
function createRoadSegment(zPosition) {
    const segment = new THREE.Group();
    
    // Main road surface
    const roadGeometry = new THREE.PlaneGeometry(30, 150);
    const roadMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.8,
        metalness: 0.2
    });
    
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.z = zPosition;
    road.receiveShadow = true;
    segment.add(road);

    // Road lines
    const lineGeometry = new THREE.PlaneGeometry(0.3, 150);
    const lineMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4
    });

    // Left line
    const leftLine = new THREE.Mesh(lineGeometry, lineMaterial);
    leftLine.position.set(-10, 0.01, zPosition);
    leftLine.rotation.x = -Math.PI / 2;

    // Right line
    const rightLine = new THREE.Mesh(lineGeometry, lineMaterial);
    rightLine.position.set(10, 0.01, zPosition);
    rightLine.rotation.x = -Math.PI / 2;

    segment.add(leftLine, rightLine);

    // Barriers
    const barrierGeometry = new THREE.BoxGeometry(1, 1, 150);
    const barrier1 = new THREE.Mesh(barrierGeometry, concreteMaterial);
    const barrier2 = new THREE.Mesh(barrierGeometry, concreteMaterial);
    
    barrier1.position.set(-15.5, 0.5, zPosition);
    barrier2.position.set(15.5, 0.5, zPosition);
    
    barrier1.castShadow = true;
    barrier2.castShadow = true;
    
    segment.add(barrier1, barrier2);

    // Create environment section with error handling
    try {
        const environmentSection = createEnvironmentSection(zPosition, SEGMENT_LENGTH);
        environmentSections.push(environmentSection);
        scene.add(environmentSection);
    } catch (error) {
        console.error("Error creating environment section:", error);
        // Push a placeholder to maintain array sync
        environmentSections.push(null);
    }

    return segment;
}

// Create road segments array and add initial segments
const roadSegments = [];
const SEGMENT_LENGTH = 150;
const VISIBLE_SEGMENTS = 4;

// Create initial segments in both directions
for (let i = -VISIBLE_SEGMENTS; i < VISIBLE_SEGMENTS; i++) {
    const segment = createRoadSegment(i * SEGMENT_LENGTH);
    roadSegments.push(segment);
    scene.add(segment);
}

// Create the car
const car = CarFactory.createCar('basicbitch');
scene.add(car.mesh);

// Camera setup
camera.lookAt(car.mesh.position);

// Input handling
const keys = {
    w: false,
    s: false,
    a: false,
    d: false
};

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 5;
controls.maxDistance = 100;
controls.maxPolarAngle = Math.PI / 2;

// Add camera mode switching
let cameraMode = 'follow'; // 'follow' or 'orbit'

// Add key listener for camera toggle
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'c') {
        toggleCameraMode();
    }
    
    // Original keyboard controls for car
    if (keys.hasOwnProperty(e.key.toLowerCase())) {
        keys[e.key.toLowerCase()] = true;
    }
});

// First, let's fix the keyup event listener that seems to be missing
window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase())) {
        keys[e.key.toLowerCase()] = false;
    }
});

function toggleCameraMode() {
    cameraMode = cameraMode === 'follow' ? 'orbit' : 'follow';
    
    if (cameraMode === 'orbit') {
        // Set the orbit controls target to the car's position
        controls.target.copy(car.mesh.position);
        controls.enabled = true;
    } else {
        controls.enabled = false;
    }
}

// Handle window resizing
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

function updateCar() {
    // Forward/Backward movement
    if (keys.w) {
        car.accelerate();
    }
    if (keys.s) {
        car.brake();
    }

    // Rotation
    if (keys.a) {
        car.turnLeft();
    }
    if (keys.d) {
        car.turnRight();
    }

    // Apply friction
    car.applyFriction();
    car.update();

    // Only update camera position if in follow mode
    if (cameraMode === 'follow') {
        const cameraOffset = new THREE.Vector3(
            -Math.sin(car.rotation) * 15,
            10,
            -Math.cos(car.rotation) * 15
        );
        camera.position.copy(car.mesh.position).add(cameraOffset);
        camera.lookAt(car.mesh.position);
    } else if (cameraMode === 'orbit') {
        // Update the orbit controls target to follow the car
        controls.target.copy(car.mesh.position);
    }

    // Check if we need to create new road segments
    const currentSegmentIndex = Math.floor(car.position.z / SEGMENT_LENGTH);
    
    // Create segments ahead
    while (roadSegments.length < currentSegmentIndex + VISIBLE_SEGMENTS) {
        const newSegment = createRoadSegment(roadSegments.length * SEGMENT_LENGTH);
        roadSegments.push(newSegment);
        scene.add(newSegment);
    }
    
    // Create segments behind
    while (Math.min(...roadSegments.map(s => s.children[0].position.z)) > (currentSegmentIndex - VISIBLE_SEGMENTS) * SEGMENT_LENGTH) {
        const newSegment = createRoadSegment((Math.min(...roadSegments.map(s => s.children[0].position.z)) - SEGMENT_LENGTH));
        roadSegments.unshift(newSegment);
        scene.add(newSegment);
    }
    
    // Display environment debug info
    const debugElement = document.getElementById('debug-info') || createDebugElement();
    debugElement.textContent = `Road: ${roadSegments.length}, Env: ${environmentSections.length}`;
    
    // Fix: Check if arrays are out of sync
    if (roadSegments.length !== environmentSections.length) {
        console.warn(`Arrays out of sync! Road: ${roadSegments.length}, Env: ${environmentSections.length}`);
        
        // Attempt to recover by rebuilding the environment
        rebuildEnvironment();
    }
    
    // Remove far segments ahead
    while (roadSegments.length > VISIBLE_SEGMENTS * 2 && 
           roadSegments[roadSegments.length - 1].children[0].position.z > car.position.z + SEGMENT_LENGTH * VISIBLE_SEGMENTS) {
        const oldSegment = roadSegments.pop();
        scene.remove(oldSegment);
        
        // Also remove the corresponding environment section if it exists
        if (environmentSections.length > 0) {
            const oldEnvironment = environmentSections.pop();
            if (oldEnvironment) {
                scene.remove(oldEnvironment);
            }
        }
    }
    
    // Remove far segments behind
    while (roadSegments.length > VISIBLE_SEGMENTS * 2 && 
           roadSegments[0].children[0].position.z < car.position.z - SEGMENT_LENGTH * VISIBLE_SEGMENTS) {
        const oldSegment = roadSegments.shift();
        scene.remove(oldSegment);
        
        // Also remove the corresponding environment section if it exists
        if (environmentSections.length > 0) {
            const oldEnvironment = environmentSections.shift();
            if (oldEnvironment) {
                scene.remove(oldEnvironment);
            }
        }
    }

    // Add this at the end of the function to debug performance
    // Display FPS counter
    const fpsElement = document.getElementById('fps-counter') || createFpsCounter();
    fpsElement.textContent = `FPS: ${Math.round(1 / (performance.now() - lastFrameTime) * 1000)}`;
    lastFrameTime = performance.now();
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update car and road
    updateCar();
    
    // Update orbit controls if enabled
    if (cameraMode === 'orbit') {
        controls.update();
    }
    
    renderer.render(scene, camera);
}

// Initialize the commands modal
const commandsModal = new CommandsModal();

animate();

// Helper to create FPS counter
function createFpsCounter() {
    const fpsElement = document.createElement('div');
    fpsElement.id = 'fps-counter';
    fpsElement.style.position = 'fixed';
    fpsElement.style.bottom = '10px';
    fpsElement.style.right = '10px';
    fpsElement.style.backgroundColor = 'rgba(0,0,0,0.5)';
    fpsElement.style.color = 'white';
    fpsElement.style.padding = '5px';
    fpsElement.style.borderRadius = '3px';
    fpsElement.style.fontFamily = 'monospace';
    document.body.appendChild(fpsElement);
    
    // Initialize lastFrameTime
    window.lastFrameTime = performance.now();
    
    return fpsElement;
}

// Create a debug element
function createDebugElement() {
    const debugElement = document.createElement('div');
    debugElement.id = 'debug-info';
    debugElement.style.position = 'fixed';
    debugElement.style.bottom = '40px';
    debugElement.style.right = '10px';
    debugElement.style.backgroundColor = 'rgba(0,0,0,0.5)';
    debugElement.style.color = 'white';
    debugElement.style.padding = '5px';
    debugElement.style.borderRadius = '3px';
    debugElement.style.fontFamily = 'monospace';
    document.body.appendChild(debugElement);
    return debugElement;
}

// Function to rebuild the environment if it's missing
function rebuildEnvironment() {
    console.log("Rebuilding environment...");
    
    // Clear existing environment sections
    environmentSections.forEach(section => {
        if (section) scene.remove(section);
    });
    environmentSections.length = 0;
    
    // Rebuild environment sections for each road segment
    roadSegments.forEach(segment => {
        const zPosition = segment.children[0].position.z;
        const environmentSection = createEnvironmentSection(zPosition, SEGMENT_LENGTH);
        environmentSections.push(environmentSection);
        scene.add(environmentSection);
    });
    
    console.log("Environment rebuilt with", environmentSections.length, "sections");
}
