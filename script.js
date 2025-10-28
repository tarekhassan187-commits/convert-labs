/* ============================================================
   Convert Labs — Unified Script
   Handles: theme, header/footer, converters, tools, and UI
   ============================================================ */

/* ---------- Helper utilities ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
function safeGet(selector) { return document.querySelector(selector) || null; }
function formatNumber(n, digits = 6) {
  if (Number.isFinite(n)) return parseFloat(n.toPrecision(digits)).toString();
  return String(n);
}

/* ---------- Theme toggle (Dark/Light) ---------- */
(function themeSetup() {
  const KEY = 'cl_theme';
  const root = document.documentElement;
  const btn = safeGet('#themeToggle');
  function applyTheme(t) {
    if (t === 'dark') {
      root.classList.add('dark'); root.classList.remove('light');
      if (btn) btn.textContent = '☀️';
    } else {
      root.classList.remove('dark'); root.classList.add('light');
      if (btn) btn.textContent = '🌙';
    }
  }
  let saved = localStorage.getItem(KEY) || 'light';
  applyTheme(saved);
  if (btn) btn.addEventListener('click', () => {
    saved = (saved === 'light') ? 'dark' : 'light';
    localStorage.setItem(KEY, saved); applyTheme(saved);
  });
})();

/* ---------- Header / Footer visuals ---------- */
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
})();

/* ---------- Contact Button styling ---------- */
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

/* ============================================================
   TAB SWITCHING — showConverter
   Handles homepage converter tabs
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".tabs button");
  const converters = document.querySelectorAll(".converter");

  function showConverter(tabId) {
    converters.forEach(sec => { sec.style.display = "none"; sec.classList.remove("active"); });
    tabButtons.forEach(btn => btn.classList.remove("active"));
    const target = document.getElementById(tabId);
    if (target) { target.style.display = "block"; target.classList.add("active"); }
    const activeBtn = [...tabButtons].find(btn => btn.getAttribute("onclick") === `showConverter('${tabId}')`);
    if (activeBtn) activeBtn.classList.add("active");
  }
  window.showConverter = showConverter;

  // Default open first converter
  if (converters.length > 0) {
    converters.forEach(c => (c.style.display = "none"));
    converters[0].style.display = "block";
    tabButtons[0].classList.add("active");
  }
});

/* ============================================================
   POPULATE DROPDOWNS — Length, Temperature, Volume, Kitchen
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  // --- Length ---
  const lengthUnits = ["meter (m)", "centimeter (cm)", "millimeter (mm)", "kilometer (km)", "inch (in)", "foot (ft)", "yard (yd)", "mile (mi)"];
  const lengthFrom = $("#lengthFrom"), lengthTo = $("#lengthTo");
  if (lengthFrom && lengthTo) {
    lengthUnits.forEach(u => { lengthFrom.add(new Option(u, u)); lengthTo.add(new Option(u, u)); });
  }

  // --- Temperature ---
  const tempUnits = ["Celsius (°C)", "Fahrenheit (°F)", "Kelvin (K)"];
  const tempFrom = $("#tempFrom"), tempTo = $("#tempTo");
  if (tempFrom && tempTo) {
    tempUnits.forEach(u => { tempFrom.add(new Option(u, u)); tempTo.add(new Option(u, u)); });
  }

  // --- Volume ---
  const volumeUnits = ["milliliter (ml)", "liter (l)", "cup", "tablespoon (tbsp)", "teaspoon (tsp)", "fluid ounce (fl oz)", "gallon (gal)", "pint (pt)"];
  const volumeFrom = $("#volumeFrom"), volumeTo = $("#volumeTo");
  if (volumeFrom && volumeTo) {
    volumeUnits.forEach(u => { volumeFrom.add(new Option(u, u)); volumeTo.add(new Option(u, u)); });
  }

   // --- Kitchen unit list fix (added g and ml) ---
  const kitchenFrom = $("#kitchenFrom"), kitchenTo = $("#kitchenTo");
  if (kitchenFrom && kitchenTo) {
    const list = ["g", "ml", "cup", "tbsp", "tsp", "fl oz"];
    list.forEach(u => {
      if (![...kitchenFrom.options].some(o => o.value === u))
        kitchenFrom.add(new Option(u, u));
      if (![...kitchenTo.options].some(o => o.value === u))
        kitchenTo.add(new Option(u, u));
    });
  }


/* ============================================================
   CONVERTER FUNCTIONS
   ============================================================ */

