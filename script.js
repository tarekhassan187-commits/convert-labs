/* ============================================================================
   Convert Labs - Unified client-side script (script.js)
   - Theme toggle (persisted)
   - Tab switching (showConverter)
   - Populate dropdowns (length, temp, volume, kitchen)
   - Container volume UI and calculation (box / cylinder + custom density)
   - Kitchen converter (mass <-> volume using densities)
   - Other converters (length, temp, volume) lightweight helpers
   - Safe guards so pages without elements do not throw errors
   ============================================================================ */

/* ------------------
   tiny helpers
   ------------------ */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

function safeGet(id) { return document.getElementById(id) || null; }

function formatNumber(n, digits = 6) {
  if (!Number.isFinite(n)) return String(n);
  return parseFloat(n.toPrecision(digits)).toString();
}

/* =========================
   THEME TOGGLE (persisted)
   ========================= */
(function themeSetup() {
  const KEY = 'cl_theme';
  const root = document.documentElement;
  const btn = safeGet('themeToggle');

  function applyTheme(t) {
    // Add small transition class for nicer switch
    root.classList.add('theme-transition');
    setTimeout(() => root.classList.remove('theme-transition'), 400);

    if (t === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
      if (btn) btn.textContent = '☀️';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      document.body.classList.remove('dark');
      document.body.classList.add('light');
      if (btn) btn.textContent = '🌙';
    }
    try { localStorage.setItem(KEY, t); } catch(e) {}
  }

  // read saved theme (safe)
  const saved = (function(){
    try { return localStorage.getItem(KEY) || 'light'; } catch(e){ return 'light'; }
  })();
  applyTheme(saved);

  if (btn) {
    on(btn, 'click', () => {
      const current = (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }
})();

/* =========================
   TAB SWITCHING
   - showConverter(tabId)
   - buttons call showConverter('length') etc via inline onclick
   ========================= */
(function tabSetup() {
  // Expose global function so inline onclick in HTML works
  window.showConverter = function showConverter(tabId) {
    const converters = $$('.converter');
    const tabs = $$('.tabs button');
    converters.forEach(c => c.style.display = 'none');
    tabs.forEach(b => b.classList.remove('active'));

    const target = document.getElementById(tabId);
    if (target) target.style.display = 'block';

    // mark button active (match by onclick attribute or text)
    const activeBtn = tabs.find(b => {
      // try to match onclick attribute exactly
      try {
        if (b.getAttribute && b.getAttribute('onclick') && b.getAttribute('onclick').includes(tabId)) return true;
      } catch(e) {}
      // fallback: match text (lowercase)
      return b.textContent && b.textContent.trim().toLowerCase().includes(tabId);
    });
    if (activeBtn) activeBtn.classList.add('active');
  };

  // On DOMContentLoaded, initialize first tab if present
  document.addEventListener('DOMContentLoaded', () => {
    const converters = $$('.converter');
    const tabs = $$('.tabs button');
    if (converters.length > 0) {
      converters.forEach(c => c.style.display = 'none');
      converters[0].style.display = 'block';
    }
    if (tabs.length > 0) {
      tabs.forEach(b => b.classList.remove('active'));
      tabs[0].classList.add('active');
    }
  });
})();

/* =========================================================
   POPULATE DROPDOWNS: length, temperature, volume, kitchen
   (safe: only runs if elements exist)
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  // LENGTH
  const lengthUnits = [
    'millimeter (mm)', 'centimeter (cm)', 'meter (m)', 'kilometer (km)',
    'inch (in)', 'foot (ft)', 'yard (yd)', 'mile (mi)'
  ];
  const lengthFrom = $('#lengthFrom');
  const lengthTo = $('#lengthTo');
  if (lengthFrom && lengthTo) {
    lengthFrom.innerHTML = ''; lengthTo.innerHTML = '';
    lengthUnits.forEach(u => {
      lengthFrom.appendChild(new Option(u, u));
      lengthTo.appendChild(new Option(u, u));
    });
    lengthFrom.value = 'meter (m)';
    lengthTo.value = 'centimeter (cm)';
  }

  // TEMPERATURE
  const tempUnits = ['Celsius (°C)', 'Fahrenheit (°F)', 'Kelvin (K)'];
  const tempFrom = $('#tempFrom');
  const tempTo = $('#tempTo');
  if (tempFrom && tempTo) {
    tempFrom.innerHTML = ''; tempTo.innerHTML = '';
    tempUnits.forEach(u => { tempFrom.appendChild(new Option(u, u)); tempTo.appendChild(new Option(u, u)); });
    tempFrom.value = 'Celsius (°C)';
    tempTo.value = 'Fahrenheit (°F)';
  }

  // VOLUME
  const volumeUnits = [
    'milliliter (ml)', 'liter (L)', 'cup', 'tablespoon (tbsp)',
    'teaspoon (tsp)', 'fluid ounce (fl oz)', 'gallon (gal)', 'pint (pt)'
  ];
  const volumeFrom = $('#volumeFrom');
  const volumeTo = $('#volumeTo');
  if (volumeFrom && volumeTo) {
    volumeFrom.innerHTML = ''; volumeTo.innerHTML = '';
    volumeUnits.forEach(u => { volumeFrom.appendChild(new Option(u, u)); volumeTo.appendChild(new Option(u, u)); });
    volumeFrom.value = 'milliliter (ml)';
    volumeTo.value = 'liter (L)';
  }

  // KITCHEN: units + ingredients
  const kitchenFrom = $('#kitchenFrom');
  const kitchenTo = $('#kitchenTo');
  const kitchenIngredient = $('#kitchenIngredient');

  // units list (mass + volume), include both ml and gm (g)
  const kitchenUnits = [
    { value: 'g', text: 'Gram (g)' },
    { value: 'kg', text: 'Kilogram (kg)' },
    { value: 'oz', text: 'Ounce (oz)' },
    { value: 'lb', text: 'Pound (lb)' },
    { value: 'ml', text: 'Milliliter (ml)' },
    { value: 'l', text: 'Liter (L)' },
    { value: 'cup', text: 'Cup' },
    { value: 'tbsp', text: 'Tablespoon (tbsp)' },
    { value: 'tsp', text: 'Teaspoon (tsp)' },
    { value: 'fl oz', text: 'Fluid ounce (fl oz)' }
  ];

  if (kitchenFrom && kitchenTo && kitchenIngredient) {
    // populate units only if empty (avoid overwriting)
    if (!kitchenFrom.options.length) {
      kitchenUnits.forEach(u => {
        const o = document.createElement('option'); o.value = u.value; o.textContent = u.text;
        kitchenFrom.appendChild(o);
      });
    }
    if (!kitchenTo.options.length) {
      kitchenUnits.forEach(u => {
        const o = document.createElement('option'); o.value = u.value; o.textContent = u.text;
        kitchenTo.appendChild(o);
      });
    }
    // sensible defaults
    kitchenFrom.value = 'g';
    kitchenTo.value = 'cup';
  }
});

/* =========================================================
   CONTAINER VOLUME UI & CALC
   - toggles between boxInputs and cylinderInputs
   - shows custom density input when 'custom' selected
   ========================================================= */
(function containerUI() {
  const typeSel = safeGet('containerType');
  const boxInputs = safeGet('boxInputs');
  const cylInputs = safeGet('cylinderInputs');
  const customDensity = safeGet('customDensity');
  const liquidType = safeGet('liquidType');

  if (!typeSel) return;

  function adjustUI() {
    if (typeSel.value === 'box') {
      if (boxInputs) boxInputs.style.display = 'block';
      if (cylInputs) cylInputs.style.display = 'none';
    } else {
      if (boxInputs) boxInputs.style.display = 'none';
      if (cylInputs) cylInputs.style.display = 'block';
    }
  }
  adjustUI();
  on(typeSel, 'change', adjustUI);

  // custom density toggle
  function adjustCustomDensity() {
    if (liquidType && customDensity) {
      if (liquidType.value === 'custom') customDensity.style.display = 'inline-block';
      else customDensity.style.display = 'none';
    }
  }
  if (liquidType) {
    on(liquidType, 'change', adjustCustomDensity);
    adjustCustomDensity();
  }

  // calculation function (exposed globally)
  window.calculateContainerVolume = function calculateContainerVolume() {
    const outEl = safeGet('containerResult');
    if (!outEl) return;

    const type = typeSel.value;
    let volCm3 = 0; // cubic centimeters

    if (type === 'box') {
      const l = parseFloat(safeGet('lengthBox')?.value || 0);
      const w = parseFloat(safeGet('widthBox')?.value || 0);
      const h = parseFloat(safeGet('heightBox')?.value || 0);
      if (!(l > 0 && w > 0 && h > 0)) { outEl.textContent = 'Enter length, width, and height.'; return; }
      volCm3 = l * w * h; // assuming cm inputs => cm^3
    } else {
      // cylinder: radius and height expected in cm
      const r = parseFloat(safeGet('radiusCylinder')?.value || 0);
      const h = parseFloat(safeGet('heightCylinder')?.value || 0);
      if (!(r > 0 && h > 0)) { outEl.textContent = 'Enter radius and height.'; return; }
      volCm3 = Math.PI * r * r * h;
    }

    const liters = volCm3 / 1000; // 1000 cm3 = 1 L

    // decide density
    const liquid = (safeGet('liquidType')?.value || 'water').toLowerCase();
    let densityMap = {
      'water': 1.00,
      'milk': 1.03,
      'oil': 0.92,
      'honey': 1.42,
      'custom': null
    };
    let density = densityMap[liquid];
    if (liquid === 'custom') {
      const cd = parseFloat(safeGet('customDensity')?.value || 0);
      if (!(cd > 0)) { outEl.textContent = 'Enter a valid custom density (g/cm³).'; return; }
      density = cd;
    }

    const grams = volCm3 * density;

    outEl.innerHTML = `
      <strong>Volume:</strong> ${formatNumber(volCm3, 6)} cm³
      &nbsp;—&nbsp; ${formatNumber(liters, 4)} L
      <br><strong>Mass (approx):</strong> ${formatNumber(grams, 4)} g of ${liquid}
    `;
  };
})();

/* =========================================================
   KITCHEN CONVERTER (mass <-> volume using densities)
   - run only if kitchen elements exist
   - exposes window.convertKitchen() to be called by button onclick
   ========================================================= */
(function kitchenModule() {
  const kitchenInput = safeGet('kitchenInput');
  const kitchenFrom = safeGet('kitchenFrom');
  const kitchenTo = safeGet('kitchenTo');
  const kitchenIngredient = safeGet('kitchenIngredient');
  const kitchenResult = safeGet('kitchenResult');

  if (!kitchenInput || !kitchenFrom || !kitchenTo || !kitchenIngredient || !kitchenResult) {
    // elements missing on this page - skip
    return;
  }

  // unit <-> ml mapping for volume units
  const unitToMl = {
    ml: 1,
    l: 1000,
    'cup': 240,
    'tbsp': 14.7868,
    'tsp': 4.92892,
    'fl oz': 29.5735
  };
  // unit <-> grams mapping for mass units
  const unitToGram = {
    g: 1,
    kg: 1000,
    oz: 28.3495231,
    lb: 453.59237
  };

  // densities (g per ml ~ g/cm3). Add or tweak entries if you want.
  const densities = {
    'water': 1.00,
    'milk (whole)': 1.03,
    'milk': 1.03,
    'butter': 0.96,
    'olive oil': 0.91,
    'oil': 0.92,
    'honey': 1.42,
    'maple syrup': 1.33,
    'molasses': 1.45,
    'corn syrup': 1.36,
    'all-purpose flour': 0.53,
    'almond flour': 0.48,
    'coconut flour': 0.39,
    'granulated sugar': 0.85,
    'brown sugar (packed)': 0.95,
    'brown sugar': 0.95,
    'powdered sugar': 0.56,
    'salt (table)': 1.20,
    'salt': 1.20,
    'baking powder': 0.93,
    'baking soda': 0.96,
    'cocoa powder': 0.64,
    'cornstarch': 0.54,
    'cream cheese': 0.97,
    'yogurt (plain)': 1.03,
    'cheese (grated)': 0.53,
    'peanut butter': 1.05,
    'rice (uncooked)': 0.85,
    'oats (rolled)': 0.38,
    'yeast (active dry)': 0.45,
    'mayonnaise': 0.95,
    'water (room temp)': 1.00
  };

  // utility to normalize ingredient key
  function densFor(key) {
    if (!key) return null;
    const k = String(key).toLowerCase().trim();
    // exact lookup
    if (densities[k] !== undefined) return densities[k];
    // small heuristics: handle "flour" => all-purpose flour
    if (k.includes('flour') && densities['all-purpose flour'] !== undefined) return densities['all-purpose flour'];
    if (k.includes('sugar') && densities['granulated sugar'] !== undefined) return densities['granulated sugar'];
    if (k.includes('milk') && densities['milk (whole)'] !== undefined) return densities['milk (whole)'];
    return null;
  }

  // expose convertKitchen function
  window.convertKitchen = function convertKitchen() {
    const val = parseFloat(kitchenInput.value || '0');
    const from = kitchenFrom.value;
    const to = kitchenTo.value;
    const ingredient = kitchenIngredient.value || 'water';

    kitchenResult.textContent = ''; // clear

    if (!(val > 0)) { kitchenResult.textContent = 'Enter an amount > 0.'; return; }
    if (!from || !to) { kitchenResult.textContent = 'Choose units.'; return; }

    // decide categories
    const isFromVolume = Object.keys(unitToMl).includes(from);
    const isToVolume = Object.keys(unitToMl).includes(to);
    const isFromMass = Object.keys(unitToGram).includes(from);
    const isToMass = Object.keys(unitToGram).includes(to);

    // get density (g per ml)
    const d = densFor(ingredient) || 1.0; // fallback to water-like

    let grams = 0, outVal = 0;

    // convert input to grams (if necessary)
    if (isFromVolume) {
      // convert input -> ml -> grams via density
      const ml = val * (unitToMl[from] || 1);
      grams = ml * d;
    } else if (isFromMass) {
      grams = val * (unitToGram[from] || 1);
    } else {
      kitchenResult.textContent = 'Unsupported "from" unit.';
      return;
    }

    // now convert grams -> target
    if (isToMass) {
      outVal = grams / (unitToGram[to] || 1);
    } else if (isToVolume) {
      // grams -> ml -> target unit
      const ml = grams / d;
      outVal = ml / (unitToMl[to] || 1);
    } else {
      kitchenResult.textContent = 'Unsupported "to" unit.';
      return;
    }

    // friendly result
    kitchenResult.innerHTML = `
      <strong>${formatNumber(val, 6)}</strong> ${from} of <b>${ingredient}</b>
      ≈ <strong>${formatNumber(outVal, 6)}</strong> ${to}
    `;
  };
})();

/* =========================================================
   SIMPLE CONVERTERS (Length, Temperature, Volume)
   - Exposed functions: convertLength, convertTemperature, convertVolume
   ========================================================= */

/* LENGTH */
function convertLength() {
  const v = parseFloat($('#lengthInput')?.value || 0);
  const f = $('#lengthFrom')?.value;
  const t = $('#lengthTo')?.value;
  const out = $('#lengthResult');
  if (!v || !f || !t) { if(out) out.textContent = 'Please fill all fields.'; return; }

  const map = {
    'millimeter (mm)': 0.001,
    'centimeter (cm)': 0.01,
    'meter (m)': 1,
    'kilometer (km)': 1000,
    'inch (in)': 0.0254,
    'foot (ft)': 0.3048,
    'yard (yd)': 0.9144,
    'mile (mi)': 1609.34
  };
  if (!map[f] || !map[t]) { if(out) out.textContent = 'Unsupported unit.'; return; }
  const res = (v * map[f]) / map[t];
  if(out) out.textContent = `${formatNumber(res)} ${t}`;
}

/* TEMPERATURE */
function convertTemperature() {
  const v = parseFloat($('#tempInput')?.value || 0);
  const f = $('#tempFrom')?.value;
  const t = $('#tempTo')?.value;
  const out = $('#tempResult');
  if (!f || !t) { if(out) out.textContent = 'Please select units.'; return; }

  // normalize to Celsius then convert
  let c;
  if (f.includes('Celsius')) c = v;
  else if (f.includes('Fahrenheit')) c = (v - 32) * (5/9);
  else if (f.includes('Kelvin')) c = v - 273.15;
  else { if(out) out.textContent = 'Unsupported unit.'; return; }

  let final;
  if (t.includes('Celsius')) final = c;
  else if (t.includes('Fahrenheit')) final = (c * 9/5) + 32;
  else if (t.includes('Kelvin')) final = c + 273.15;
  else { if(out) out.textContent = 'Unsupported unit.'; return; }

  if(out) out.textContent = `${formatNumber(final, 6)} ${t}`;
}

/* VOLUME (simple convert between listed units) */
function convertVolume() {
  const v = parseFloat($('#volumeInput')?.value || 0);
  const f = $('#volumeFrom')?.value;
  const t = $('#volumeTo')?.value;
  const out = $('#volumeResult');
  if (!v || !f || !t) { if(out) out.textContent = 'Please fill all fields.'; return; }

  const map = {
    'milliliter (ml)': 1,
    'liter (L)': 1000,
    'cup': 240,
    'tablespoon (tbsp)': 14.7868,
    'teaspoon (tsp)': 4.92892,
    'fluid ounce (fl oz)': 29.5735,
    'gallon (gal)': 3785.41,
    'pint (pt)': 473.176
  };

  if (!map[f] || !map[t]) { if(out) out.textContent = 'Unsupported unit.'; return; }
  const res = (v * map[f]) / map[t];
  if(out) out.textContent = `${formatNumber(res, 6)} ${t}`;
}

/* =========================================================
   PAGE LOAD / graceful loader
   - Shows #app and hides #loading-screen when DOM ready
   - Also listens for window.onerror to ensure app shown
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const app = $('#app');
  const loader = $('#loading-screen');
  if (app) app.style.display = 'block';
  if (loader) loader.style.display = 'none';
  console.log('Convert Labs ready ✅');
});

window.addEventListener('error', (e) => {
  console.warn('⚠️ JS Error:', e && e.message ? e.message : e);
  // ensure app shown even if error
  const app = $('#app');
  const loader = $('#loading-screen');
  if (app) app.style.display = 'block';
  if (loader) loader.style.display = 'none';
});
