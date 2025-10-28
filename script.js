/* script.js - Convert Labs
   Fully corrected version (2025-10)
   - Matches current index.html structure
   - Fixes missing IDs that hid homepage
   - Optimized for AdSense & Analytics safety
*/

/* ============================
   Helper utilities
============================ */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

function safeGet(selector) {
  return document.querySelector(selector) || null;
}

function formatNumber(n, digits = 6) {
  if (Number.isFinite(n)) {
    return parseFloat(n.toPrecision(digits)).toString();
  }
  return String(n);
}

/* ============================
   THEME toggle (dark/light)
============================ */
(function themeSetup() {
  const KEY = 'cl_theme';
  const themeToggle = safeGet('#themeToggle');
  const root = document.documentElement;

  function applyTheme(t) {
    if (t === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      if (themeToggle) themeToggle.textContent = '☀️';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      if (themeToggle) themeToggle.textContent = '🌙';
    }
  }

  let saved = localStorage.getItem(KEY) || 'light';
  applyTheme(saved);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      saved = (saved === 'light') ? 'dark' : 'light';
      localStorage.setItem(KEY, saved);
      applyTheme(saved);
    }, { passive: true });
  }
})();

/* ============================
   HEADER / FOOTER fixes
============================ */
(function headerFooterFixes() {
  const logos = ['.logo', '.footer-logo'];
  logos.forEach(sel => {
    const img = safeGet(sel);
    if (img) {
      img.style.width = '44px';
      img.style.height = '44px';
      img.style.objectFit = 'contain';
      img.style.verticalAlign = 'middle';
    }
  });

  const brand = safeGet('.brand');
  if (brand) {
    brand.style.display = 'inline-flex';
    brand.style.alignItems = 'center';
    brand.style.gap = '10px';
    brand.style.textDecoration = 'none';
  }

  const footerBrand = safeGet('.footer-brand');
  if (footerBrand) {
    footerBrand.style.display = 'flex';
    footerBrand.style.alignItems = 'center';
    footerBrand.style.justifyContent = 'center';
    footerBrand.style.gap = '10px';
  }
})();

/* ============================
   CONTACT button
============================ */
(function contactButton() {
  const btn = safeGet('.header-btn');
  if (btn) {
    btn.style.padding = '8px 12px';
    btn.style.borderRadius = '8px';
    btn.style.background = '#fff';
    btn.style.color = '#1e40af';
    btn.style.border = '1px solid rgba(0,0,0,0.06)';
  }
})();

/* ============================
   KITCHEN Converter
============================ */
const Kitchen = (function () {
  const densities = {
    'all-purpose flour': 0.53,
    'sugar (granulated)': 0.85,
    'brown sugar packed': 0.95,
    'butter': 0.96,
    'milk (whole)': 1.03,
    'honey': 1.42,
    'olive oil': 0.92,
    'water': 1.00,
    'rice (uncooked)': 0.85,
    'salt (table)': 1.2,
    'baking powder': 0.7,
    'baking soda': 0.9,
    'cocoa powder': 0.5,
    'powdered sugar': 0.56,
    'cornstarch': 0.6,
    'yeast (active dry)': 0.6,
    'oats (rolled)': 0.35,
    'almond flour': 0.45,
    'coconut flour': 0.35,
    'cream cheese': 0.97,
    'mayonnaise': 0.92,
    'yogurt (plain)': 1.03,
    'cheese (grated)': 0.3,
    'peanut butter': 1.05,
    'maple syrup': 1.33,
    'molasses': 1.4,
    'corn syrup': 1.38
  };

  const ingredientGroups = {
    'Baking Staples': [
      'all-purpose flour', 'bread flour', 'cake flour', 'baking powder', 'baking soda',
      'salt (table)', 'sugar (granulated)', 'brown sugar packed', 'powdered sugar', 'cocoa powder'
    ],
    'Dairy & Fats': [
      'butter', 'milk (whole)', 'cream cheese', 'yogurt (plain)', 'cheese (grated)'
    ],
    'Oils & Syrups': [
      'olive oil', 'maple syrup', 'honey', 'molasses', 'corn syrup'
    ],
    'Nuts & Flours': [
      'almond flour', 'coconut flour', 'peanut butter'
    ],
    'Misc': [
      'rice (uncooked)', 'oats (rolled)', 'yeast (active dry)', 'mayonnaise', 'water'
    ]
  };

  const units = {
    mass: ['g', 'kg', 'oz', 'lb'],
    volume: ['ml', 'l', 'cup', 'tbsp', 'tsp', 'fl oz']
  };

  const massConv = { g: 1, kg: 1000, oz: 28.3495, lb: 453.592 };
  const volConv = { ml: 1, l: 1000, 'fl oz': 29.5735, cup: 240, tbsp: 14.7868, tsp: 4.92892 };

  function populateIngredientSelect(sel) {
    if (!sel) return;
    sel.innerHTML = '';
    Object.entries(ingredientGroups).forEach(([group, list]) => {
      const og = document.createElement('optgroup');
      og.label = group;
      list.forEach(name => {
        const o = document.createElement('option');
        o.value = name;
        o.textContent = name;
        og.appendChild(o);
      });
      sel.appendChild(og);
    });
  }

  function populateUnitSelect(sel, type = 'mass') {
    if (!sel) return;
    sel.innerHTML = '';
    (units[type] || []).forEach(u => {
      const o = document.createElement('option');
      o.value = u;
      o.textContent = u;
      sel.appendChild(o);
    });
  }

  function convertMassToVolume(m, from, to, ingr) {
    const g = m * (massConv[from] || 1);
    const dens = densities[ingr] || 1;
    const ml = g / dens;
    return ml / (volConv[to] || 1);
  }

  function convertVolumeToMass(v, from, to, ingr) {
    const ml = v * (volConv[from] || 1);
    const dens = densities[ingr] || 1;
    const g = ml * dens;
    return g / (massConv[to] || 1);
  }

  return { populateIngredientSelect, populateUnitSelect, convertMassToVolume, convertVolumeToMass };
})();

