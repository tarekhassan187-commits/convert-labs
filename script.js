/* ==============================================================
   Convert Labs – Unified Script
   Handles theme toggle, all converters, kitchen logic,
   tab switching, and safe page loading.
================================================================= */

/* ---------- Utilities ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const formatNumber = (n, digits = 6) =>
  Number.isFinite(n) ? parseFloat(n.toPrecision(digits)).toString() : String(n);

/* ==============================================================
   THEME TOGGLE (🌙 / ☀️)
================================================================= */
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

/* ==============================================================
   TAB SWITCHING
================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = $$(".tabs button");
  const converters = $$(".converter");

  window.showConverter = (tabId) => {
    converters.forEach((sec) => (sec.style.display = "none"));
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    const target = document.getElementById(tabId);
    const activeBtn = tabButtons.find((btn) => btn.getAttribute("onclick")?.includes(tabId));
    if (target) target.style.display = "block";
    if (activeBtn) activeBtn.classList.add("active");
  };

  // Default first tab active
  if (converters.length) {
    converters.forEach((c) => (c.style.display = "none"));
    converters[0].style.display = "block";
    tabButtons[0]?.classList.add("active");
  }
});

/* ==============================================================
   POPULATE DROPDOWNS (Length, Temp, Volume)
================================================================= */
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
});

/* ==============================================================
   CONVERTERS
================================================================= */

// ---------- Length ----------
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

// ---------- Temperature ----------
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

  let res;
  if (t.includes("C")) res = c;
  else if (t.includes("F")) res = c * (9 / 5) + 32;
  else res = c + 273.15;

  out.textContent = `${formatNumber(res)} ${t}`;
}

// ---------- Volume ----------
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
    tablespoon: 15,
    teaspoon: 5,
    "fluid ounce (fl oz)": 29.5735,
    "gallon (gal)": 3785.41,
    "pint (pt)": 473.176,
  };
  const res = (v * map[f]) / map[t];
  out.textContent = `${formatNumber(res)} ${t}`;
}

/* ==============================================================
   CONTAINER VOLUME CALCULATOR
================================================================= */
function calculateContainerVolume() {
  const type = $("#containerType")?.value;
  const liquid = $("#liquidType")?.value;
  const out = $("#containerResult");
  if (!type || !liquid) return;

  const densities = {
    water: 1.0,
    milk: 1.03,
    oil: 0.91,
    honey: 1.42,
  };

  let volumeCm3 = 0;
  if (type === "box") {
    const l = parseFloat($("#lengthBox")?.value || 0);
    const w = parseFloat($("#widthBox")?.value || 0);
    const h = parseFloat($("#heightBox")?.value || 0);
    volumeCm3 = l * w * h;
  } else {
    const r = parseFloat($("#radiusCylinder")?.value || 0);
    const h = parseFloat($("#heightCylinder")?.value || 0);
    volumeCm3 = Math.PI * r * r * h;
  }

  const density = liquid === "custom" ? parseFloat($("#customDensity")?.value || 1) : densities[liquid];
  const grams = volumeCm3 * density;
  const liters = volumeCm3 / 1000;

  out.textContent = `${formatNumber(volumeCm3)} cm³ = ${formatNumber(
    liters
  )} L ≈ ${formatNumber(grams)} g of ${liquid}`;
}

/* ==============================================================
   KITCHEN CONVERTER (FINAL FIXED VERSION)
================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const input = $("#kitchenInput");
  const fromSel = $("#kitchenFrom");
  const toSel = $("#kitchenTo");
  const ingredientSel = $("#kitchenIngredient");
  const result = $("#kitchenResult");

  if (!input || !fromSel || !toSel || !ingredientSel || !result) return;

  const unitToMl = { ml: 1, liter: 1000, cup: 240, tbsp: 15, tsp: 5 };
  const unitToGram = { g: 1, kg: 1000, oz: 28.3495, lb: 453.592 };

  const densities = {
    water: 1.0,
    "milk (whole)": 1.03,
    butter: 0.96,
    "olive oil": 0.91,
    honey: 1.42,
    "maple syrup": 1.33,
    "molasses": 1.45,
    "corn syrup": 1.36,
    "all-purpose flour": 0.53,
    "almond flour": 0.48,
    "coconut flour": 0.39,
    "granulated sugar": 0.85,
    "brown sugar packed": 0.95,
    "powdered sugar": 0.56,
    "salt (table)": 1.2,
    "baking powder": 0.93,
    "baking soda": 0.96,
    "cocoa powder": 0.64,
    cornstarch: 0.54,
    "cream cheese": 0.97,
    "yogurt (plain)": 1.03,
    "cheese (grated)": 0.53,
    "peanut butter": 1.05,
    "rice (uncooked)": 0.85,
    "oats (rolled)": 0.38,
    "yeast (active dry)": 0.45,
    mayonnaise: 0.95,
  };

  const units = [
    { value: "g", text: "Gram (g)" },
    { value: "kg", text: "Kilogram (kg)" },
    { value: "oz", text: "Ounce (oz)" },
    { value: "lb", text: "Pound (lb)" },
    { value: "ml", text: "Milliliter (ml)" },
    { value: "liter", text: "Liter (L)" },
    { value: "cup", text: "Cup" },
    { value: "tbsp", text: "Tablespoon (tbsp)" },
    { value: "tsp", text: "Teaspoon (tsp)" },
  ];

  if (!fromSel.options.length) {
    units.forEach((u) => {
      const opt1 = new Option(u.text, u.value);
      const opt2 = new Option(u.text, u.value);
      fromSel.add(opt1);
      toSel.add(opt2);
    });
    fromSel.value = "g";
    toSel.value = "cup";
  }

  window.convertKitchen = function () {
    const val = parseFloat(input.value);
    const from = fromSel.value;
    const to = toSel.value;
    const ingredient = ingredientSel.value;

    if (!val || !from || !to || !ingredient) {
      result.textContent = "Please fill all fields correctly.";
      return;
    }

    const density = densities[ingredient];
    if (!density) {
      result.textContent = "Density data not available for this ingredient.";
      return;
    }

    const isFromVol = from in unitToMl;
    const isToVol = to in unitToMl;
    const isFromMass = from in unitToGram;
    const isToMass = to in unitToGram;

    let grams = 0;
    if (isFromVol) grams = val * unitToMl[from] * density;
    else if (isFromMass) grams = val * unitToGram[from];
    else return (result.textContent = "Unsupported unit.");

    let output = 0;
    if (isToVol) output = grams / (density * unitToMl[to]);
    else if (isToMass) output = grams / unitToGram[to];
    else return (result.textContent = "Unsupported unit.");

    result.innerHTML = `<b>${val}</b> ${from} of <b>${ingredient}</b> = <b>${output.toFixed(
      2
    )}</b> ${to}`;
  };
});

/* ==============================================================
   SAFE PAGE LOADER (Never freeze)
================================================================= */
window.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  const loader = document.getElementById("loading-screen");
  if (app && loader) {
    app.style.display = "block";
    loader.style.display = "none";
  }
  console.log("✅ Convert Labs loaded safely.");
});

window.addEventListener("error", (e) => {
  console.warn("⚠️ JS Error:", e.message);
  const app = document.getElementById("app");
  const loader = document.getElementById("loading-screen");
  if (app && loader) {
    app.style.display = "block";
    loader.style.display = "none";
  }
});
