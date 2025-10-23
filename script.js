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
   // 🔹 Theme Toggle
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
  }
}

}
// 🌙 Day/Night Theme Toggle
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  // Load saved preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    btn.textContent = '☀️';
  }

  // Toggle on click
  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const dark = document.body.classList.contains('dark-mode');
    btn.textContent = dark ? '☀️' : '🌙';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
     // 🔹 About Modal Logic
const aboutLink = document.getElementById("aboutLink");
const aboutModal = document.getElementById("aboutModal");
const closeAbout = document.getElementById("closeAbout");

if (aboutLink && aboutModal && closeAbout) {
  aboutLink.addEventListener("click", (e) => {
    e.preventDefault();
    aboutModal.style.display = "block";
  });

  closeAbout.addEventListener("click", () => {
    aboutModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === aboutModal) aboutModal.style.display = "none";
  });
}

  });
});





