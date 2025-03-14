import * as THREE from 'three';

// Base car class that all other cars will extend
class BaseCar {
    constructor() {
        this.mesh = new THREE.Group(); // Container for all car parts
        this.speed = 0;
        this.rotation = 0;
        this.position = { x: 0, z: 0 };
        this.acceleration = 0.005;
        this.maxSpeed = 0.5;
        this.friction = 0.99;
        
        // Will be overridden by specific car implementations
        this.createCarMesh();
    }
    
    // To be implemented by specific car classes
    createCarMesh() {
        console.warn('Base car createCarMesh called - should be overridden');
    }
    
    // Update car position and rotation
    update() {
        // Update position based on speed and rotation
        this.position.x += Math.sin(this.rotation) * this.speed;
        this.position.z += Math.cos(this.rotation) * this.speed;
        
        // Update the actual mesh
        this.mesh.position.x = this.position.x;
        this.mesh.position.z = this.position.z;
        this.mesh.rotation.y = this.rotation;
    }
    
    // Handle car controls
    accelerate() {
        this.speed += this.acceleration;
    }
    
    brake() {
        this.speed -= this.acceleration;
    }
    
    turnLeft() {
        this.rotation += 0.03;
    }
    
    turnRight() {
        this.rotation -= 0.03;
    }
    
    applyFriction() {
        this.speed *= this.friction;
        // Clamp speed
        this.speed = Math.max(Math.min(this.speed, this.maxSpeed), -this.maxSpeed);
    }
}

export default BaseCar; 