// sfera_alt.js
// Sfera alternativa per altre pagine
// - Nessuna animazione di apparizione
// - Fluttuazione continua
// - Rotazione controllata dal mouse
// - Hover compatibile con cursor.js
// - Spin al click sull’asse Z: 2 giri esatti → decelerazione → balzo medio → ritorno
// - Stesso video come texture (autoplay + loop)
// - Dimensioni aumentate (raggio 1)

// ------------------------------
// Variabili globali
// ------------------------------
let scene_alt, camera_alt, renderer_alt, sphere_alt;
let videoSfondo, textureSfondo_alt;
let mouse_alt = new THREE.Vector2();
let targetRotation_alt = new THREE.Vector2(0, 0);
let clock_alt = new THREE.Clock();

let raycaster_alt = new THREE.Raycaster();
let sphereSize_alt = 1.5; // RAGGIO DELLA NUOVA SFERA

let spinZ_alt = 0;
let spinning_alt = false;

let originalZ_alt = 0;

// Animator state
let spinAnimator = null;

// Supporto hover → cursor.js
window.isHoverSphere = false;

// ------------------------------
// Setup video (autoplay + loop)
// ------------------------------
function setupVideo() {
    videoSfondo = document.getElementById("videoSfondo");

    // Forza autoplay + loop
    videoSfondo.muted = true;
    videoSfondo.loop = true;

    // Prova a partire
    videoSfondo.play().catch(() => {
        console.log("Il browser richiede un'interazione per avviare il video");
    });

    textureSfondo_alt = new THREE.VideoTexture(videoSfondo);
    textureSfondo_alt.minFilter = THREE.LinearFilter;
    textureSfondo_alt.magFilter = THREE.LinearFilter;
}

// ------------------------------
// Init
// ------------------------------
function initAltSphere() {

    scene_alt = new THREE.Scene();

    camera_alt = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1, 1000
    );
    camera_alt.position.z = 9;

    renderer_alt = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer_alt.setSize(window.innerWidth, window.innerHeight);
    renderer_alt.setPixelRatio(window.devicePixelRatio);

    document.getElementById("container").appendChild(renderer_alt.domElement);

    // Setup video
    setupVideo();

    createAltSphere();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene_alt.add(ambientLight);

    // EVENTI
    window.addEventListener("resize", onAltResize);
    document.addEventListener("mousemove", onAltMouseMove);
    window.addEventListener("click", onAltClick);

    animateAltSphere();
}

// ------------------------------
// Create sphere
// ------------------------------
function createAltSphere() {

    const geometry = new THREE.SphereGeometry(sphereSize_alt, 64, 64);

    const material = new THREE.MeshBasicMaterial({
        map: textureSfondo_alt,
        side: THREE.DoubleSide
    });

    sphere_alt = new THREE.Mesh(geometry, material);
    sphere_alt.rotation.y = -Math.PI / 2;
    originalZ_alt = sphere_alt.rotation.z;
    sphere_alt.visible = true;

    scene_alt.add(sphere_alt);
}

// ------------------------------
// Hover + mouse rotation
// ------------------------------
function onAltMouseMove(event) {

    const rect = renderer_alt.domElement.getBoundingClientRect();

    mouse_alt.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse_alt.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    targetRotation_alt.x = -mouse_alt.y * 0.5;
    targetRotation_alt.y = mouse_alt.x * 0.5;

    checkAltHover();
}

function checkAltHover() {
    raycaster_alt.setFromCamera(mouse_alt, camera_alt);
    const hits = raycaster_alt.intersectObject(sphere_alt);

    window.isHoverSphere = hits.length > 0;
}

// ------------------------------
// CLICK → START 2-TURN SPIN
// ------------------------------
function onAltClick(event) {

    raycaster_alt.setFromCamera(mouse_alt, camera_alt);
    const hits = raycaster_alt.intersectObject(sphere_alt);

    if (hits.length === 0) return;

    startSpinWithBounce();
}

// ------------------------------
// 2 TURN SPIN → DECAY → BOUNCE → RETURN
// ------------------------------
function startSpinWithBounce() {

    // cancel any existing animation
    if (spinAnimator) cancelAnimationFrame(spinAnimator);

    const startZ = sphere_alt.rotation.z;
    const twoTurns = Math.PI * 2 * 2;  // 2 giri esatti
    const targetZ = startZ + twoTurns;

    const durationSpin = 1000; // ms → velocità media
    const startTime = performance.now();

    function spinPhase(now) {
        const t = Math.min(1, (now - startTime) / durationSpin);
        const ease = t < 1 ? (1 - Math.pow(1 - t, 3)) : 1; // ease-out cubic

        sphere_alt.rotation.z = startZ + (targetZ - startZ) * ease;

        if (t < 1) {
            spinAnimator = requestAnimationFrame(spinPhase);
        } else {
            // start deceleration phase
            decelerateSpin();
        }
    }

    spinAnimator = requestAnimationFrame(spinPhase);
}

// ------------------------------
// DECELERAZIONE DOPO I 2 GIRI
// ------------------------------
function decelerateSpin() {

    let speed = 0.1; // velocità iniziale post-giri
    const decay = 0.93;

    function decayStep() {

        sphere_alt.rotation.z += speed;
        speed *= decay;

        if (speed > 0.003) {
            spinAnimator = requestAnimationFrame(decayStep);
        } else {
            startBounceReturn();
        }
    }

    spinAnimator = requestAnimationFrame(decayStep);
}

// ------------------------------
// BALZO MEDIO + RITORNO A originalZ_alt
// ------------------------------
function startBounceReturn() {

    const startZ = sphere_alt.rotation.z;
    const overshoot = originalZ_alt + 0.25;   // balzo medio
    const duration = 500;
    const start = performance.now();

    function bounceStep(now) {
        const t = Math.min(1, (now - start) / duration);

        if (t < 0.7) {
            const tt = t / 0.7;
            sphere_alt.rotation.z = startZ + (overshoot - startZ) * (1 - Math.pow(1 - tt, 3));
        } else {
            const tt = (t - 0.7) / 0.3;
            sphere_alt.rotation.z = overshoot + (originalZ_alt - overshoot) * tt;
        }

        if (t < 1) {
            spinAnimator = requestAnimationFrame(bounceStep);
        } else {
            sphere_alt.rotation.z = originalZ_alt;
        }
    }

    spinAnimator = requestAnimationFrame(bounceStep);
}

// ------------------------------
// ANIMAZIONE CONTINUA
// ------------------------------
function animateAltSphere() {
    requestAnimationFrame(animateAltSphere);

    const time = clock_alt.getElapsedTime();

    if (sphere_alt) {

        // mouse rotation (x/y)
        sphere_alt.rotation.x += (targetRotation_alt.x - sphere_alt.rotation.x) * 0.1;
        let targetY = targetRotation_alt.y - Math.PI / 2;
        sphere_alt.rotation.y += (targetY - sphere_alt.rotation.y) * 0.1;

        // floating
        const speed = 2;
        const amplitude = 0.1;
        sphere_alt.position.y = Math.sin(time * speed) * amplitude;
    }

    renderer_alt.render(scene_alt, camera_alt);
}

// ------------------------------
// Resize
// ------------------------------
function onAltResize() {
    camera_alt.aspect = window.innerWidth / window.innerHeight;
    camera_alt.updateProjectionMatrix();
    renderer_alt.setSize(window.innerWidth, window.innerHeight);
}

// ------------------------------
// Start
// ------------------------------
window.addEventListener("DOMContentLoaded", initAltSphere);
