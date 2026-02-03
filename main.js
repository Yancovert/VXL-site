/* main.js – THE CENTRAL NERVOUS SYSTEM */

document.addEventListener("DOMContentLoaded", () => {
  
  // 1. BOOT SEQUENCE
  const bootEl = document.getElementById('boot');
  if (bootEl) resetAndRunBoot(bootEl);

  // 2. REBOOT ON TAB SWITCH
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && bootEl) {
      resetAndRunBoot(bootEl);
    }
  });

  // 3. INITIALIZE SYSTEMS
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    initScrollReveals();
  }
  
  initGallery();
  initAudio();
  initSidebar();
  initMagneticButtons();
  initTextScramble(); // The Minecraft Effect
});


/* --- THE BOOT SEQUENCE --- */
let bootInterval = null;

function resetAndRunBoot(el) {
  const textEl = el.querySelector('.boot-text');
  if(textEl) textEl.textContent = "";
  
  el.style.display = 'flex';
  el.style.opacity = '1';
  el.style.pointerEvents = 'auto';

  if (bootInterval) clearInterval(bootInterval);

  const lines = [
    "> LOADING CONVERGENT ARCHIVES...", 
    "> INITIALIZING CONNECTION...", 
    "> FEED ESTABLISHED...",
    "> FETCHING KEY...",
    "> KEY FETCHED!",
    "> ENCRYPTING KEY...",
    "> RESOLVING DELTAS...",
    "> WELCOME, PLAYER!"
  ];
  let i = 0;

  const finish = () => {
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
  };

  el.onclick = finish; // Click to skip

  bootInterval = setInterval(() => {
    if (i < lines.length) {
      if(textEl) textEl.textContent += lines[i] + '\n';
      i++;
    } else {
      clearInterval(bootInterval);
      setTimeout(finish, 1000); // Wait 1s then fade
    }
  }, 300);
}


/* --- THE ANIMATOR (Scroll Reveal) --- */
function initScrollReveals() {
  // We explicitly EXCLUDE footer from this list so it stays visible
  const elements = gsap.utils.toArray(`
    .section-title, 
    .about-content, 
    .gallery-item, 
    .resource-item, 
    .contact-links a,
    .resource-grid,
    form
  `);

  elements.forEach(el => {
    gsap.from(el, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    });
  });

  // Special animation for Hero Text
  if (document.querySelector('.studio-name')) {
    const tl = gsap.timeline();
    tl.from('.studio-name', { y: 30, opacity: 0, duration: 1 })
      .from('.manifesto', { y: 20, opacity: 0, duration: 1 }, "-=0.5");
  }
}


/* --- THE DECODER (Minecraft Text Scramble) --- */
function initTextScramble() {
  // Standard Galactic Alphabet (Minecraft Runes)
  const runes = "ᔑᔓᓵᔫᔬᔭᔮᔯᔰᔱᔲᔳᔴᔵᔶᔷᔸᔹᔺᔻᔼᔽᔾᔿᕀᕁᕂᕃᕄᕅᕆᕇᕈᕉᕊᕋᕌᕍᕎᕏᕐᕑᕒᕓᕔ";

  document.querySelectorAll(".glitch, .section-title").forEach(target => {
    target.onmouseover = event => {
      let iterations = 0;
      if(!event.target.dataset.value) event.target.dataset.value = event.target.innerText;
      const originalText = event.target.dataset.value;

      const interval = setInterval(() => {
        event.target.innerText = originalText
          .split("")
          .map((letter, index) => {
            if(index < iterations) return originalText[index];
            return runes[Math.floor(Math.random() * runes.length)];
          })
          .join("");

        if(iterations >= originalText.length) clearInterval(interval);
        iterations += 1 / 2; // Decrypt speed
      }, 30);
    }
  });
}


/* --- THE NAVIGATOR (Sidebar) --- */
function initSidebar() {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove("active"));
        const id = entry.target.getAttribute("id");
        const activeLink = document.querySelector(`.nav-link[data-target="${id}"]`);
        if (activeLink) activeLink.classList.add("active");
      }
    });
  }, { threshold: 0.3, rootMargin: "-10% 0px -50% 0px" });

  sections.forEach(section => observer.observe(section));
}


/* --- THE PHYSICS (Magnetic Buttons) --- */
function initMagneticButtons() {
  const buttons = document.querySelectorAll('button, .contact-links a');
  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });
}


/* --- THE EAR (Audio System) --- */
function initAudio() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  function play(freq) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    // Quick Bip Sound
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  }

  const targets = document.querySelectorAll('a, button, .resource-item, .gallery-item');
  targets.forEach(el => {
    el.addEventListener('mouseenter', () => play(600)); // High pitch hover
    el.addEventListener('mousedown', () => play(150));  // Low pitch click
  });
}


/* --- THE GALLERY (Overlay Logic) --- */
function initGallery() {
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      
      // NEW: If this item is a video, STOP here. 
      // This prevents the Image Overlay from opening.
      if (item.hasAttribute('data-video')) return; 

      const img = item.querySelector('img');
      if(img) openOverlay(img.src, item.dataset.title, item.dataset.desc);
    });
  });
  createOverlay();
}

function createOverlay() {
  if (document.getElementById('overlay')) return;
  const div = document.createElement('div');
  div.id = 'overlay';
  div.innerHTML = `<div class="content"><img src=""><div class="info"><h3></h3><p></p></div><button>×</button></div>`;
  document.body.appendChild(div);
  
  // Basic Overlay Styles injected here for reliability
  Object.assign(div.style, { position:'fixed', inset:'0', background:'rgba(0,0,0,0.95)', display:'none', alignItems:'center', justifyContent:'center', zIndex:'9999' });
  const btn = div.querySelector('button');
  btn.onclick = () => div.style.display = 'none';
  btn.style.cssText = "position:absolute; top:20px; right:20px; font-size:2rem; background:none; border:none; color:white; cursor:pointer;";
}

function openOverlay(src, title, desc) {
  const el = document.getElementById('overlay');
  el.querySelector('img').src = src;
  el.querySelector('img').style.maxWidth = '80%';
  el.querySelector('img').style.maxHeight = '80vh';
  el.querySelector('h3').textContent = title || '';
  el.querySelector('p').textContent = desc || '';
  el.querySelector('.info').style.color = '#fff';
  el.style.display = 'flex';
}