/* Auto-populate selects */
(function kitchenPopulateUI() {
  const ingrSel = safeGet('#kitchenIngredient');
  const fromSel = safeGet('#kitchenFrom');
  const toSel = safeGet('#kitchenTo');
  if (ingrSel) Kitchen.populateIngredientSelect(ingrSel);
  if (fromSel) Kitchen.populateUnitSelect(fromSel, 'mass');
  if (toSel) Kitchen.populateUnitSelect(toSel, 'volume');
})();

/* Conversion event */
(function kitchenEvents() {
  const btn = safeGet('#kitchenConvertBtn') || safeGet('button[onclick="convertKitchen()"]');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const ingr = safeGet('#kitchenIngredient')?.value;
    const from = safeGet('#kitchenFrom')?.value;
    const to = safeGet('#kitchenTo')?.value;
    const val = parseFloat(safeGet('#kitchenInput')?.value || '0');
    const res = safeGet('#kitchenResult');

    if (!ingr || !from || !to || !val) {
      res.textContent = 'Please fill all fields.';
      return;
    }

    const mass = ['g', 'kg', 'oz', 'lb'];
    const vol = ['ml', 'l', 'cup', 'tbsp', 'tsp', 'fl oz'];
    let out;

    if (mass.includes(from) && vol.includes(to)) {
      out = Kitchen.convertMassToVolume(val, from, to, ingr);
    } else if (vol.includes(from) && mass.includes(to)) {
      out = Kitchen.convertVolumeToMass(val, from, to, ingr);
    } else {
      res.textContent = 'Unsupported conversion.';
      return;
    }

    res.textContent = `${formatNumber(out)} ${to} (approx)`;
  });
})();

/* ============================
   CONTAINER Volume Calculator
============================ */
(function containerVolumeUI() {
  const typeSel = safeGet('#containerType');
  if (!typeSel) return;

  const boxInputs = safeGet('#boxInputs');
  const cylInputs = safeGet('#cylinderInputs');

  function adjust() {
    if (typeSel.value === 'box') {
      boxInputs.style.display = 'block';
      cylInputs.style.display = 'none';
    } else {
      boxInputs.style.display = 'none';
      cylInputs.style.display = 'block';
    }
  }
  adjust();
  on(typeSel, 'change', adjust);

  const btn = safeGet('button[onclick="calculateContainerVolume()"]');
  on(btn, 'click', () => {
    const type = typeSel.value;
    let volume = 0;

    if (type === 'box') {
      const l = parseFloat($('#lengthBox')?.value || 0);
      const w = parseFloat($('#widthBox')?.value || 0);
      const h = parseFloat($('#heightBox')?.value || 0);
      volume = l * w * h;
    } else {
      const r = parseFloat($('#radiusCylinder')?.value || 0);
      const h = parseFloat($('#heightCylinder')?.value || 0);
      volume = Math.PI * r * r * h;
    }

    $('#containerResult').textContent = `${formatNumber(volume)} cubic cm`;
  });
})();

/* ============================
   CURRENCY Converter (free API)
============================ */
const Currency = (function () {
  const list = ['USD','EUR','GBP','JPY','CNY','INR','EGP','AUD','CAD','CHF','SGD','KWD','AED','SAR','TRY','BRL','RUB','MXN'];

  async function populateSelects(fromSel, toSel) {
    if (!fromSel || !toSel) return;
    fromSel.innerHTML = ''; toSel.innerHTML = '';
    list.forEach(c => {
      const o1 = new Option(c, c), o2 = new Option(c, c);
      fromSel.add(o1); toSel.add(o2);
    });
    fromSel.value = 'EGP'; toSel.value = 'USD';
  }

  async function getRate(from, to) {
    const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.result || data.info?.rate || 0;
  }

  return { populateSelects, getRate };
})();

(function currencyUI() {
  const from = $('#currencyFrom');
  const to = $('#currencyTo');
  const btn = $('#currencyConvertBtn');
  const amt = $('#currencyAmount');
  const res = $('#currencyResult');
  if (!from || !to || !btn || !amt || !res) return;

  Currency.populateSelects(from, to);
  on(btn, 'click', async () => {
    const a = parseFloat(amt.value);
    if (!a) { res.textContent = 'Enter amount'; return; }
    res.textContent = 'Fetching...';
    try {
      const rate = await Currency.getRate(from.value, to.value);
      const out = a * rate;
      res.textContent = `${formatNumber(out,8)} ${to.value} (rate: ${formatNumber(rate,8)})`;
    } catch {
      res.textContent = 'Error fetching rate.';
    }
  });
})();

/* ============================
   Final load reveal
============================ */
window.addEventListener('DOMContentLoaded', () => {
  const app = $('#app');
  const loader = $('#loading-screen');
  if (app) app.style.display = 'block';
  if (loader) loader.style.display = 'none';
  console.log('Convert Labs ready');
});
