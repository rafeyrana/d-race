import * as THREE from 'three';
import BaseCar from './baseCar.js';

class BasicBitch extends BaseCar {
    constructor() {
        super();
        
        // Customize car properties
        this.maxSpeed = 0.6; // Slightly faster
        this.acceleration = 0.006;
        
        // Create the car mesh
        this.createCarMesh();
    }
    
    createCarMesh() {
        // Define colors
        const pinkColor = 0xff9ad5;
        const whiteColor = 0xffffff;
        const chromeColor = 0xdddddd;
        
        // MAIN BODY - use simpler shapes for a more recognizable silhouette
        // Base chassis (lower part)
        // Car body - now with tapered shape (wider in front, narrower in back)
        const bodyShape = new THREE.Shape();
        bodyShape.moveTo(-1.3, -2.3); // Back left
        bodyShape.lineTo(-1.3, 2.3);  // Front left
        bodyShape.lineTo(1.3, 2.3);   // Front right
        bodyShape.lineTo(1.3, -2.3);  // Back right
        bodyShape.lineTo(-1.3, -2.3); // Back to start
        
        const extrudeSettings = {
            steps: 1,
            depth: 0.6,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelOffset: 0,
            bevelSegments: 3
        };
        
        const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
        bodyGeometry.rotateX(-Math.PI / 2);
        
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: pinkColor,
            metalness: 0.5,
            roughness: 0.2
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.3;
        body.castShadow = true;
        this.mesh.add(body);
        
        // Add more detailed body with fins
        const topBodyGeometry = new THREE.BoxGeometry(2.2, 0.4, 4);
        const topBody = new THREE.Mesh(topBodyGeometry, bodyMaterial);
        topBody.position.y = 0.8;
        topBody.castShadow = true;
        this.mesh.add(topBody);
        
        // Windshield
        const windshieldGeometry = new THREE.PlaneGeometry(1.8, 0.8);
        const windshieldMaterial = new THREE.MeshStandardMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.7,
            metalness: 0.9,
            roughness: 0.1
        });
        const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
        windshield.position.set(0, 1.1, 1.2);
        windshield.rotation.x = -Math.PI / 4;
        this.mesh.add(windshield);
        
        // Chrome trim around windshield
        const windshieldFrameGeometry = new THREE.BoxGeometry(1.9, 0.05, 0.85);
        const windshieldFrame = new THREE.Mesh(windshieldFrameGeometry, new THREE.MeshStandardMaterial({
            color: chromeColor,
            metalness: 0.9,
            roughness: 0.1
        }));
        windshieldFrame.position.set(0, 1.1, 1.2);
        windshieldFrame.rotation.x = -Math.PI / 4;
        this.mesh.add(windshieldFrame);

        // Car interior (white)
        const interiorGeometry = new THREE.BoxGeometry(1.8, 0.1, 3);
        const interiorMaterial = new THREE.MeshStandardMaterial({
            color: whiteColor,
            roughness: 0.8
        });
        const interior = new THREE.Mesh(interiorGeometry, interiorMaterial);
        interior.position.y = 0.95;
        this.mesh.add(interior);
        
        // Front seats
        const seatGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.8);
        const seatMaterial = new THREE.MeshStandardMaterial({
            color: whiteColor,
            roughness: 0.9
        });
        
        // Driver seat
        const driverSeat = new THREE.Mesh(seatGeometry, seatMaterial);
        driverSeat.position.set(-0.4, 0.95, 0.5);
        this.mesh.add(driverSeat);
        
        // Passenger seat
        const passengerSeat = new THREE.Mesh(seatGeometry, seatMaterial);
        passengerSeat.position.set(0.4, 0.95, 0.5);
        this.mesh.add(passengerSeat);
        
        // Back seat
        const backSeatGeometry = new THREE.BoxGeometry(1.8, 0.4, 0.8);
        const backSeat = new THREE.Mesh(backSeatGeometry, seatMaterial);
        backSeat.position.set(0, 0.95, -0.7);
        this.mesh.add(backSeat);
        
        // Wheels - chrome rims with black tires
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);
        wheelGeometry.rotateZ(Math.PI / 2);
        
        const tireMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.9
        });
        
        const rimGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.22, 16);
        rimGeometry.rotateZ(Math.PI / 2);
        const rimMaterial = new THREE.MeshStandardMaterial({
            color: chromeColor,
            metalness: 0.9,
            roughness: 0.1
        });
        
        // Create each wheel with rim
        const createWheel = (x, z) => {
            const wheelGroup = new THREE.Group();
            
            const tire = new THREE.Mesh(wheelGeometry, tireMaterial);
            tire.castShadow = true;
            wheelGroup.add(tire);
            
            const rim = new THREE.Mesh(rimGeometry, rimMaterial);
            rim.castShadow = true;
            wheelGroup.add(rim);
            
            wheelGroup.position.set(x, 0.4, z);
            this.mesh.add(wheelGroup);
        };
        
        // Add wheels
        createWheel(-1.1, 1.5); // Front left
        createWheel(1.1, 1.5);  // Front right
        createWheel(-1.1, -1.5); // Rear left
        createWheel(1.1, -1.5);  // Rear right
        
        // Add chrome bumpers
        const frontBumperGeometry = new THREE.BoxGeometry(2.2, 0.2, 0.3);
        const bumperMaterial = new THREE.MeshStandardMaterial({
            color: chromeColor,
            metalness: 0.9,
            roughness: 0.1
        });
        
        const frontBumper = new THREE.Mesh(frontBumperGeometry, bumperMaterial);
        frontBumper.position.set(0, 0.5, 2.2);
        frontBumper.castShadow = true;
        this.mesh.add(frontBumper);
        
        const rearBumper = new THREE.Mesh(frontBumperGeometry, bumperMaterial);
        rearBumper.position.set(0, 0.5, -2.2);
        rearBumper.castShadow = true;
        this.mesh.add(rearBumper);
        
        // Add tail fins (classic Cadillac style)
        const finGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.8);
        const leftFin = new THREE.Mesh(finGeometry, bodyMaterial);
        leftFin.position.set(-1.05, 0.8, -1.8);
        this.mesh.add(leftFin);
        
        const rightFin = new THREE.Mesh(finGeometry, bodyMaterial);
        rightFin.position.set(1.05, 0.8, -1.8);
        this.mesh.add(rightFin);
        
        // Chrome trim on fins
        const finTrimGeometry = new THREE.BoxGeometry(0.12, 0.1, 0.8);
        const leftFinTrim = new THREE.Mesh(finTrimGeometry, bumperMaterial);
        leftFinTrim.position.set(-1.05, 1.05, -1.8);
        this.mesh.add(leftFinTrim);
        
        const rightFinTrim = new THREE.Mesh(finTrimGeometry, bumperMaterial);
        rightFinTrim.position.set(1.05, 1.05, -1.8);
        this.mesh.add(rightFinTrim);
        
        // Add headlights
        const headlightGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const headlightMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffcc,
            emissive: 0xffffcc,
            emissiveIntensity: 0.5
        });
        
        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(-0.7, 0.6, 2.2);
        this.mesh.add(leftHeadlight);
        
        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(0.7, 0.6, 2.2);
        this.mesh.add(rightHeadlight);
        
        // Add tail lights
        const tailLightGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.1);
        const tailLightMaterial = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        
        const leftTailLight = new THREE.Mesh(tailLightGeometry, tailLightMaterial);
        leftTailLight.position.set(-0.8, 0.6, -2.25);
        this.mesh.add(leftTailLight);
        
        const rightTailLight = new THREE.Mesh(tailLightGeometry, tailLightMaterial);
        rightTailLight.position.set(0.8, 0.6, -2.25);
        this.mesh.add(rightTailLight);
        
        // License plate
        const plateGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.05);
        const plateMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.8
        });
        
        const plate = new THREE.Mesh(plateGeometry, plateMaterial);
        plate.position.set(0, 0.6, -2.3);
        this.mesh.add(plate);
        
        // License plate text (stylized "LA BABE")
        const plateTextGeometry = new THREE.BoxGeometry(0.7, 0.3, 0.06);
        const plateTextMaterial = new THREE.MeshStandardMaterial({
            color: 0x0045ad,
            roughness: 0.8
        });
        
        const plateText = new THREE.Mesh(plateTextGeometry, plateTextMaterial);
        plateText.position.set(0, 0.6, -2.33);
        this.mesh.add(plateText);
        
        // Additional chrome highlights (door handles, side trim)
        // Side trim
        const sideTrimGeometry = new THREE.BoxGeometry(0.05, 0.1, 4);
        
        const leftSideTrim = new THREE.Mesh(sideTrimGeometry, bumperMaterial);
        leftSideTrim.position.set(-1.1, 0.6, 0);
        this.mesh.add(leftSideTrim);
        
        const rightSideTrim = new THREE.Mesh(sideTrimGeometry, bumperMaterial);
        rightSideTrim.position.set(1.1, 0.6, 0);
        this.mesh.add(rightSideTrim);
        
        // Door handles
        const handleGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.2);
        
        const leftDoorHandle = new THREE.Mesh(handleGeometry, bumperMaterial);
        leftDoorHandle.position.set(-1.15, 0.8, 0.3);
        this.mesh.add(leftDoorHandle);
        
        const rightDoorHandle = new THREE.Mesh(handleGeometry, bumperMaterial);
        rightDoorHandle.position.set(1.15, 0.8, 0.3);
        this.mesh.add(rightDoorHandle);
        
        // Position the whole car
        this.mesh.position.y = 0.1;
    }
}

export default BasicBitch; 