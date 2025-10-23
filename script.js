/* =======================================================
   🔹 Convert Labs — Smart Unit Converter
   All converter functions + tab logic + counter + helpers
   ======================================================= */

// Wait for splash screen fade, then show app
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
  }, 1000);
});

// 🔹 Tab switching
function showConverter(id) {
  document.querySelectorAll('.converter').forEach(div => div.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// =======================================================
// 🔹 LENGTH CONVERTER
// =======================================================
function convertLength() {
  const val = parseFloat(document.getElementById('lengthInput').value);
  const from = document.getElementById('lengthFrom').value;
  const to = document.getElementById('lengthTo').value;

  const factors = {
    m: 1, km: 1000, cm: 0.01, mm: 0.001,
    "µm": 1e-6, nm: 1e-9, yd: 0.9144,
    ft: 0.3048, in: 0.0254, ly: 9.461e15
  };

  if (isNaN(val)) return alert("Enter a valid number");

  const result = (val * factors[from]) / factors[to];
  document.getElementById('lengthResult').innerText =
    `${val} ${from} = ${result.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${to}`;
}

// =======================================================
// 🔹 TEMPERATURE CONVERTER
// =======================================================
function convertTemperature() {
  const val = parseFloat(document.getElementById('tempInput').value);
  const from = document.getElementById('tempFrom').value;
  const to = document.getElementById('tempTo').value;
  if (isNaN(val)) return alert("Enter a valid number");

  let result = val;

  if (from === "C" && to === "F") result = (val * 9 / 5) + 32;
  else if (from === "F" && to === "C") result = (val - 32) * 5 / 9;
  else if (from === "C" && to === "K") result = val + 273.15;
  else if (from === "K" && to === "C") result = val - 273.15;
  else if (from === "F" && to === "K") result = (val - 32) * 5 / 9 + 273.15;
  else if (from === "K" && to === "F") result = (val - 273.15) * 9 / 5 + 32;

  document.getElementById('tempResult').innerText =
    `${val}°${from} = ${result.toFixed(2)}°${to}`;
}

// =======================================================
// 🔹 VOLUME CONVERTER
// =======================================================
const volumeUnits = {
  "Liter (L)": 1,
  "Milliliter (mL)": 0.001,
  "Cubic meter (m³)": 1000,
  "Cubic centimeter (cm³)": 0.001,
  "Cubic inch (in³)": 0.0163871,
  "Cubic foot (ft³)": 28.3168,
  "US gallon (gal US)": 3.78541,
  "UK gallon (gal UK)": 4.54609
};

// Populate dropdowns dynamically
const fromVol = document.getElementById('volumeFrom');
const toVol = document.getElementById('volumeTo');
for (const unit in volumeUnits) {
  const opt1 = document.createElement('option');
  opt1.value = unit; opt1.textContent = unit;
  fromVol.appendChild(opt1.cloneNode(true));
  toVol.appendChild(opt1);
}

function convertVolume() {
  const val = parseFloat(document.getElementById('volumeInput').value);
  if (isNaN(val)) return alert("Enter a valid number");
  const from = document.getElementById('volumeFrom').value;
  const to = document.getElementById('volumeTo').value;
  const liters = val * volumeUnits[from];
  const result = liters / volumeUnits[to];
  document.getElementById('volumeResult').innerText =
    `${val} ${from} = ${result.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${to}`;
}

// =======================================================
// 🔹 CONTAINER VOLUME CALCULATOR
// =======================================================
document.getElementById('containerType').addEventListener('change', e => {
  document.getElementById('boxInputs').style.display = e.target.value === 'box' ? 'block' : 'none';
  document.getElementById('cylinderInputs').style.display = e.target.value === 'cylinder' ? 'block' : 'none';
});

document.getElementById('liquidType').addEventListener('change', e => {
  document.getElementById('customDensity').style.display = e.target.value === 'custom' ? 'block' : 'none';
});

const liquidDensities = {
  water: 1.0,
  milk: 1.03,
  oil: 0.92,
  honey: 1.42
};

function calculateContainerVolume() {
  const type = document.getElementById('containerType').value;
  let volumeCm3 = 0;

  if (type === 'box') {
    const l = parseFloat(document.getElementById('lengthBox').value);
    const w = parseFloat(document.getElementById('widthBox').value);
    const h = parseFloat(document.getElementById('heightBox').value);
    if ([l, w, h].some(isNaN)) return alert("Enter all box dimensions");
    volumeCm3 = l * w * h;
  } else {
    const r = parseFloat(document.getElementById('radiusCylinder').value);
    const h = parseFloat(document.getElementById('heightCylinder').value);
    if ([r, h].some(isNaN)) return alert("Enter radius and height");
    volumeCm3 = Math.PI * r * r * h;
  }

  let density;
  const liquid = document.getElementById('liquidType').value;
  if (liquid === 'custom') {
    density = parseFloat(document.getElementById('customDensity').value);
    if (isNaN(density)) return alert("Enter valid custom density");
  } else {
    density = liquidDensities[liquid];
  }

  const mass = volumeCm3 * density;
  const volumeLiters = volumeCm3 / 1000;

  document.getElementById('containerResult').innerText =
    `Volume: ${volumeLiters.toFixed(3)} L | Mass: ${mass.toFixed(2)} g`;
}

// =======================================================
// 🔹 KITCHEN CONVERTER
// =======================================================
const kitchenGroups = {
  "Dry Ingredients": {
    "All-purpose flour": 120,
    "Whole wheat flour": 130,
    "Bread flour": 125,
    "Sugar (granulated)": 200,
    "Brown sugar": 220,
    "Powdered sugar": 120,
    "Cocoa powder": 100,
    "Baking powder": 192,
    "Baking soda": 230,
    "Cornstarch": 128,
    "Salt (fine)": 292,
    "Sea salt (coarse)": 273,
    "Ground spices (avg)": 220,
    "Oats": 90,
    "Rice": 195,
    "Pasta": 100,
    "Coffee (ground)": 82,
    "Tea leaves": 90
  },
  "Wet Ingredients": {
    "Water": 240,
    "Milk": 245,
    "Cream": 250,
    "Oil (vegetable)": 218,
    "Olive oil": 216,
    "Butter (melted)": 227,
    "Honey": 340,
    "Maple syrup": 322,
    "Yogurt": 245,
    "Soya sauce": 230,
    "Vinegar": 238,
    "Lemon juice": 240,
    "Vanilla extract": 208,
    "Tomato paste": 262,
    "Ketchup": 275
  },
  "Nuts & Seeds": {
    "Peanut butter": 258,
    "Almond butter": 265,
    "Tahini": 256,
    "Nuts (chopped)": 150,
    "Seeds (avg)": 140
  },
  "Special": {
    "Chocolate chips": 170,
    "Shredded coconut": 90
  }
};

// Populate ingredients dropdown grouped
const kitchenSelect = document.getElementById('kitchenIngredient');
for (const group in kitchenGroups) {
  const optGroup = document.createElement('optgroup');
  optGroup.label = group;
  for (const item in kitchenGroups[group]) {
    const opt = document.createElement('option');
    opt.value = item;
    opt.textContent = item;
    optGroup.appendChild(opt);
  }
  kitchenSelect.appendChild(optGroup);
}

function convertKitchen() {
  const val = parseFloat(document.getElementById('kitchenInput').value);
  const unit = document.getElementById('kitchenUnit').value;
  const ingredient = document.getElementById('kitchenIngredient').value;
  if (isNaN(val)) return alert("Enter a valid number");

  let gramsPerCup;
  for (const g in kitchenGroups) {
    if (kitchenGroups[g][ingredient]) gramsPerCup = kitchenGroups[g][ingredient];
  }

  const conversions = { cup: 1, tbsp: 1 / 16, tsp: 1 / 48 };
  const grams = val * conversions[unit] * gramsPerCup;

  document.getElementById('kitchenResult').innerText =
    `${val} ${unit}(s) of ${ingredient} = ${grams.toFixed(1)} grams`;
}

// 🔹 Visitor Counter (HTTPS)
fetch('https://api.countapi.xyz/hit/convertlabs.online/visits')
  .then(res => res.json())
  .then(data => {
    const visitorSpan = document.getElementById('visitorCount');
    if (visitorSpan) visitorSpan.textContent = data.value.toLocaleString();
  })
  .catch(() => {
    const visitorSpan = document.getElementById('visitorCount');
    if (visitorSpan) visitorSpan.textContent = "N/A";
  });


// =======================================================
// 🔹 Favicon helper (ico/png fallback fade)
// =======================================================
const fav = document.querySelector("link[rel='icon']");
if (fav) {
  fav.style.transition = 'opacity 0.8s';
  fav.style.opacity = 0.3;
  setTimeout(() => fav.style.opacity = 1, 800);

   // ===================================================================
// Robust setup: theme toggle, About modal, favicon helper
// Safe to paste at the end of script.js (idempotent)
// ===================================================================
(function () {
  if (window.__convertlabs_init) return;
  window.__convertlabs_init = true;

  document.addEventListener('DOMContentLoaded', () => {
    // --- 1) Ensure header has position relative so absolute toggle can align ---
    const header = document.querySelector('header');
    if (header) header.style.position = header.style.position || 'relative';

    // --- 2) Favicon helper: try PNG first then ICO ---
    (function setFavicon() {
      const prefer = ['favicon.png', 'favicon.ico'];
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      // try list until one loads (browsers may cache but this helps)
      (function tryNext(i) {
        if (i >= prefer.length) return;
        const url = prefer[i];
        // quick HEAD probe by loading an Image
        const img = new Image();
        img.onload = () => { link.href = url; };
        img.onerror = () => tryNext(i + 1);
        img.src = url + '?v=' + Date.now(); // bypass cache probe
      })(0);
    })();

    // --- 3) Create or find theme toggle button ---
    let themeBtn = document.getElementById('themeToggle');
    if (!themeBtn) {
      themeBtn = document.createElement('button');
      themeBtn.id = 'themeToggle';
      themeBtn.title = 'Switch theme';
      themeBtn.type = 'button';
      themeBtn.style.cursor = 'pointer';
      themeBtn.textContent = '🌙';
      // append to header (right side). If header has .header-content, append there; otherwise append to header.
      const headerContent = document.querySelector('.header-content') || header;
      if (headerContent) headerContent.appendChild(themeBtn);
      else if (header) header.appendChild(themeBtn);
    }

    // small CSS fallback to ensure toggle is on the right if missing CSS
    const sheet = document.createElement('style');
    sheet.innerHTML = `
      #themeToggle { position: absolute; right: 1rem; top: 1rem; background:none;border:none;font-size:1.6rem;color:inherit; }
      body { transition: background-color .35s ease, color .35s ease; }
    `;
    document.head.appendChild(sheet);

    // --- 4) Apply saved theme and add handler ---
    const applyTheme = (dark) => {
      if (dark) document.body.classList.add('dark-mode');
      else document.body.classList.remove('dark-mode');
      themeBtn.textContent = dark ? '☀️' : '🌙';
    };

    const saved = localStorage.getItem('convertlabs_theme');
    applyTheme(saved === 'dark');

    themeBtn.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-mode');
      localStorage.setItem('convertlabs_theme', isDark ? 'dark' : 'light');
      themeBtn.textContent = isDark ? '☀️' : '🌙';
    });

    // --- 5) About modal: create if missing, and wire up open/close ---
    let aboutModal = document.getElementById('aboutModal');
    if (!aboutModal) {
      aboutModal = document.createElement('div');
      aboutModal.id = 'aboutModal';
      aboutModal.className = 'modal';
      aboutModal.innerHTML = `
        <div class="modal-content">
          <span class="close" id="closeAbout">&times;</span>
          <h2>About Convert Labs</h2>
          <p>
            Convert Labs is a modern, responsive, all-in-one unit converter built with pure HTML, CSS, and JavaScript.
            It includes converters for Length, Temperature, Volume, Container Volume (with density-based mass calculation),
            and Kitchen measurements.
          </p>
        </div>
      `;
      document.body.appendChild(aboutModal);
    }

    // CSS for modal if not already present
    const modalStyleId = 'convertlabs-modal-style';
    if (!document.getElementById(modalStyleId)) {
      const s = document.createElement('style');
      s.id = modalStyleId;
      s.innerHTML = `
        .modal { display:none; position:fixed; z-index:2000; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.6); }
        .modal-content { background:#fff; color:#222; margin:10% auto; padding:1.5rem; border-radius:10px; width:90%; max-width:520px; box-shadow:0 6px 20px rgba(0,0,0,0.3); }
        .modal-content h2{ color:#3b82f6; margin-top:0; }
        .modal .close { float:right; font-size:1.4rem; cursor:pointer; color:#555; }
      `;
      document.head.appendChild(s);
    }

    const aboutLink = document.getElementById('aboutLink');
    const closeAbout = document.getElementById('closeAbout') || aboutModal.querySelector('.close');

    if (aboutLink) {
      aboutLink.addEventListener('click', (ev) => {
        ev.preventDefault();
        aboutModal.style.display = 'block';
      });
    }

    if (closeAbout) {
      closeAbout.addEventListener('click', () => aboutModal.style.display = 'none');
    }

    window.addEventListener('click', (ev) => {
      if (ev.target === aboutModal) aboutModal.style.display = 'none';
    });

    // --- 6) If CountAPI visitor span exists, (re)load it ---
    const visitorSpan = document.getElementById('visitorCount');
    if (visitorSpan) {
      fetch('https://api.countapi.xyz/hit/convertlabs.online/visits')
        .then(r => r.json())
        .then(d => { visitorSpan.textContent = d.value.toLocaleString(); })
        .catch(() => { /* ignore */ });
    }

  }); // DOMContentLoaded end
})(); 




