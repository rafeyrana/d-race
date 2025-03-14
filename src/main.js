import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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

// Add a grid helper
const gridHelper = new THREE.GridHelper(50, 50);
scene.add(gridHelper);

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

    return segment;
}

// Create road segments array and add initial segments
const roadSegments = [];
const SEGMENT_LENGTH = 150;
const VISIBLE_SEGMENTS = 4;

for (let i = 0; i < VISIBLE_SEGMENTS; i++) {
    const segment = createRoadSegment(i * SEGMENT_LENGTH);
    roadSegments.push(segment);
    scene.add(segment);
}

// Car setup
const car = {
    mesh: null,
    speed: 0,
    rotation: 0,
    position: { x: 0, z: 0 },
    acceleration: 0.005,
    maxSpeed: 0.5,
    friction: 0.99
};

// Create car mesh
const carGeometry = new THREE.BoxGeometry(2, 1, 4);
const carMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
car.mesh = new THREE.Mesh(carGeometry, carMaterial);
car.mesh.position.y = 0.5;
car.mesh.castShadow = true;
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

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase())) {
        keys[e.key.toLowerCase()] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase())) {
        keys[e.key.toLowerCase()] = false;
    }
});

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
        car.speed += car.acceleration;
    }
    if (keys.s) {
        car.speed -= car.acceleration;
    }

    // Rotation
    if (keys.a) {
        car.rotation += 0.03;
    }
    if (keys.d) {
        car.rotation -= 0.03;
    }

    // Apply friction
    car.speed *= car.friction;

    // Clamp speed
    car.speed = Math.max(Math.min(car.speed, car.maxSpeed), -car.maxSpeed);

    // Update position
    car.position.x += Math.sin(car.rotation) * car.speed;
    car.position.z += Math.cos(car.rotation) * car.speed;

    // Update car mesh
    car.mesh.position.x = car.position.x;
    car.mesh.position.z = car.position.z;
    car.mesh.rotation.y = car.rotation;

    // Update camera position
    const cameraOffset = new THREE.Vector3(
        -Math.sin(car.rotation) * 15,
        10,
        -Math.cos(car.rotation) * 15
    );
    camera.position.copy(car.mesh.position).add(cameraOffset);
    camera.lookAt(car.mesh.position);

    // Check if we need to create new road segment
    const currentSegmentIndex = Math.floor(car.position.z / SEGMENT_LENGTH);
    
    while (roadSegments.length < currentSegmentIndex + VISIBLE_SEGMENTS) {
        const newSegment = createRoadSegment(roadSegments.length * SEGMENT_LENGTH);
        roadSegments.push(newSegment);
        scene.add(newSegment);
        
        // Remove far segments
        if (roadSegments.length > VISIBLE_SEGMENTS + 2) {
            const oldSegment = roadSegments.shift();
            scene.remove(oldSegment);
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    updateCar();
    renderer.render(scene, camera);
}

animate();
