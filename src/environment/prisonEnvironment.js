import * as THREE from 'three';

// Materials for environment elements
const MATERIALS = {
    concrete: new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.9,
        metalness: 0.1
    }),
    metal: new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.4,
        metalness: 0.8
    }),
    rustyMetal: new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.3
    }),
    darkMetal: new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.7,
        metalness: 0.6
    }),
    glass: new THREE.MeshStandardMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.3,
        roughness: 0.1,
        metalness: 0.9
    }),
    fence: new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.6,
        metalness: 0.8,
        wireframe: true
    }),
    spotlight: new THREE.MeshStandardMaterial({
        color: 0xffffcc,
        emissive: 0xffffcc,
        emissiveIntensity: 0.5
    })
};

// Create a prison wall section
function createPrisonWall(length, height, position) {
    const wall = new THREE.Group();
    
    // Main concrete wall
    const wallGeometry = new THREE.BoxGeometry(2, height, length);
    const wallMesh = new THREE.Mesh(wallGeometry, MATERIALS.concrete);
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    wallMesh.position.set(0, height/2, 0);
    wall.add(wallMesh);
    
    // Razor wire on top
    const wireGeometry = new THREE.TorusGeometry(0.3, 0.08, 8, 12);
    const wireCount = Math.floor(length / 2);
    
    for (let i = 0; i < wireCount; i++) {
        const wire = new THREE.Mesh(wireGeometry, MATERIALS.metal);
        wire.position.set(0, height + 0.3, -length/2 + i * 2 + 1);
        wire.rotation.x = Math.PI/2;
        wire.castShadow = true;
        wall.add(wire);
    }
    
    // Position the wall
    wall.position.copy(position);
    
    return wall;
}

// Create a guard tower
function createGuardTower(position) {
    const tower = new THREE.Group();
    
    // Tower base
    const baseGeometry = new THREE.BoxGeometry(6, 15, 6);
    const base = new THREE.Mesh(baseGeometry, MATERIALS.concrete);
    base.position.y = 7.5;
    base.castShadow = true;
    base.receiveShadow = true;
    tower.add(base);
    
    // Tower top/guard room
    const topGeometry = new THREE.BoxGeometry(8, 4, 8);
    const top = new THREE.Mesh(topGeometry, MATERIALS.darkMetal);
    top.position.y = 17;
    top.castShadow = true;
    top.receiveShadow = true;
    tower.add(top);
    
    // Windows
    const windowGeometry = new THREE.PlaneGeometry(2, 1);
    const windowPositions = [
        { x: 0, y: 17, z: 4.01, rotY: 0 },
        { x: 0, y: 17, z: -4.01, rotY: Math.PI },
        { x: 4.01, y: 17, z: 0, rotY: Math.PI/2 },
        { x: -4.01, y: 17, z: 0, rotY: -Math.PI/2 }
    ];
    
    windowPositions.forEach(pos => {
        const window = new THREE.Mesh(windowGeometry, MATERIALS.glass);
        window.position.set(pos.x, pos.y, pos.z);
        window.rotation.y = pos.rotY;
        tower.add(window);
    });
    
    // Spotlight
    const spotlightGeometry = new THREE.ConeGeometry(1, 2, 16);
    const spotlight = new THREE.Mesh(spotlightGeometry, MATERIALS.metal);
    spotlight.position.set(0, 15, 3.5);
    spotlight.rotation.x = Math.PI/4;
    tower.add(spotlight);
    
    // Add actual light
    const light = new THREE.SpotLight(0xffffcc, 5, 100, Math.PI/6);
    light.position.set(0, 15, 3.5);
    light.target.position.set(0, 0, 20);
    light.castShadow = true;
    tower.add(light);
    tower.add(light.target);
    
    // Position the tower
    tower.position.copy(position);
    
    return tower;
}

