// Escena, cámara y renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowShadowMap;
document.body.appendChild(renderer.domElement);

camera.position.z = 100;
camera.position.y = 30;

// Variables de control
let isAnimating = true;
let rotationX = 0;
let rotationY = 0;
let targetRotationX = 0;
let targetRotationY = 0;
const rotationSpeed = 0.01;

// Crear galaxia de flores
function createFlowerGalaxy() {
    const group = new THREE.Group();
    const flowerCount = 2000;
    const galaxyRadius = 60;
    const spiralTurns = 5;

    for (let i = 0; i < flowerCount; i++) {
        // Posición en espiral
        const angle = (i / flowerCount) * Math.PI * 2 * spiralTurns;
        const distance = (i / flowerCount) * galaxyRadius;
        
        const x = Math.cos(angle) * distance + (Math.random() - 0.5) * 10;
        const y = (Math.random() - 0.5) * 30;
        const z = Math.sin(angle) * distance + (Math.random() - 0.5) * 10;

        // Crear flor
        const flower = createFlower();
        flower.position.set(x, y, z);
        flower.scale.set(
            0.5 + Math.random() * 0.5,
            0.5 + Math.random() * 0.5,
            0.5 + Math.random() * 0.5
        );
        
        // Rotación aleatoria
        flower.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        group.add(flower);
    }

    return group;
}

// Crear una flor individual
function createFlower() {
    const flowerGroup = new THREE.Group();

    // Pétalos
    const petalCount = 6;
    for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;
        
        // Crear pétalo como una esfera aplanada
        const petalGeometry = new THREE.SphereGeometry(1, 16, 16);
        const petalMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700,
            emissive: 0xFFAA00,
            emissiveIntensity: 0.6,
            metalness: 0.1,
            roughness: 0.4
        });
        
        const petal = new THREE.Mesh(petalGeometry, petalMaterial);
        petal.scale.set(0.6, 1.2, 0.5);
        petal.position.set(
            Math.cos(angle) * 1.5,
            0,
            Math.sin(angle) * 1.5
        );
        petal.castShadow = true;
        petal.receiveShadow = true;
        
        flowerGroup.add(petal);
    }

    // Centro de la flor
    const centerGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const centerMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFA500,
        emissive: 0xFF8800,
        emissiveIntensity: 0.8,
        metalness: 0.2,
        roughness: 0.3
    });
    
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.castShadow = true;
    center.receiveShadow = true;
    flowerGroup.add(center);

    return flowerGroup;
}

// Iluminación
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xFFD700, 1.5, 200);
pointLight1.position.set(50, 50, 50);
pointLight1.castShadow = true;
pointLight1.shadow.mapSize.width = 2048;
pointLight1.shadow.mapSize.height = 2048;
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xFF69B4, 1, 150);
pointLight2.position.set(-50, -30, -50);
scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0x00FFFF, 0.8, 150);
pointLight3.position.set(0, 60, -50);
scene.add(pointLight3);

// Crear fondo de estrellas
function createStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const positions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 500;
        positions[i + 1] = (Math.random() - 0.5) * 500;
        positions[i + 2] = (Math.random() - 0.5) * 500;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 2,
        sizeAttenuation: true
    });
    
    return new THREE.Points(starGeometry, starMaterial);
}

// Agregar elementos a la escena
const galaxy = createFlowerGalaxy();
scene.add(galaxy);

const starfield = createStarfield();
scene.add(starfield);

// Controles con mouse
document.addEventListener('mousemove', (e) => {
    targetRotationX = (e.clientY / window.innerHeight) * Math.PI * 0.3 - Math.PI * 0.15;
    targetRotationY = (e.clientX / window.innerWidth) * Math.PI * 0.3 - Math.PI * 0.15;
});

// Zoom con rueda del mouse
document.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.position.z += e.deltaY * 0.1;
    camera.position.z = Math.max(20, Math.min(200, camera.position.z));
}, { passive: false });

// Pausar/reanudar con espacio
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        isAnimating = !isAnimating;
    }
});

// Responder a cambios de tamaño de ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animación
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    
    time += 0.001;
    
    if (isAnimating) {
        // Rotación suave
        rotationX += (targetRotationX - rotationX) * rotationSpeed;
        rotationY += (targetRotationY - rotationY) * rotationSpeed;
        
        galaxy.rotation.x = rotationX;
        galaxy.rotation.y = rotationY;
        
        // Rotación lenta de la galaxia en sí
        galaxy.rotation.z += 0.0001;
        
        // Animar flores individuales
        galaxy.children.forEach((flower, index) => {
            flower.rotation.x += 0.001;
            flower.rotation.y += 0.002;
            flower.position.y += Math.sin(time * 2 + index) * 0.001;
        });
    }
    
    // Rotar estrellas de fondo
    starfield.rotation.x += 0.00001;
    starfield.rotation.y += 0.00002;
    
    renderer.render(scene, camera);
}