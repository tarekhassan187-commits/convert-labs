/* script.js - Convert Labs
   Full client-side logic for theme, header/footer behavior,
   kitchen ingredient conversion lists, container volume UI,
   currency converter, and small helpers.

   Note: For paid APIs (CloudConvert etc.) place keys in the
   designated placeholder below or, better, store keys server-side.
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

function debounce(fn, wait = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function formatNumber(n, digits = 6) {
  if (Number.isFinite(n)) {
    return parseFloat(n.toPrecision(digits)).toString();
  }
  return String(n);
}

/* ============================
   THEME: dark/light toggle
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
    }, {passive:true});
  }
})();

/* ============================
   HEADER / FOOTER alignment fixes
   ensures logo + "Convert Labs" side-by-side
   and makes icons a standard size across pages.
   ============================ */
(function headerFooterFixes() {
  const logoSelectors = ['.logo', '.footer-logo'];
  logoSelectors.forEach(sel => {
    const img = safeGet(sel);
    if (img) {
      img.style.width = '44px';      // consistent size
      img.style.height = '44px';
      img.style.objectFit = 'contain';
      img.style.verticalAlign = 'middle';
    }
  });

  // Ensure .brand-text and .brand (if present) align horizontally
  const brand = safeGet('.brand');
  if (brand) {
    brand.style.display = 'inline-flex';
    brand.style.alignItems = 'center';
    brand.style.gap = '10px';
    brand.style.textDecoration = 'none';
  }
  const footerBrand = safeGet('.footer-content');
  if (footerBrand) {
    footerBrand.style.display = 'flex';
    footerBrand.style.alignItems = 'center';
    footerBrand.style.justifyContent = 'center';
    footerBrand.style.gap = '10px';
  }
})();

/* ============================
   CONTACT button minor tweak
   ============================ */
(function contactButton() {
  const btn = safeGet('.header-btn') || safeGet('#contactBtn');
  if (btn) {
    btn.style.padding = '8px 12px';
    btn.style.borderRadius = '8px';
    btn.style.background = '#fff';
    btn.style.color = '#1e40af';
    btn.style.border = '1px solid rgba(0,0,0,0.06)';
  }
})();

/* ============================
   KITCHEN ingredient data + unit lists
   - long grouped list included
   - two converters: volume <-> mass based on ingredient approximate density
   ============================ */
