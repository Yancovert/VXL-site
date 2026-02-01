/* main.js – ALWAYS REBOOT MODE */

document.addEventListener("DOMContentLoaded", () => {
  
  const bootEl = document.getElementById('boot');

  // 1. RUN ON LOAD (Refresh)
  if (bootEl) {
    resetAndRunBoot(bootEl);
  }

  // 2. RUN ON TAB IN (Tab Out/In)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && bootEl) {
      resetAndRunBoot(bootEl);
    }
  });

  // 3. START OTHER SYSTEMS
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    initScrollReveals();
  }
  initGallery();
  initAudio();
});


/* --- BOOT SEQUENCE LOGIC --- */
let bootInterval = null; // Store interval so we can stop it if needed

function resetAndRunBoot(el) {
  // RESET STATE
  const textEl = el.querySelector('.boot-text');
  if(textEl) textEl.textContent = ""; // Clear old text
  
  el.style.display = 'flex';   // Make visible
  el.style.opacity = '1';      // Reset fade
  el.style.pointerEvents = 'auto'; // Re-enable clicking

  // STOP previous loop if it was running
  if (bootInterval) clearInterval(bootInterval);

  // START SEQUENCE
  const lines = [
    "> LOADING CONVERGENT ARCHIVES...", 
    "> INITIALIZING CONNECTION...", 
    "> FEED ESTABLISHED...",
    "> FETCHING KEY...",
    "> FETCHING KEY...",
    "> KEY FETCHED!",
    "> ENCRYPTING KEY...",
    "> ENCRYPTING KEY...",
    "> ENCRYPTING KEY...",
    "> KEY ENCRYPTED.",
    "> WELCOME, PLAYER!"
  ];
  let i = 0;

  const finish = () => {
    el.style.opacity = '0';
    el.style.pointerEvents = 'none'; // Click-through when hidden
    // NOTE: We do NOT use el.remove() anymore, so we can run it again later.
  };

  // Skip on click
  el.onclick = finish;

  bootInterval = setInterval(() => {
    if (i < lines.length) {
      if(textEl) textEl.textContent += lines[i] + '\n';
      i++;
    } else {
      clearInterval(bootInterval);
      setTimeout(finish, 6000);
    }
  }, 300);
}


/* --- STANDARD FUNCTIONS --- */

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

function initGallery() {
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if(img) openOverlay(img.src, item.dataset.title, item.dataset.desc);
    });
  });
  createOverlay();
}

function initAudio() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  function play(freq) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  }

  const targets = document.querySelectorAll('a, button, .resource-item, .gallery-item');
  targets.forEach(el => {
    el.addEventListener('mouseenter', () => play(600));
    el.addEventListener('mousedown', () => play(150));
  });
}

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