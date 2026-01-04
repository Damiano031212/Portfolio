// ------------------------------
// Variabili globali
// ------------------------------
let scene, camera, renderer, sphere;
let videoSfondo, textureSfondo;
let clock = new THREE.Clock();

let originalZ = 0;
let spinAnimator = null;

// controllo loop
let isSpinning = false;
const SPIN_DELAY = 600; // ms di pausa tra uno spin e l’altro
const REDIRECT_TIME = 5000; // tempo totale prima del redirect

// ------------------------------
// Setup video texture
// ------------------------------
function setupVideo() {
    videoSfondo = document.getElementById("videoSfondo");
    videoSfondo.muted = true;
    videoSfondo.loop = true;

    videoSfondo.play().catch(() => {});

    textureSfondo = new THREE.VideoTexture(videoSfondo);
    textureSfondo.minFilter = THREE.LinearFilter;
    textureSfondo.magFilter = THREE.LinearFilter;
}

// ------------------------------
// Init scena
// ------------------------------
function initLoadingSphere() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 9;

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    document.getElementById("container").appendChild(renderer.domElement);

    setupVideo();
    createSphere();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    window.addEventListener("resize", onResize);

    animate();
    startSpinLoop();
    scheduleRedirect();
}

// ------------------------------
// Sfera
// ------------------------------
function createSphere() {

    const geometry = new THREE.SphereGeometry(0.5, 64, 64);
    const material = new THREE.MeshBasicMaterial({
        map: textureSfondo,
        side: THREE.DoubleSide
    });

    sphere = new THREE.Mesh(geometry, material);
    sphere.rotation.y = -Math.PI / 2;
    originalZ = sphere.rotation.z;

    scene.add(sphere);
}

// ------------------------------
// LOOP SPIN AUTOMATICO
// ------------------------------
function startSpinLoop() {
    if (isSpinning) return;
    isSpinning = true;
    startSpinWithBounce();
}

// ------------------------------
// SPIN → DECELERAZIONE → BALZO → RITORNO
// ------------------------------
function startSpinWithBounce() {

    const startZ = sphere.rotation.z;
    const twoTurns = Math.PI * 4;
    const targetZ = startZ + twoTurns;

    const durationSpin = 1000;
    const startTime = performance.now();

    function spinPhase(now) {
        const t = Math.min(1, (now - startTime) / durationSpin);
        const ease = 1 - Math.pow(1 - t, 3);

        sphere.rotation.z = startZ + (targetZ - startZ) * ease;

        if (t < 1) {
            spinAnimator = requestAnimationFrame(spinPhase);
        } else {
            decelerateSpin();
        }
    }

    spinAnimator = requestAnimationFrame(spinPhase);
}

function decelerateSpin() {

    let speed = 0.1;
    const decay = 0.93;

    function decayStep() {
        sphere.rotation.z += speed;
        speed *= decay;

        if (speed > 0.003) {
            spinAnimator = requestAnimationFrame(decayStep);
        } else {
            startBounceReturn();
        }
    }

    spinAnimator = requestAnimationFrame(decayStep);
}

function startBounceReturn() {

    const startZ = sphere.rotation.z;
    const overshoot = originalZ + 0.25;
    const duration = 500;
    const start = performance.now();

    function bounceStep(now) {
        const t = Math.min(1, (now - start) / duration);

        if (t < 0.7) {
            const tt = t / 0.7;
            sphere.rotation.z = startZ + (overshoot - startZ) * (1 - Math.pow(1 - tt, 3));
        } else {
            const tt = (t - 0.7) / 0.3;
            sphere.rotation.z = overshoot + (originalZ - overshoot) * tt;
        }

        if (t < 1) {
            spinAnimator = requestAnimationFrame(bounceStep);
        } else {
            sphere.rotation.z = originalZ;
            setTimeout(startSpinWithBounce, SPIN_DELAY);
        }
    }

    spinAnimator = requestAnimationFrame(bounceStep);
}

// ------------------------------
// Animazione continua
// ------------------------------
function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();
    sphere.position.y = Math.sin(time * 2) * 0.1;

    renderer.render(scene, camera);
}

// ------------------------------
function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ------------------------------
// Redirect finale
// ------------------------------
function scheduleRedirect() {
    setTimeout(() => {
        window.location.href = "index.html";
    }, REDIRECT_TIME);
}

// ------------------------------
window.addEventListener("DOMContentLoaded", initLoadingSphere);