const Kitchen = (function kitchenModule(){
  // Densities in g/ml (approx typical)
  const densities = {
    'all-purpose flour': 0.53, // g/ml (rough bulk density); 1 cup ~ 125g
    'sugar (granulated)': 0.85, // 1 cup ~ 200g
    'brown sugar packed': 0.95,
    'butter': 0.96, // 1 cup ~ 227 g
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
    // add more as you need...
  };

  // Grouped ingredient names long list (non-duplicated)
  const ingredientGroups = {
    'Baking staples': [
      'all-purpose flour', 'bread flour', 'cake flour', 'baking powder', 'baking soda', 'salt (table)',
      'granulated sugar', 'brown sugar packed', 'powdered sugar', 'cocoa powder', 'cornstarch'
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

  // Units we support on the UI
  const units = {
    mass: ['g', 'kg', 'oz', 'lb'],
    volume: ['ml', 'l', 'cup', 'tbsp', 'tsp', 'fl oz']
  };

  // conversions
  const massConversions = {
    g: 1,
    kg: 1000,
    oz: 28.3495231,
    lb: 453.59237
  };
  const volumeConversions_ml = {
    ml: 1,
    l: 1000,
    'fl oz': 29.5735,
    cup: 240,    // US cup
    tbsp: 14.7868,
    tsp: 4.92892
  };

  function populateIngredientSelect(selElement) {
    if (!selElement) return;
    selElement.innerHTML = '';
    Object.keys(ingredientGroups).forEach(group => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = group;
      ingredientGroups[group].forEach(name => {
        const o = document.createElement('option');
        o.value = name;
        o.textContent = name;
        optgroup.appendChild(o);
      });
      selElement.appendChild(optgroup);
    });
  }

  function populateUnitSelect(sel, type = 'mass') {
    if (!sel) return;
    sel.innerHTML = '';
    const list = units[type] || [];
    list.forEach(u => {
      const o = document.createElement('option');
      o.value = u;
      o.textContent = u;
      sel.appendChild(o);
    });
  }

  // mass <-> volume conversions for ingredient (using density)
  // mass -> volume: vol_ml = mass_g / density (g/ml)
  function convertMassToVolume(mass, massUnit, targetVolumeUnit, ingredient) {
    const mass_g = mass * (massConversions[massUnit] || 1);
    const dens = densities[ingredient] || 1.0; // fallback density=1 (water)
    const ml = mass_g / dens;
    const toMultiplier = (volumeConversions_ml[targetVolumeUnit] || 1);
    return ml / toMultiplier;
  }
  // volume -> mass: mass_g = (volume_ml) * density (g/ml)
  function convertVolumeToMass(vol, volUnit, targetMassUnit, ingredient) {
    const ml = vol * (volumeConversions_ml[volUnit] || 1);
    const dens = densities[ingredient] || 1.0;
    const g = ml * dens;
    const toUnit = (massConversions[targetMassUnit] || 1);
    return g / toUnit;
  }

  return {
    populateIngredientSelect,
    populateUnitSelect,
    convertMassToVolume,
    convertVolumeToMass,
    densities,
    ingredientGroups
  };
})();

/* Auto-populate kitchen selects if present on the page */
(function kitchenPopulateUI() {
  const ingredientSel = safeGet('#kitchenIngredient');
  const fromUnitSel = safeGet('#kitchenFromUnit');
  const toUnitSel = safeGet('#kitchenToUnit');
  if (ingredientSel) Kitchen.populateIngredientSelect(ingredientSel);
  // We'll provide both mass and volume lists for both selects and let the user choose
  if (fromUnitSel) Kitchen.populateUnitSelect(fromUnitSel, 'mass');
  if (toUnitSel) Kitchen.populateUnitSelect(toUnitSel, 'volume');
  // If the page uses different selects add logic or call this later
})();

/* Small event-driven kitchen converter (works if elements exist) */
(function kitchenEvents() {
  const btn = safeGet('#kitchenConvertBtn');
  if (!btn) return;
  on(btn, 'click', () => {
    const ingredient = safeGet('#kitchenIngredient')?.value;
    const fromUnit = safeGet('#kitchenFromUnit')?.value;
    const toUnit = safeGet('#kitchenToUnit')?.value;
    const value = parseFloat(safeGet('#kitchenValue')?.value || '0');
    if (!ingredient || !fromUnit || !toUnit || !value) {
      safeGet('#kitchenResult').textContent = 'Please fill all fields';
      return;
    }

    // decide whether converting mass->volume or volume->mass
    const massList = ['g','kg','oz','lb'];
    const volumeList = ['ml','l','cup','tbsp','tsp','fl oz'];
    let out;
    if (massList.includes(fromUnit) && volumeList.includes(toUnit)) {
      out = Kitchen.convertMassToVolume(value, fromUnit, toUnit, ingredient);
      safeGet('#kitchenResult').textContent = `${formatNumber(out)} ${toUnit} (approx)`;
    } else if (volumeList.includes(fromUnit) && massList.includes(toUnit)) {
      out = Kitchen.convertVolumeToMass(value, fromUnit, toUnit, ingredient);
      safeGet('#kitchenResult').textContent = `${formatNumber(out)} ${toUnit} (approx)`;
    } else if (massList.includes(fromUnit) && massList.includes(toUnit)) {
      // simple mass conversion
      const grams = value * (massConversionsSafe(fromUnit));
      const target = grams / (massConversionsSafe(toUnit));
      safeGet('#kitchenResult').textContent = `${formatNumber(target)} ${toUnit}`;
    } else if (volumeList.includes(fromUnit) && volumeList.includes(toUnit)) {
      const ml = value * (volumeConversions_ml_safe(fromUnit));
      const target = ml / (volumeConversions_ml_safe(toUnit));
      safeGet('#kitchenResult').textContent = `${formatNumber(target)} ${toUnit}`;
    } else {
      safeGet('#kitchenResult').textContent = 'Unsupported conversion';
    }
  });

  function massConversionsSafe(u) {
    const table = { g:1, kg:1000, oz:28.3495231, lb:453.59237 };
    return table[u] || 1;
  }
  function volumeConversions_ml_safe(u) {
    const table = { ml:1, l:1000, 'fl oz':29.5735, cup:240, tbsp:14.7868, tsp:4.92892 };
    return table[u] || 1;
  }
})();

/* ============================
   Container Volume UI
   - show box fields or cylinder fields
   ============================ */
(function containerVolumeUI() {
  const typeSel = safeGet('#containerType');
  if (!typeSel) return;
  const boxFields = safeGet('#boxFields');
  const cylFields = safeGet('#cylFields');

  function adjustUI() {
    const v = typeSel.value;
    if (v === 'box') {
      if (boxFields) boxFields.style.display = 'block';
      if (cylFields) cylFields.style.display = 'none';
    } else {
      if (boxFields) boxFields.style.display = 'none';
      if (cylFields) cylFields.style.display = 'block';
    }
  }
  adjustUI();
  on(typeSel, 'change', adjustUI);

  // Container volume calculation if button exists
  const calcBtn = safeGet('#containerCalcBtn');
  if (!calcBtn) return;
  on(calcBtn, 'click', () => {
    const t = typeSel.value;
    if (t === 'box') {
      const l = parseFloat(safeGet('#boxLength')?.value || 0);
      const w = parseFloat(safeGet('#boxWidth')?.value || 0);
      const h = parseFloat(safeGet('#boxHeight')?.value || 0);
      const vol = l * w * h; // assume same unit
      safeGet('#containerResult').textContent = `${formatNumber(vol)} cubic units`;
    } else {
      const r = parseFloat(safeGet('#cylRadius')?.value || 0);
      const h = parseFloat(safeGet('#cylHeight')?.value || 0);
      const vol = Math.PI * r * r * h;
      safeGet('#containerResult').textContent = `${formatNumber(vol)} cubic units`;
    }
  });
})();

/* ============================
   CURRENCY converter
   - populates currency selects with a comprehensive list including SGD, KWD, AED
   - fetches exchange rates from exchangerate.host (free) with fallback.
   ============================ */
const Currency = (function currencyModule(){
  // curated list (add currencies you need)
  const currencyList = [
    'USD','EUR','GBP','JPY','CNY','INR','EGP','AUD','CAD','CHF','SGD','KWD','AED','SAR','TRY','BRL','RUB','MXN'
  ];

  async function populateSelects(fromSel, toSel) {
    if (!fromSel || !toSel) return;
    fromSel.innerHTML = ''; toSel.innerHTML = '';
    currencyList.forEach(code => {
      const o1 = document.createElement('option'); o1.value = code; o1.textContent = code;
      const o2 = o1.cloneNode(true);
      fromSel.appendChild(o1); toSel.appendChild(o2);
    });
    // sensible defaults
    fromSel.value = 'EGP' in currencyList ? 'EGP' : 'USD';
    toSel.value = 'USD';
  }

  async function getRate(from, to) {
    // use exchangerate.host (free endpoint)
    const url = `https://api.exchangerate.host/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error('rate fetch failed');
      const j = await r.json();
      if (j && j.result) return j.result;
      if (j && j.info && j.info.rate) return j.info.rate;
      throw new Error('unexpected response');
    } catch (err) {
      console.warn('Currency fetch error', err);
      throw err;
    }
  }

  return { populateSelects, getRate };
})();

/* Auto-run currency UI population if present */
(function currencyPopulateUI(){
  const from = safeGet('#currencyFrom');
  const to = safeGet('#currencyTo');
  const btn = safeGet('#currencyConvertBtn');
  const amountInput = safeGet('#currencyAmount');
  const resultEl = safeGet('#currencyResult');

  if (!from || !to || !btn || !amountInput || !resultEl) return;

  Currency.populateSelects(from, to);

  btn.addEventListener('click', async () => {
    const a = parseFloat(amountInput.value || '0');
    if (!a) { resultEl.textContent = 'Enter amount'; return; }
    resultEl.textContent = 'Fetching rate…';
    try {
      const rate = await Currency.getRate(from.value, to.value);
      const out = a * rate;
      resultEl.textContent = `${formatNumber(out,8)} ${to.value} (rate: ${formatNumber(rate,8)})`;
    } catch (err) {
      resultEl.textContent = 'Unable to fetch rate. Try again later.';
    }
  });
})();

/* ============================
   IMAGE UPSCALER & OTHER TOOL hooks
   (The image-upscaler page has its own script that uses Upscaler lib).
   Keep minimal helpers here so pages won't error when referencing missing variables.
   ============================ */
/* CloudConvert / Paid APIs:
   If you want to enable CloudConvert file conversions client-side (not recommended for security),
   set CLOUDCONVERT_API_TOKEN below and uncomment relevant usages in your pages.
*/
const CLOUDCONVERT_API_TOKEN = null; // <-- Place token here only if you understand the security risk

/* ============================
   Misc / pagesafe guards
   - Avoid "visitorCount is not defined" or other console errors when optional pages
   - Example: simple visits counter stub (no remote call)
   ============================ */
(function visitsStub(){
  // If page expects visitorCount var/function, provide safe stub
  if (typeof window.visitorCount === 'undefined') {
    window.visitorCount = function() {
      return Promise.resolve({visits: 0});
    };
  }
})();

/* ============================
   Page load tidy up & debug
   ============================ */
window.addEventListener('load', () => {
  // small layout corrections for pages that used inline main width
  const mains = $$('main');
  mains.forEach(m => {
    // If page sets main inline style that's too narrow or not centered, ensure consistent
    m.style.maxWidth = m.style.maxWidth || '980px';
    m.style.margin = m.style.margin || 'auto';
  });

  // Ensure footer text color white in header area
  const footer = safeGet('footer');
  if (footer) {
    footer.style.color = footer.style.color || '#fff';
  }

  // Hide debug console warnings if needed (no-op)
  console.log('script.js loaded - page:', location.pathname);
});

// Show main app after DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("app").style.display = "block";
  document.getElementById("loading-screen").style.display = "none";
});
