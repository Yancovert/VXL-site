/* 
  main.js – Core interactions 
  Tech: Three.js (ze hero background), GSAP + ScrollTrigger ( for scroll
  animations n stuff), vanilla JS ( for gallery overlay & hover effects)
*/

import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// DEFINE BOOT TEXT LINES
const bootLines = [
  "> INITIALIZING VXL_CORE...",
  "> LOADING NETHERITE_UI_MODULES...",
  "> CONNECTING TO NEURAL_LINK...",
  "> CALIBRATING SHADERS...",
  "> ACCESS GRANTED.",
  "> WELCOME, OPERATOR."
];

const bootEl = document.getElementById('boot');
const bootText = document.querySelector('.boot-text');

if (!sessionStorage.getItem('booted')) {
  let i = 0;
  const interval = setInterval(() => {
    bootText.textContent += bootLines[i] + '\n';
    i++;
    if (i === bootLines.length) {
      clearInterval(interval);
      sessionStorage.setItem('booted', 'true');

      setTimeout(() => {
        bootEl.style.opacity = 0;
        setTimeout(() => bootEl.remove(), 800);
      }, 600);
    }
  }, 500);
} else {
  bootEl.remove();
}

// HERO 

function initHero() {
  const canvas = document.getElementById('hero-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 4);

  // Gradient background via shader plane
  const bgGeom = new THREE.PlaneGeometry(2, 2);
  const bgMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `void main(){ gl_Position = vec4(position,1.0); }`,
    fragmentShader: `
      uniform float uTime;
      void main(){
        vec2 uv = gl_FragCoord.xy / vec2(${window.innerWidth.toFixed(1)}, ${window.innerHeight.toFixed(1)});
        float grad = smoothstep(0.0,1.0, uv.y + 0.07*sin(uTime*0.3));
        vec3 dark = vec3(0.02,0.02,0.03);
        vec3 light = vec3(0.07,0.07,0.09);
        gl_FragColor = vec4(mix(dark,light,grad),1.0);
      }
    `,
    side: THREE.DoubleSide,
  });
  scene.add(new THREE.Mesh(bgGeom, bgMat));

  // Centerpiece mesh
  const icoGeom = new THREE.IcosahedronGeometry(0.7, 1);
  const icoMat = new THREE.MeshStandardMaterial({ color: 0x5a5aff, roughness: 0.4, metalness: 0.2 });
  const icoMesh = new THREE.Mesh(icoGeom, icoMat);
  scene.add(icoMesh);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  const clock = new THREE.Clock();

  function render() {
    const t = clock.getElapsedTime();

    // subtle camera orbit
    camera.position.x = Math.sin(t * 0.05) * 0.4;
    camera.position.z = 4 + Math.cos(t * 0.03) * 0.2;
    camera.lookAt(scene.position);

    // rotate centerpiece
    icoMesh.rotation.y = t * 0.1;
    icoMesh.rotation.x = Math.sin(t * 0.07) * 0.05;

    // update shader uniform
    bgMat.uniforms.uTime.value = t;

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();

  // handle resize
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
}


// SCROLL‑BASED REVEALS 

function initScrollReveals() {
  // Hero text entrance
  const tlHero = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tlHero.from('.studio-name', { y: 30, opacity: 0, duration: 1.2 })
        .from('.manifesto', { y: 20, opacity: 0, duration: 0.8 }, '-=0.6');

  // Fade-up sections
  document.querySelectorAll('#ongoing, #about, #contact').forEach(sec => {
    gsap.from(sec, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: sec,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });
  });
}


// GALLERY 

function initGallery() {
  const items = document.querySelectorAll('.gallery-item');

  // Populate captions from data attributes
  items.forEach(item => {
    const { title, desc } = item.dataset;
    const caption = item.querySelector('figcaption');
    caption.querySelector('h3').textContent = title;
    caption.querySelector('p').textContent = desc;
  });

  // Hover tilt effect
  items.forEach(item => {
    item.addEventListener('mouseenter', () => {
      gsap.to(item, { rotationY: 5, rotationX: -2, duration: 0.4, ease: 'power2.out' });
    });
    item.addEventListener('mouseleave', () => {
      gsap.to(item, { rotationY: 0, rotationX: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' });
    });
  });

  // Fullscreen overlay
  createOverlay();
  items.forEach(item => {
    item.addEventListener('click', () => {
      const imgSrc = item.querySelector('img').src;
      const { title, desc } = item.dataset;
      openOverlay(imgSrc, title, desc);
    });
  });
}


// OVERLAY

function createOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'overlay';
  overlay.innerHTML = `
    <div class="overlay-content">
      <img class="overlay-img" src="" alt="">
      <div class="overlay-info"><h3></h3><p></p></div>
      <button class="close-btn" aria-label="Close">✕</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const style = document.createElement('style');
  style.textContent = `
    #overlay{
      position:fixed; inset:0; background:rgba(0,0,0,.94);
      display:flex; align-items:center; justify-content:center;
      opacity:0; pointer-events:none; transition:opacity .3s;
    }
    #overlay.active{ opacity:1; pointer-events:auto; }
    .overlay-content{
      max-width:90vw; max-height:85vh; position:relative;
      display:flex; flex-direction:column; align-items:center;
    }
    .overlay-img{
      max-width:100%; max-height:70vh; object-fit:contain;
      border-radius:4px; box-shadow:0 0 30px rgba(0,0,0,.6);
    }
    .overlay-info{ margin-top:1rem; text-align:center; color:#eaeaea; }
    .overlay-info h3{ font-family:'Playfair Display',serif; font-size:1.8rem; margin-bottom:.3rem; }
    .overlay-info p{ font-size:1rem; max-width:60ch; }
    .close-btn{
      position:absolute; top:-0.8rem; right:-0.8rem;
      background:#333; color:#fff; border:none; border-radius:50%;
      width:2rem; height:2rem; cursor:pointer; font-size:1.2rem;
      line-height:1; display:flex; align-items:center; justify-content:center;
    }
    .close-btn:hover{ background:#555; }
  `;
  document.head.appendChild(style);
}

function openOverlay(src, title, desc) {
  const overlay = document.getElementById('overlay');
  overlay.querySelector('.overlay-img').src = src;
  overlay.querySelector('.overlay-info h3').textContent = title;
  overlay.querySelector('.overlay-info p').textContent = desc;
  overlay.classList.add('active');

  gsap.fromTo('.overlay-content', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' });
}

document.addEventListener('click', e => {
  if (e.target.matches('#overlay .close-btn')) {
    const overlay = document.getElementById('overlay');
    gsap.to('.overlay-content', {
      opacity: 0,
      scale: 0.9,
      duration: 0.4,
      ease: 'power3.in',
      onComplete: () => overlay.classList.remove('active')
    });
  }
});


// INITIALISE EVERYTHING

// Make sure this is inside your DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // HERO, SCROLL, GALLERY etc.
  initHero();
  initScrollReveals();
  initGallery();
});


