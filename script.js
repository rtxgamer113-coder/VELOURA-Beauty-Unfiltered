import * as THREE from 'three';

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const toast = $('#toast');
let toastTimer;
function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

// Responsive navigation
$('#menuToggle').addEventListener('click', () => {
  const open = $('#mainNav').classList.toggle('open');
  $('#menuToggle').setAttribute('aria-expanded', String(open));
});
$$('.main-nav a').forEach(a => a.addEventListener('click', () => $('#mainNav').classList.remove('open')));
$('#searchBtn').addEventListener('click', () => {
  const term = prompt('What are you looking for? (e.g. lipstick, blush, skincare)');
  if (term && term.trim()) {
    const found = $$('.product-card').find(card => card.dataset.name.toLowerCase().includes(term.trim().toLowerCase()));
    if (found) { found.scrollIntoView({behavior:'smooth', block:'center'}); found.animate([{transform:'scale(1)'},{transform:'scale(1.025)'},{transform:'scale(1)'}], {duration:500}); }
    else notify(`Try browsing our edit for “${term.trim()}”.`);
  }
});
$('#bagBtn').addEventListener('click', () => notify(`Your beauty bag has ${$('#bagCount').textContent} item(s).`));

// Demo cart and wishlist interactions
let cartCount = 0;
$$('.quick-add').forEach(button => button.addEventListener('click', () => {
  cartCount++;
  $('#bagCount').textContent = cartCount;
  const name = button.closest('.product-card').dataset.name;
  notify(`${name} added to your beauty bag ✳`);
}));
$$('.heart').forEach(button => button.addEventListener('click', () => {
  button.classList.toggle('active');
  button.textContent = button.classList.contains('active') ? '♥' : '♡';
  notify(button.classList.contains('active') ? 'Saved to your wishlist ♡' : 'Removed from your wishlist');
}));

// Product carousel controls scroll the product row on compact screens and nudge cards on desktop.
const productGrid = $('#productGrid');
$('#nextProducts').addEventListener('click', () => productGrid.scrollBy({left: productGrid.clientWidth * .65, behavior:'smooth'}));
$('#prevProducts').addEventListener('click', () => productGrid.scrollBy({left: -productGrid.clientWidth * .65, behavior:'smooth'}));

// Newsletter front-end validation / demo confirmation
$('#newsletterForm').addEventListener('submit', event => {
  event.preventDefault();
  const email = $('#email').value.trim();
  if (!email) return;
  $('#formMessage').textContent = `You're on the list, ${email}. Watch this space for good things ✳`;
  $('#email').value = '';
});

