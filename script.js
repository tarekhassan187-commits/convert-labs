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

 // ============================
// KITCHEN CONVERTER (SAFE VERSION)
// ============================
document.addEventListener("DOMContentLoaded", () => {
  const kitchenInput = document.getElementById("kitchenInput");
  const kitchenFrom = document.getElementById("kitchenFrom");
  const kitchenTo = document.getElementById("kitchenTo");
  const kitchenIngredient = document.getElementById("kitchenIngredient");
  const kitchenResult = document.getElementById("kitchenResult");
  const kitchenBtn = document.querySelector("button[onclick='convertKitchen()']");

  if (!kitchenInput || !kitchenFrom || !kitchenTo || !kitchenIngredient || !kitchenResult || !kitchenBtn) {
    console.warn("Kitchen converter elements not found — skipping initialization.");
    return;
  }

  const unitToMl = {
    ml: 1,
    liter: 1000,
    cup: 240,
    tbsp: 15,
    tsp: 5,
  };

  const unitToGram = {
    g: 1,
    kg: 1000,
    oz: 28.3495,
    lb: 453.592,
  };

  const densities = {
    "water": 1.00,
    "milk (whole)": 1.03,
    "butter": 0.96,
    "olive oil": 0.91,
    "honey": 1.42,
    "maple syrup": 1.33,
    "molasses": 1.45,
    "corn syrup": 1.36,
    "all-purpose flour": 0.53,
    "almond flour": 0.48,
    "coconut flour": 0.39,
    "granulated sugar": 0.85,
    "brown sugar packed": 0.95,
    "powdered sugar": 0.56,
    "salt (table)": 1.20,
    "baking powder": 0.93,
    "baking soda": 0.96,
    "cocoa powder": 0.64,
    "cornstarch": 0.54,
    "cream cheese": 0.97,
    "yogurt (plain)": 1.03,
    "cheese (grated)": 0.53,
    "peanut butter": 1.05,
    "rice (uncooked)": 0.85,
    "oats (rolled)": 0.38,
    "yeast (active dry)": 0.45,
    "mayonnaise": 0.95
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

  // Populate dropdowns only if empty
  if (!kitchenFrom.options.length) {
    units.forEach(u => {
      const opt1 = document.createElement("option");
      opt1.value = u.value;
      opt1.textContent = u.text;
      const opt2 = opt1.cloneNode(true);
      kitchenFrom.appendChild(opt1);
      kitchenTo.appendChild(opt2);
    });
    kitchenFrom.value = "g";
    kitchenTo.value = "cup";
  }

  window.convertKitchen = function() {
    const input = parseFloat(kitchenInput.value);
    const from = kitchenFrom.value;
    const to = kitchenTo.value;
    const ingredient = kitchenIngredient.value;

    if (!input || !from || !to || !ingredient) {
      kitchenResult.textContent = "Please fill all fields correctly.";
      return;
    }

    const density = densities[ingredient];
    if (!density) {
      kitchenResult.textContent = "Density data not available for this ingredient.";
      return;
    }

    let inGrams = 0, outValue = 0;

    const isFromVolume = unitToMl[from] !== undefined;
    const isToVolume = unitToMl[to] !== undefined;
    const isFromMass = unitToGram[from] !== undefined;
    const isToMass = unitToGram[to] !== undefined;

    // From → grams
    if (isFromVolume) {
      const ml = input * unitToMl[from];
      inGrams = ml * density;
    } else if (isFromMass) {
      inGrams = input * unitToGram[from];
    } else {
      kitchenResult.textContent = "Unsupported 'from' unit.";
      return;
    }

    // grams → To
    if (isToVolume) {
      const ml = inGrams / density;
      outValue = ml / unitToMl[to];
    } else if (isToMass) {
      outValue = inGrams / unitToGram[to];
    } else {
      kitchenResult.textContent = "Unsupported 'to' unit.";
      return;
    }

    kitchenResult.innerHTML = `
      <b>${input}</b> ${from} of <b>${ingredient}</b> =
      <b>${outValue.toFixed(2)}</b> ${to}
    `;
  };
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

// ============================
// PAGE LOADER (Always show app)
// ============================
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



