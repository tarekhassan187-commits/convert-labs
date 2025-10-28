/* ============================================================
   Convert Labs – Unified Script
   Handles theme toggle, header/footer styling, all converters,
   kitchen logic (mass↔volume), and responsive UI.
   ============================================================ */

/* ---------- Utilities ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const formatNumber = (n, digits = 6) =>
  Number.isFinite(n) ? parseFloat(n.toPrecision(digits)).toString() : String(n);

/* ============================================================
   THEME TOGGLE (☀️ / 🌙) with smooth transition
   ============================================================ */
(function themeSetup() {
  const KEY = "cl_theme";
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");

  function applyTheme(t) {
    root.classList.add("theme-transition");
    setTimeout(() => root.classList.remove("theme-transition"), 400);

    if (t === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      if (btn) btn.textContent = "☀️";
      localStorage.setItem(KEY, "dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      if (btn) btn.textContent = "🌙";
      localStorage.setItem(KEY, "light");
    }
  }

  const saved = localStorage.getItem(KEY) || "light";
  applyTheme(saved);

  if (btn) {
    btn.addEventListener("click", () => {
      const newTheme = root.classList.contains("dark") ? "light" : "dark";
      applyTheme(newTheme);
    });
  }
})();

/* ============================================================
   TAB SWITCHING – showConverter()
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".tabs button");
  const converters = document.querySelectorAll(".converter");

  function showConverter(tabId) {
    converters.forEach((sec) => (sec.style.display = "none"));
    tabButtons.forEach((btn) => btn.classList.remove("active"));

    const target = document.getElementById(tabId);
    if (target) target.style.display = "block";
    const activeBtn = [...tabButtons].find((btn) =>
      btn.getAttribute("onclick")?.includes(tabId)
    );
    if (activeBtn) activeBtn.classList.add("active");
  }

  window.showConverter = showConverter;
  if (converters.length > 0) {
    converters.forEach((c) => (c.style.display = "none"));
    converters[0].style.display = "block";
    tabButtons[0].classList.add("active");
  }
});

/* ============================================================
   POPULATE DROPDOWNS (Length, Temp, Volume, Kitchen)
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  // Length
  const lengthUnits = [
    "millimeter (mm)",
    "centimeter (cm)",
    "meter (m)",
    "kilometer (km)",
    "inch (in)",
    "foot (ft)",
    "yard (yd)",
    "mile (mi)",
  ];
  const lengthFrom = $("#lengthFrom"),
    lengthTo = $("#lengthTo");
  if (lengthFrom && lengthTo)
    lengthUnits.forEach((u) => {
      lengthFrom.add(new Option(u, u));
      lengthTo.add(new Option(u, u));
    });

  // Temperature
  const tempUnits = ["Celsius (°C)", "Fahrenheit (°F)", "Kelvin (K)"];
  const tempFrom = $("#tempFrom"),
    tempTo = $("#tempTo");
  if (tempFrom && tempTo)
    tempUnits.forEach((u) => {
      tempFrom.add(new Option(u, u));
      tempTo.add(new Option(u, u));
    });

  // Volume
  const volumeUnits = [
    "milliliter (ml)",
    "liter (L)",
    "cup",
    "tablespoon (tbsp)",
    "teaspoon (tsp)",
    "fluid ounce (fl oz)",
    "gallon (gal)",
    "pint (pt)",
  ];
  const volumeFrom = $("#volumeFrom"),
    volumeTo = $("#volumeTo");
  if (volumeFrom && volumeTo)
    volumeUnits.forEach((u) => {
      volumeFrom.add(new Option(u, u));
      volumeTo.add(new Option(u, u));
    });

  // Kitchen
  const kitchenFrom = $("#kitchenFrom"),
    kitchenTo = $("#kitchenTo");
  if (kitchenFrom && kitchenTo) {
    const kitchenUnits = [
      "g",
      "kg",
      "oz",
      "lb",
      "ml",
      "L",
      "cup",
      "tbsp",
      "tsp",
      "fl oz",
    ];
    kitchenFrom.innerHTML = "";
    kitchenTo.innerHTML = "";
    kitchenUnits.forEach((u) => {
      kitchenFrom.add(new Option(u, u));
      kitchenTo.add(new Option(u, u));
    });
  }
});

/* ============================================================
   CONVERTERS
   ============================================================ */

// Length
function convertLength() {
  const v = parseFloat($("#lengthInput")?.value || 0);
  const f = $("#lengthFrom")?.value;
  const t = $("#lengthTo")?.value;
  const out = $("#lengthResult");
  if (!v || !f || !t) return (out.textContent = "Please fill all fields.");

  const map = {
    "millimeter (mm)": 0.001,
    "centimeter (cm)": 0.01,
    "meter (m)": 1,
    "kilometer (km)": 1000,
    "inch (in)": 0.0254,
    "foot (ft)": 0.3048,
    "yard (yd)": 0.9144,
    "mile (mi)": 1609.34,
  };
  const res = (v * map[f]) / map[t];
  out.textContent = `${formatNumber(res)} ${t}`;
}

// Temperature
function convertTemperature() {
  const v = parseFloat($("#tempInput")?.value || 0);
  const f = $("#tempFrom")?.value;
  const t = $("#tempTo")?.value;
  const out = $("#tempResult");
  if (!v || !f || !t) return (out.textContent = "Please fill all fields.");

  let c;
  if (f.includes("C")) c = v;
  else if (f.includes("F")) c = (v - 32) * (5 / 9);
  else c = v - 273.15;
  let r;
  if (t.includes("C")) r = c;
  else if (t.includes("F")) r = c * (9 / 5) + 32;
  else r = c + 273.15;
  out.textContent = `${formatNumber(r)} ${t}`;
}

// Volume
function convertVolume() {
  const v = parseFloat($("#volumeInput")?.value || 0);
  const f = $("#volumeFrom")?.value;
  const t = $("#volumeTo")?.value;
  const out = $("#volumeResult");
  if (!v || !f || !t) return (out.textContent = "Please fill all fields.");

  const map = {
    "milliliter (ml)": 1,
    "liter (L)": 1000,
    cup: 240,
    tbsp: 14.7868,
    tsp: 4.92892,
    "fl oz": 29.5735,
    "pint (pt)": 473.176,
    "gallon (gal)": 3785.41,
  };
  const res = (v * map[f]) / map[t];
  out.textContent = `${formatNumber(res)} ${t}`;
}

/* ============================================================
   KITCHEN CONVERTER — Mass ↔ Volume using densities
   ============================================================ */
function convertKitchen() {
  const val = parseFloat($("#kitchenInput")?.value || 0);
  const from = $("#kitchenFrom")?.value;
  const to = $("#kitchenTo")?.value;
  const ing = $("#kitchenIngredient")?.value || "water";
  const out = $("#kitchenResult");

  if (!val || !from || !to) {
    out.textContent = "Please fill all fields.";
    return;
  }

  // Supported conversions
  const massMap = { g: 1, kg: 1000, oz: 28.3495, lb: 453.592 };
  const volMap = { ml: 1, L: 1000, cup: 240, tbsp: 14.7868, tsp: 4.92892, "fl oz": 29.5735 };

  const densities = {
    water: 1.0,
    milk: 1.03,
    oil: 0.92,
    honey: 1.42,
    butter: 0.96,
    flour: 0.53,
    sugar: 0.85,
    salt: 1.2,
    "brown sugar": 0.95,
  };
  const d = densities[ing.toLowerCase()] || 1.0;

  const massUnits = Object.keys(massMap);
  const volUnits = Object.keys(volMap);

  let result;

  if (massUnits.includes(from) && volUnits.includes(to)) {
    const g = val * massMap[from];
    const ml = g / d;
    result = ml / volMap[to];
  } else if (volUnits.includes(from) && massUnits.includes(to)) {
    const ml = val * volMap[from];
    const g = ml * d;
    result = g / massMap[to];
  } else if (massUnits.includes(from) && massUnits.includes(to)) {
    const g = val * massMap[from];
    result = g / massMap[to];
  } else if (volUnits.includes(from) && volUnits.includes(to)) {
    const ml = val * volMap[from];
    result = ml / volMap[to];
  } else {
    result = val;
  }

  out.textContent = `${formatNumber(result)} ${to}`;
}

/* ============================================================
   CONTAINER VOLUME CALCULATOR
   ============================================================ */
(function containerVolumeUI() {
  const typeSel = $("#containerType");
  const boxInputs = $("#boxInputs");
  const cylInputs = $("#cylinderInputs");
  const resultEl = $("#containerResult");
  if (!typeSel || !resultEl) return;

  function toggleInputs() {
    if (typeSel.value === "box") {
      boxInputs.style.display = "block";
      cylInputs.style.display = "none";
    } else {
      boxInputs.style.display = "none";
      cylInputs.style.display = "block";
    }
  }
  typeSel.addEventListener("change", toggleInputs);
  toggleInputs();

  window.calculateContainerVolume = () => {
    let volume = 0;
    if (typeSel.value === "box") {
      const l = parseFloat($("#lengthBox").value || 0);
      const w = parseFloat($("#widthBox").value || 0);
      const h = parseFloat($("#heightBox").value || 0);
      volume = l * w * h;
    } else {
      const r = parseFloat($("#radiusCylinder").value || 0);
      const h = parseFloat($("#heightCylinder").value || 0);
      volume = Math.PI * r * r * h;
    }
    const liters = volume / 1000;
    resultEl.textContent = `${formatNumber(volume)} cm³ | ${formatNumber(liters)} L`;
  };
})();

/* ============================================================
   PAGE READY
   ============================================================ */
// 🛡️ Safe startup wrapper to prevent early crash
window.addEventListener("error", (e) => {
  console.error("Runtime error caught:", e.message);
  const app = document.getElementById("app");
  const loading = document.getElementById("loading-screen");
  if (app && loading) {
    loading.style.display = "none";
    app.style.display = "block";
  }
});

window.addEventListener("load", () => {
  const app = $("#app"),
    loading = $("#loading-screen");
  if (app && loading) {
    loading.style.display = "none";
    app.style.display = "block";
  }
  console.log("Convert Labs ready ✔️");
});

