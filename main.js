/* main.js – Clean Video Version */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Boot Screen Logic
  const bootEl = document.getElementById('boot');
  if (bootEl) {
    if (sessionStorage.getItem('booted')) {
      bootEl.style.display = 'none';
      bootEl.remove();
    } else {
      runBootSequence(bootEl);
    }
  }

  // 2. Initialize Animations
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    initScrollReveals();
  }
  
  // 3. Initialize Utilities
  initGallery();
  initAudio();
});

/* --- BOOT SEQUENCE --- */
function runBootSequence(el) {
  const textEl = el.querySelector('.boot-text');
  const lines = ["> INITIALIZING...", "> VIDEO_FEED_ESTABLISHED...", "> WELCOME."];
  let i = 0;
  const finish = () => {
    sessionStorage.setItem('booted', 'true');
    el.style.opacity = '0';
    setTimeout(() => { if(el.parentNode) el.remove(); }, 500);
  };
  document.addEventListener('click', finish);
  
  const interval = setInterval(() => {
    if (i < lines.length) {
      if(textEl) textEl.textContent += lines[i] + '\n';
      i++;
    } else {
      clearInterval(interval);
      setTimeout(finish, 800);
    }
  }, 300);
}

/* --- SCROLL REVEALS --- */
function initScrollReveals() {
  const tl = gsap.timeline();
  tl.from('.studio-name', { y: 30, opacity: 0, duration: 1 })
    .from('.manifesto', { y: 20, opacity: 0, duration: 1 }, "-=0.5");
  
  document.querySelectorAll('#ongoing, #about, #contact').forEach(sec => {
    gsap.from(sec, {
      y: 50, opacity: 0, duration: 1, 
      scrollTrigger: { trigger: sec, start: 'top 80%' }
    });
  });
}

/* --- GALLERY --- */
function initGallery() {
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if(img) openOverlay(img.src, item.dataset.title, item.dataset.desc);
    });
  });
  createOverlay();
}

/* --- AUDIO --- */
function initAudio() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  function play(freq) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    // Sound Design: High-tech "chirp"
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  }

  // UPDATED SELECTOR: Added '.gallery-item' back to the list
  const targets = document.querySelectorAll('a, button, .resource-item, .gallery-item');
  
  targets.forEach(el => {
    el.addEventListener('mouseenter', () => play(670)); // High pitch on hover
    el.addEventListener('mousedown', () => play(150));  // Low pitch on click
  });
}

/* --- OVERLAY UTILS --- */
function createOverlay() {
  if (document.getElementById('overlay')) return;
  const div = document.createElement('div');
  div.id = 'overlay';
  div.innerHTML = `<div class="content"><img src=""><div class="info"><h3></h3><p></p></div><button>×</button></div>`;
  document.body.appendChild(div);
  Object.assign(div.style, { position:'fixed', inset:'0', background:'rgba(0,0,0,0.95)', display:'none', alignItems:'center', justifyContent:'center', zIndex:'9999' });
  div.querySelector('button').onclick = () => div.style.display = 'none';
  div.querySelector('button').style.cssText = "position:absolute; top:20px; right:20px; font-size:2rem; background:none; border:none; color:white; cursor:pointer;";
}

function openOverlay(src, title, desc) {
  const el = document.getElementById('overlay');
  el.querySelector('img').src = src;
  el.querySelector('h3').textContent = title || '';
  el.querySelector('p').textContent = desc || '';
  el.querySelector('.info').style.color = '#fff';
  el.style.display = 'flex';
}