// --- Length Converter ---
function convertLength() {
  const input = parseFloat($("#lengthInput")?.value || 0);
  const from = $("#lengthFrom")?.value;
  const to = $("#lengthTo")?.value;
  const resultEl = $("#lengthResult");
  if (!input || !from || !to) return resultEl.textContent = "Please fill all fields.";
  const toMeters = {
    "millimeter (mm)": 0.001, "centimeter (cm)": 0.01, "meter (m)": 1, "kilometer (km)": 1000,
    "inch (in)": 0.0254, "foot (ft)": 0.3048, "yard (yd)": 0.9144, "mile (mi)": 1609.34
  };
  const meters = input * toMeters[from];
  const result = meters / toMeters[to];
  resultEl.textContent = `${formatNumber(result)} ${to}`;
}

// --- Temperature Converter ---
function convertTemperature() {
  const input = parseFloat($("#tempInput")?.value || 0);
  const from = $("#tempFrom")?.value;
  const to = $("#tempTo")?.value;
  const resultEl = $("#tempResult");
  if (!input || !from || !to) return resultEl.textContent = "Please fill all fields.";
  let celsius;
  if (from.includes("Celsius")) celsius = input;
  else if (from.includes("Fahrenheit")) celsius = (input - 32) * 5 / 9;
  else if (from.includes("Kelvin")) celsius = input - 273.15;
  let result;
  if (to.includes("Celsius")) result = celsius;
  else if (to.includes("Fahrenheit")) result = celsius * 9 / 5 + 32;
  else if (to.includes("Kelvin")) result = celsius + 273.15;
  resultEl.textContent = `${formatNumber(result)} ${to}`;
}

// --- Volume Converter ---
function convertVolume() {
  const input = parseFloat($("#volumeInput")?.value || 0);
  const from = $("#volumeFrom")?.value;
  const to = $("#volumeTo")?.value;
  const resultEl = $("#volumeResult");
  if (!input || !from || !to) return resultEl.textContent = "Please fill all fields.";
  const toML = {
    "milliliter (ml)": 1, "liter (l)": 1000, "cup": 240,
    "tablespoon (tbsp)": 14.7868, "teaspoon (tsp)": 4.92892,
    "fluid ounce (fl oz)": 29.5735, "gallon (gal)": 3785.41, "pint (pt)": 473.176
  };
  const ml = input * toML[from];
  const result = ml / toML[to];
  resultEl.textContent = `${formatNumber(result)} ${to}`;
}

/* ============================================================
   CONTAINER VOLUME CALCULATOR
   ============================================================ */
(function containerVolumeUI() {
  const typeSel = $("#containerType");
  const boxInputs = $("#boxInputs");
  const cylInputs = $("#cylinderInputs");
  const calcBtn = $("#containerCalcBtn") || $("button[onclick='calculateContainerVolume()']");
  const resultEl = $("#containerResult");
  if (!typeSel || !calcBtn || !resultEl) return;

  function toggleInputs() {
    if (typeSel.value === "box") {
      boxInputs.style.display = "block"; cylInputs.style.display = "none";
    } else {
      boxInputs.style.display = "none"; cylInputs.style.display = "block";
    }
  }
  typeSel.addEventListener("change", toggleInputs);
  toggleInputs();

  calcBtn.addEventListener("click", () => {
    let volumeCM3 = 0;
    if (typeSel.value === "box") {
      const l = parseFloat($("#lengthBox")?.value || 0);
      const w = parseFloat($("#widthBox")?.value || 0);
      const h = parseFloat($("#heightBox")?.value || 0);
      volumeCM3 = l * w * h;
    } else {
      const r = parseFloat($("#radiusCylinder")?.value || 0);
      const h = parseFloat($("#heightCylinder")?.value || 0);
      volumeCM3 = Math.PI * r * r * h;
    }
    const liters = volumeCM3 / 1000;
    const cubicMeters = volumeCM3 / 1_000_000;
    resultEl.textContent = `${formatNumber(volumeCM3)} cm³  |  ${formatNumber(liters)} L  |  ${formatNumber(cubicMeters)} m³`;
  });
})();

/* ============================================================
   PAGE LOAD DISPLAY FIX (hide loading screen)
   ============================================================ */
window.addEventListener("load", () => {
  const app = $("#app"), loading = $("#loading-screen");
  if (app && loading) {
    loading.style.display = "none";
    app.style.display = "block";
  }
  console.log("Convert Labs ready");
});