// Create a prison building
function createPrisonBuilding(width, height, depth, position) {
    const building = new THREE.Group();
    
    // Main building structure
    const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
    const buildingMesh = new THREE.Mesh(buildingGeometry, MATERIALS.concrete);
    buildingMesh.position.y = height/2;
    buildingMesh.castShadow = true;
    buildingMesh.receiveShadow = true;
    building.add(buildingMesh);
    
    // Windows (cell windows)
    const windowSize = 0.5;
    const windowSpacingX = 3;
    const windowSpacingY = 3;
    const windowGeometry = new THREE.PlaneGeometry(windowSize, windowSize);
    
    // Calculate how many windows we can fit
    const windowsX = Math.floor(width / windowSpacingX) - 1;
    const windowsY = Math.floor(height / windowSpacingY) - 1;
    
    // Place windows on front and back
    for (let x = 0; x < windowsX; x++) {
        for (let y = 0; y < windowsY; y++) {
            // Front windows
            const frontWindow = new THREE.Mesh(windowGeometry, MATERIALS.glass);
            frontWindow.position.set(
                -width/2 + (x+1) * windowSpacingX, 
                (y+1) * windowSpacingY, 
                depth/2 + 0.01
            );
            building.add(frontWindow);
            
            // Back windows
            const backWindow = new THREE.Mesh(windowGeometry, MATERIALS.glass);
            backWindow.position.set(
                -width/2 + (x+1) * windowSpacingX, 
                (y+1) * windowSpacingY, 
                -depth/2 - 0.01
            );
            backWindow.rotation.y = Math.PI;
            building.add(backWindow);
        }
    }
    
    // Add a door
    const doorGeometry = new THREE.PlaneGeometry(2, 3);
    const doorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333, 
        roughness: 0.8 
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.5, depth/2 + 0.01);
    building.add(door);
    
    // Position the building
    building.position.copy(position);
    
    return building;
}

// Create industrial elements
function createIndustrialElement(type, position) {
    const element = new THREE.Group();
    
    switch(type) {
        case 'scrapyard':
            // Create a pile of scrap metal
            for (let i = 0; i < 15; i++) {
                const size = 1 + Math.random() * 2;
                const geometry = new THREE.BoxGeometry(size, size * 0.5, size);
                const material = Math.random() > 0.5 ? MATERIALS.rustyMetal : MATERIALS.darkMetal;
                const scrap = new THREE.Mesh(geometry, material);
                
                // Random position within a circle
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 5;
                scrap.position.set(
                    Math.cos(angle) * radius,
                    size * 0.25 + Math.random() * 1.5,
                    Math.sin(angle) * radius
                );
                
                // Random rotation
                scrap.rotation.set(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );
                
                scrap.castShadow = true;
                scrap.receiveShadow = true;
                element.add(scrap);
            }
            break;
            
        case 'factory':
            // Main factory building
            const factoryGeometry = new THREE.BoxGeometry(15, 10, 20);
            const factory = new THREE.Mesh(factoryGeometry, MATERIALS.concrete);
            factory.position.y = 5;
            factory.castShadow = true;
            factory.receiveShadow = true;
            element.add(factory);
            
            // Factory roof
            const roofGeometry = new THREE.BoxGeometry(17, 1, 22);
            const roof = new THREE.Mesh(roofGeometry, MATERIALS.darkMetal);
            roof.position.y = 10.5;
            roof.castShadow = true;
            element.add(roof);
            
            // Smokestack
            const stackGeometry = new THREE.CylinderGeometry(1.5, 2, 12, 16);
            const stack = new THREE.Mesh(stackGeometry, MATERIALS.concrete);
            stack.position.set(5, 16, 0);
            stack.castShadow = true;
            element.add(stack);
            
            // Factory windows
            const factoryWindowGeometry = new THREE.PlaneGeometry(2, 1.5);
            for (let i = 0; i < 5; i++) {
                const window = new THREE.Mesh(factoryWindowGeometry, MATERIALS.glass);
                window.position.set(-5, 5, -9 + i * 4);
                window.rotation.y = Math.PI/2;
                element.add(window);
            }
            break;
            
        case 'shipping':
            // Create shipping containers
            const containerColors = [0xA52A2A, 0x4682B4, 0x228B22, 0x8B4513];
            
            for (let i = 0; i < 4; i++) {
                const containerGeometry = new THREE.BoxGeometry(6, 3, 12);
                const containerMaterial = new THREE.MeshStandardMaterial({
                    color: containerColors[i % containerColors.length],
                    roughness: 0.8,
                    metalness: 0.2
                });
                
                const container = new THREE.Mesh(containerGeometry, containerMaterial);
                
                // Stack containers
                if (i < 2) {
                    container.position.set(-3 + (i * 7), 1.5, 0);
                } else {
                    container.position.set(-3 + ((i-2) * 7), 4.5, 0);
                }
                
                container.castShadow = true;
                container.receiveShadow = true;
                element.add(container);
            }
            break;
    }
    
    // Position the element
    element.position.copy(position);
    
    return element;
}