// Three.js lipstick: all geometry is generated locally; drag or touch to rotate.
const canvas = $('#productCanvas');
const fallback = $('#threeFallback');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
  camera.position.set(0, .35, 7.7);

  scene.add(new THREE.HemisphereLight(0xffd9e4, 0x27101e, 2.1));
  const key = new THREE.DirectionalLight(0xffe2ec, 4.3); key.position.set(3, 5, 5); scene.add(key);
  const rim = new THREE.PointLight(0xff5c9a, 25, 12); rim.position.set(-3, 1, 2); scene.add(rim);
  const fill = new THREE.PointLight(0xffd4ac, 10, 10); fill.position.set(2, -2, 3); scene.add(fill);

  const group = new THREE.Group(); scene.add(group);
  const metal = new THREE.MeshStandardMaterial({color:0xd7b7bf, metalness:.92, roughness:.2});
  const blackMetal = new THREE.MeshStandardMaterial({color:0x171419, metalness:.76, roughness:.24});
  const rose = new THREE.MeshPhysicalMaterial({color:0xb6385c, metalness:.22, roughness:.2, clearcoat:1, clearcoatRoughness:.1});
  const pinkMetal = new THREE.MeshStandardMaterial({color:0xe9a4b8, metalness:.85, roughness:.18});
  function cylinder(radiusTop, radiusBottom, height, material, y, radial=64) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radial, 1), material);
    mesh.position.y = y; group.add(mesh); return mesh;
  }
  // Cap / casing / collar / lipstick bullet.
  cylinder(.43,.43,1.45,blackMetal,.10);
  cylinder(.445,.445,.09,pinkMetal,-.66);
  cylinder(.35,.35,.11,metal,-.76);
  cylinder(.31,.31,.95,blackMetal,-1.27);
  const bullet = new THREE.Group(); bullet.position.y=-.68; group.add(bullet);
  const bulletMesh = new THREE.Mesh(new THREE.CylinderGeometry(.245,.27,.9,64,1),rose);
  bulletMesh.position.y=.61; bullet.add(bulletMesh);
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(.245,.245,.2,64,1),rose);
  tip.position.set(0,1.14,0); tip.rotation.z=-.23; bullet.add(tip);
  const tipCone = new THREE.Mesh(new THREE.ConeGeometry(.245,.33,64),rose);
  tipCone.position.set(-.035,1.32,0); tipCone.rotation.z=-.20; bullet.add(tipCone);
  // Fine metallic rings and a restrained monogram-like badge.
  cylinder(.445,.445,.035,metal,.81);
  const badge = new THREE.Mesh(new THREE.CircleGeometry(.16,48),pinkMetal);
  badge.position.set(0,.12,.433); group.add(badge);
  const vShape = new THREE.Shape();
  vShape.moveTo(-.075,.055); vShape.lineTo(-.025,-.055); vShape.lineTo(.015,.025); vShape.lineTo(.065,-.055); vShape.lineTo(.085,.055);
  const vGeo = new THREE.ShapeGeometry(vShape);
  const vMesh = new THREE.Mesh(vGeo,new THREE.MeshBasicMaterial({color:0x2b1721,side:THREE.DoubleSide}));
  vMesh.position.set(0,.12,.44); group.add(vMesh);

  // Floating glossy beads and orbital ring add depth to the scene.
  const beadMat = new THREE.MeshPhysicalMaterial({color:0xf5a5bd, metalness:.35, roughness:.12, clearcoat:1});
  const beads = [];
  for (let i=0;i<15;i++) {
    const r=.035+(i%4)*.018;
    const bead = new THREE.Mesh(new THREE.SphereGeometry(r,20,20),beadMat);
    const angle=i/15*Math.PI*2;
    bead.userData={angle, radius:1.65+(i%3)*.28, y:Math.sin(i*2.3)*1.15, speed:.18+(i%4)*.035};
    bead.position.set(Math.cos(angle)*bead.userData.radius,bead.userData.y,Math.sin(angle)*.55);
    scene.add(bead); beads.push(bead);
  }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.65,.012,8,140),new THREE.MeshStandardMaterial({color:0xd7779b,metalness:.7,roughness:.24,transparent:true,opacity:.8}));
  ring.rotation.x=1.22; ring.position.y=-1.2; scene.add(ring);
  group.rotation.z=-.10;
  group.rotation.x=.04;

  let targetX=-.08, targetY=-.18, dragging=false, lastX=0, lastY=0;
  const pointerDown = e => { dragging=true; lastX=e.clientX; lastY=e.clientY; canvas.setPointerCapture?.(e.pointerId); };
  const pointerMove = e => {
    if (!dragging) return;
    targetY += (e.clientX-lastX)*.009;
    targetX += (e.clientY-lastY)*.006;
    targetX = Math.max(-.65,Math.min(.65,targetX));
    lastX=e.clientX; lastY=e.clientY;
  };
  const pointerUp = () => { dragging=false; };
  canvas.addEventListener('pointerdown',pointerDown);
  canvas.addEventListener('pointermove',pointerMove);
  canvas.addEventListener('pointerup',pointerUp);
  canvas.addEventListener('pointercancel',pointerUp);
  canvas.addEventListener('pointerleave',pointerUp);

  const clock = new THREE.Clock();
  const resize = () => {
    const rect=canvas.getBoundingClientRect();
    const w=Math.max(1,rect.width), h=Math.max(1,rect.height);
    renderer.setSize(w,h,false);
    camera.aspect=w/h;
    camera.position.z = w < 480 ? 8.6 : w < 800 ? 8 : 7.7;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animate() {
    requestAnimationFrame(animate);
    const t=clock.getElapsedTime();
    if(!dragging && !reducedMotion) targetY += .0017;
    group.rotation.y += (targetY-group.rotation.y)*.055;
    group.rotation.x += (targetX-group.rotation.x)*.055;
    if(!reducedMotion) group.position.y=Math.sin(t*.8)*.055;
    beads.forEach(b=>{
      const d=b.userData;
      const a=d.angle+t*d.speed;
      b.position.x=Math.cos(a)*d.radius;
      b.position.z=Math.sin(a)*.65;
      b.position.y=d.y+Math.sin(t*1.2+d.angle)*.12;
    });
    ring.rotation.z=t*.06;
    renderer.render(scene,camera);
  }
  animate();
} catch (error) {
  console.warn('3D scene could not start:', error);
  canvas.style.display='none';
  fallback.style.display='grid';
}