// Create signage
function createSignage(type, position) {
    const sign = new THREE.Group();
    
    switch(type) {
        case 'deathrace':
            // Post
            const postGeometry = new THREE.BoxGeometry(0.5, 8, 0.5);
            const post = new THREE.Mesh(postGeometry, MATERIALS.darkMetal);
            post.position.y = 4;
            post.castShadow = true;
            sign.add(post);
            
            // Sign board
            const boardGeometry = new THREE.BoxGeometry(8, 3, 0.2);
            const boardMaterial = new THREE.MeshStandardMaterial({
                color: 0x000000,
                roughness: 0.7,
                metalness: 0.3
            });
            const board = new THREE.Mesh(boardGeometry, boardMaterial);
            board.position.y = 7;
            board.castShadow = true;
            sign.add(board);
            
            // Sign text would be added via texture in a real implementation
            break;
            
        case 'warning':
            // Warning sign pole
            const warningPostGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
            const warningPost = new THREE.Mesh(warningPostGeometry, MATERIALS.metal);
            warningPost.position.y = 1.5;
            sign.add(warningPost);
            
            // Warning sign (triangle for danger)
            const triangleShape = new THREE.Shape();
            triangleShape.moveTo(0, 1);
            triangleShape.lineTo(-0.866, -0.5);
            triangleShape.lineTo(0.866, -0.5);
            triangleShape.lineTo(0, 1);
            
            const triangleGeometry = new THREE.ShapeGeometry(triangleShape);
            const triangleMaterial = new THREE.MeshStandardMaterial({
                color: 0xffcc00,
                roughness: 0.5,
                metalness: 0.1
            });
            
            const triangleSign = new THREE.Mesh(triangleGeometry, triangleMaterial);
            triangleSign.scale.set(1, 1, 1);
            triangleSign.position.set(0, 2.8, 0);
            triangleSign.rotation.z = Math.PI;
            sign.add(triangleSign);
            break;
    }
    
    // Position the sign
    sign.position.copy(position);
    
    return sign;
}

// Function to create a complete environment section
function createEnvironmentSection(zPosition, sectionLength) {
    const section = new THREE.Group();
    
    // Prison walls on both sides
    const leftWall = createPrisonWall(sectionLength, 5, new THREE.Vector3(-40, 0, zPosition));
    const rightWall = createPrisonWall(sectionLength, 5, new THREE.Vector3(40, 0, zPosition));
    section.add(leftWall, rightWall);
    
    // Add guard towers at the beginning of each section (randomly on left or right)
    if (Math.random() > 0.5) {
        const tower = createGuardTower(new THREE.Vector3(-40, 0, zPosition - sectionLength/4));
        section.add(tower);
    } else {
        const tower = createGuardTower(new THREE.Vector3(40, 0, zPosition - sectionLength/4));
        section.add(tower);
    }
    
    // Add prison buildings behind walls (alternating sides)
    const buildingSide = Math.random() > 0.5 ? -1 : 1;
    const buildingOffset = (Math.random() * 0.5 + 0.25) * sectionLength;
    const building = createPrisonBuilding(
        15 + Math.random() * 10, 
        12 + Math.random() * 8, 
        20 + Math.random() * 15,
        new THREE.Vector3(buildingSide * 60, 0, zPosition - buildingOffset)
    );
    section.add(building);
    
    // Add industrial elements (factories, scrapyards, shipping containers)
    const industrialTypes = ['scrapyard', 'factory', 'shipping'];
    
    // Add one industrial element per section on a random side
    const industrialSide = Math.random() > 0.5 ? -1 : 1;
    const industrialOffset = (Math.random() * 0.5 + 0.25) * sectionLength;
    const industrialElement = createIndustrialElement(
        industrialTypes[Math.floor(Math.random() * industrialTypes.length)],
        new THREE.Vector3(industrialSide * 25, 0, zPosition - industrialOffset)
    );
    section.add(industrialElement);
    
    // Add signage
    if (Math.random() > 0.7) { // 30% chance for death race sign
        const signOffset = (Math.random() * 0.8 + 0.1) * sectionLength;
        const signSide = Math.random() > 0.5 ? -1 : 1;
        const sign = createSignage(
            'deathrace',
            new THREE.Vector3(signSide * 18, 0, zPosition - signOffset)
        );
        section.add(sign);
    }
    
    // Add warning signs near barriers
    if (Math.random() > 0.5) { // 50% chance for warning sign
        const warningSide = Math.random() > 0.5 ? -1 : 1;
        const warningOffset = (Math.random() * 0.9) * sectionLength;
        const warning = createSignage(
            'warning',
            new THREE.Vector3(warningSide * 14, 0, zPosition - warningOffset)
        );
        section.add(warning);
    }
    
    return section;
}

export { createEnvironmentSection, MATERIALS }; 