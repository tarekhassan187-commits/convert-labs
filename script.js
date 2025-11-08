/* ===================================================
   Convert Labs — Universal Script (2025 Clean Version)
   - Theme toggle + nav highlight
   - Safe per-page converter initializers:
     initKitchenConverter(), initLengthConverter()
   - Add new converters the same way (guarded by DOM checks)
   =================================================== */

/* =========================
   THEME & NAV HELPERS
   ========================= */
const themeToggleBtn = document.getElementById("themeToggle");

(function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.classList.toggle("dark", savedTheme === "dark");
  if (themeToggleBtn) themeToggleBtn.textContent = savedTheme === "dark" ? "☀️" : "🌙";
})();

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeToggleBtn.textContent = isDark ? "☀️" : "🌙";
  });
}

(function highlightActiveNav() {
  const currentPage = window.location.pathname.split("/").pop();
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach(link => {
    const href = link.getAttribute("href") || "";
    if (href.includes(currentPage)) link.classList.add("active");
    else link.classList.remove("active");
  });
})();

function formatNumber(num) {
  // step-by-step numeric safety then format
  if (Number.isFinite(num) === false) return String(num);
  return Number(Math.round(num * 1000) / 1000).toLocaleString();
}

/* ===================================================
   Per-page initializers (run only when DOM elements exist)
   - They are isolated and won't touch pages without those elements.
   =================================================== */

window.addEventListener("DOMContentLoaded", () => {
  initKitchenConverter();
  initLengthConverter();
  // you can add initVolumeConverter(), initTemperatureConverter(), etc. the same way
});

/* ===================================================
   KITCHEN CONVERTER
   Model:
    - Units are either "volume" (ml base) or "mass" (g base).
    - Ingredient densities are in g/ml (grams per milliliter).
    - To convert volume->mass: mass_g = volume_ml * density_g_per_ml
    - To convert mass->volume: volume_ml = mass_g / density_g_per_ml
   =================================================== */
function initKitchenConverter() {
  const input = document.getElementById("kitchenInput");
  const fromSel = document.getElementById("kitchenFrom");
  const toSel = document.getElementById("kitchenTo");
  const ingSel = document.getElementById("kitchenIngredient");
  const resultP = document.getElementById("kitchenResult");
  if (!input || !fromSel || !toSel || !ingSel || !resultP) return; // not this page

  // Units definitions: factor to ml (for volume) or to g (for mass)
  const UNITS = {
    // volume units -> convert to ml
    cup:        {type: "volume", ml: 240},
    tablespoon: {type: "volume", ml: 15},
    tsp:        {type: "volume", ml: 5},
    milliliter: {type: "volume", ml: 1},
    liter:      {type: "volume", ml: 1000},
    "fluid-ounce": {type: "volume", ml: 29.5735}, // US fl oz
    // mass units -> convert to g
    gram:       {type: "mass", g: 1},
    kilogram:   {type: "mass", g: 1000},
    ounce:      {type: "mass", g: 28.349523125},
    pound:      {type: "mass", g: 453.59237}
  };

  // ============================================
// 🍳 Expanded Ingredient Density Table (g/ml)
// ============================================
const INGREDIENTS = [
  {
    group: "Baking Staples",
    items: [
      { key: "all-purpose-flour", label: "All-purpose Flour", density: 0.53 },
      { key: "bread-flour", label: "Bread Flour", density: 0.57 },
      { key: "cake-flour", label: "Cake Flour", density: 0.48 },
      { key: "whole-wheat-flour", label: "Whole Wheat Flour", density: 0.55 },
      { key: "granulated-sugar", label: "Granulated Sugar", density: 0.85 },
      { key: "brown-sugar", label: "Brown Sugar (packed)", density: 0.9 },
      { key: "powdered-sugar", label: "Powdered Sugar", density: 0.56 },
      { key: "cocoa-powder", label: "Cocoa Powder", density: 0.44 },
      { key: "baking-powder", label: "Baking Powder", density: 0.88 },
      { key: "baking-soda", label: "Baking Soda", density: 2.2 },
      { key: "cornstarch", label: "Cornstarch", density: 0.54 },
      { key: "salt", label: "Salt (table)", density: 1.2 },
      { key: "yeast", label: "Yeast (active dry)", density: 0.48 },
      { key: "gelatin", label: "Gelatin Powder", density: 0.65 }
    ]
  },
  {
    group: "Dairy & Fats",
    items: [
      { key: "butter", label: "Butter (melted)", density: 0.91 },
      { key: "margarine", label: "Margarine", density: 0.9 },
      { key: "milk", label: "Milk (whole)", density: 1.03 },
      { key: "skim-milk", label: "Milk (skim)", density: 1.035 },
      { key: "cream", label: "Cream (heavy)", density: 0.994 },
      { key: "cream-cheese", label: "Cream Cheese", density: 0.98 },
      { key: "yogurt", label: "Yogurt (plain)", density: 1.03 },
      { key: "condensed-milk", label: "Condensed Milk", density: 1.13 },
      { key: "evaporated-milk", label: "Evaporated Milk", density: 1.07 },
      { key: "grated-cheese", label: "Grated Cheese", density: 0.36 },
      { key: "parmesan", label: "Parmesan (grated)", density: 0.45 }
    ]
  },
  {
    group: "Oils & Syrups",
    items: [
      { key: "olive-oil", label: "Olive Oil", density: 0.92 },
      { key: "vegetable-oil", label: "Vegetable Oil", density: 0.92 },
      { key: "canola-oil", label: "Canola Oil", density: 0.92 },
      { key: "sunflower-oil", label: "Sunflower Oil", density: 0.92 },
      { key: "coconut-oil", label: "Coconut Oil (liquid)", density: 0.92 },
      { key: "maple-syrup", label: "Maple Syrup", density: 1.33 },
      { key: "corn-syrup", label: "Corn Syrup", density: 1.36 },
      { key: "molasses", label: "Molasses", density: 1.4 },
      { key: "honey", label: "Honey", density: 1.42 }
    ]
  },
  {
    group: "Nuts, Seeds & Flours",
    items: [
      { key: "almond-flour", label: "Almond Flour", density: 0.44 },
      { key: "coconut-flour", label: "Coconut Flour", density: 0.32 },
      { key: "peanut-butter", label: "Peanut Butter", density: 1.0 },
      { key: "ground-almonds", label: "Ground Almonds", density: 0.45 },
      { key: "ground-hazelnuts", label: "Ground Hazelnuts", density: 0.6 },
      { key: "chia-seeds", label: "Chia Seeds", density: 0.7 },
      { key: "flaxseed-meal", label: "Flaxseed Meal", density: 0.58 }
    ]
  },
{
  group: "Grains & Pasta",
  items: [
    { key: "rice-uncooked", label: "Rice (uncooked)", density: 0.85 },
    { key: "cooked-rice", label: "Rice (cooked)", density: 1.08 },
    { key: "oats-rolled", label: "Oats (rolled)", density: 0.45 },
    { key: "oats-quick", label: "Oats (quick)", density: 0.4 },
    { key: "quinoa", label: "Quinoa (uncooked)", density: 0.77 },
    { key: "pasta-uncooked", label: "Pasta (uncooked)", density: 0.61 },
    { key: "pasta-cooked", label: "Pasta (cooked)", density: 1.04 },
    { key: "breadcrumbs", label: "Breadcrumbs (dried)", density: 0.39 }
  ]
},
  {
    group: "Fruits & Vegetables",
    items: [
      { key: "banana", label: "Banana (mashed)", density: 1.09 },
      { key: "apple-slices", label: "Apple Slices", density: 0.65 },
      { key: "apple-sauce", label: "Apple Sauce", density: 1.03 },
      { key: "avocado", label: "Avocado (mashed)", density: 1.03 },
      { key: "pumpkin-puree", label: "Pumpkin Puree", density: 0.96 },
      { key: "tomato-sauce", label: "Tomato Sauce", density: 1.03 },
      { key: "tomato-paste", label: "Tomato Paste", density: 1.12 },
      { key: "onion-chopped", label: "Onion (chopped)", density: 0.66 },
      { key: "carrot-grated", label: "Carrot (grated)", density: 0.64 },
      { key: "potato-mashed", label: "Potato (mashed)", density: 0.82 },
      { key: "spinach-chopped", label: "Spinach (chopped)", density: 0.42 }
    ]
  },
  {
    group: "Liquids & Beverages",
    items: [
      { key: "water", label: "Water", density: 1.0 },
      { key: "coffee-brewed", label: "Coffee (brewed)", density: 1.0 },
      { key: "tea-brewed", label: "Tea (brewed)", density: 1.0 },
      { key: "juice-orange", label: "Orange Juice", density: 1.04 },
      { key: "juice-apple", label: "Apple Juice", density: 1.05 },
      { key: "wine", label: "Wine", density: 0.99 },
      { key: "beer", label: "Beer", density: 1.01 },
      { key: "vinegar", label: "Vinegar", density: 1.01 },
      { key: "soy-sauce", label: "Soy Sauce", density: 1.16 }
    ]
  },
  {
    group: "Condiments & Sauces",
    items: [
      { key: "ketchup", label: "Ketchup", density: 1.12 },
      { key: "mayonnaise", label: "Mayonnaise", density: 0.94 },
      { key: "mustard", label: "Mustard", density: 1.01 },
      { key: "barbecue-sauce", label: "Barbecue Sauce", density: 1.05 },
      { key: "salad-dressing", label: "Salad Dressing", density: 0.93 },
      { key: "sour-cream", label: "Sour Cream", density: 0.97 }
    ]
  },
  {
    group: "Miscellaneous",
    items: [
      { key: "chocolate-chips", label: "Chocolate Chips", density: 0.6 },
      { key: "shredded-coconut", label: "Shredded Coconut", density: 0.34 },
      { key: "raisins", label: "Raisins", density: 0.62 },
      { key: "gelatin-cooked", label: "Gelatin (set)", density: 1.04 },
      { key: "egg-whole", label: "Egg (whole beaten)", density: 1.03 },
      { key: "egg-white", label: "Egg White", density: 1.04 },
      { key: "egg-yolk", label: "Egg Yolk", density: 1.06 }
    ]
  }
];

  // Populate unit selects
  function fillUnitSelect(sel) {
    sel.innerHTML = "";
    const order = [
      {key:"cup", label:"Cup (cup)"},
      {key:"tablespoon", label:"Tablespoon (tbsp)"},
      {key:"tsp", label:"Teaspoon (tsp)"},
      {key:"milliliter", label:"Milliliter (ml)"},
      {key:"liter", label:"Liter (L)"},
      {key:"fluid-ounce", label:"Fluid ounce (fl oz)"},
      {key:"gram", label:"Gram (g)"},
      {key:"kilogram", label:"Kilogram (kg)"},
      {key:"ounce", label:"Ounce (oz)"},
      {key:"pound", label:"Pound (lb)"}
    ];
    order.forEach(u => {
      const o = document.createElement("option");
      o.value = u.key; o.textContent = u.label;
      sel.appendChild(o);
    });
  }

  // Populate ingredient grouped select
  function fillIngredientSelect() {
    ingSel.innerHTML = "";
    INGREDIENTS.forEach(group => {
      const g = document.createElement("optgroup");
      g.label = group.group;
      group.items.forEach(it => {
        const o = document.createElement("option");
        o.value = `${it.key}::${it.density}`; // store density in value for simplicity
        o.textContent = it.label;
        g.appendChild(o);
      });
      ingSel.appendChild(g);
    });
  }

  fillUnitSelect(fromSel);
  fillUnitSelect(toSel);
  fillIngredientSelect();

  // Conversion function
  window.convertKitchen = function convertKitchen() {
    const raw = parseFloat(input.value);
    if (Number.isFinite(raw) === false) {
      resultP.textContent = "Enter a valid number.";
      return;
    }

    const from = fromSel.value;
    const to = toSel.value;

    // ingredient density parse
    let density = 1.0;
    const ingVal = ingSel.value;
    if (ingVal && ingVal.includes("::")) {
      density = parseFloat(ingVal.split("::")[1]);
    }

    // helper to get unit meta
    function unitMeta(k) {
      if (!UNITS[k]) throw new Error("Unknown unit: " + k);
      return UNITS[k];
    }

    try {
      const uFrom = unitMeta(from);
      const uTo = unitMeta(to);

      // both volume -> only ratio of ml
      if (uFrom.type === "volume" && uTo.type === "volume") {
        const ml = raw * uFrom.ml;
        const out = ml / uTo.ml;
        resultP.textContent = `${formatNumber(out)} ${uToLabel(to)}`;
        return;
      }

      // both mass -> grams ratio
      if (uFrom.type === "mass" && uTo.type === "mass") {
        const g = raw * uFrom.g;
        const out = g / uTo.g;
        resultP.textContent = `${formatNumber(out)} ${uToLabel(to)}`;
        return;
      }

      // Cross conversion -> need density
      if (uFrom.type === "volume" && uTo.type === "mass") {
        const ml = raw * uFrom.ml;
        const g = ml * density;
        const out = g / uTo.g;
        resultP.textContent = `${formatNumber(out)} ${uToLabel(to)}`;
        return;
      }

      if (uFrom.type === "mass" && uTo.type === "volume") {
        const g = raw * uFrom.g;
        const ml = g / density;
        const out = ml / uTo.ml;
        resultP.textContent = `${formatNumber(out)} ${uToLabel(to)}`;
        return;
      }

      resultP.textContent = "Conversion not supported.";
    } catch (err) {
      console.error(err);
      resultP.textContent = "An error occurred.";
    }
  };

  function uToLabel(k) {
    // display label for result
    const map = {
      cup: "cup(s)",
      tablespoon: "tbsp",
      tsp: "tsp",
      milliliter: "ml",
      liter: "L",
      "fluid-ounce": "fl oz",
      gram: "gram",
      kilogram: "kg",
      ounce: "oz",
      pound: "lb"
    };
    return map[k] || k;
  }
}

/* ===================================================
   LENGTH CONVERTER
   - Converts via meters base
   =================================================== */
function initLengthConverter() {
  const inEl = document.getElementById("lengthInput");
  const fromSel = document.getElementById("lengthFrom");
  const toSel = document.getElementById("lengthTo");
  const resP = document.getElementById("lengthResult");
  if (!inEl || !fromSel || !toSel || !resP) return;

  const UNITS = {
    m: 1,
    cm: 0.01,
    mm: 0.001,
    km: 1000,
    inch: 0.0254,
    ft: 0.3048,
    yard: 0.9144,
    mile: 1609.344
  };

  function fill(sel) {
    sel.innerHTML = "";
    const list = [
      ["m","Meter (m)"],
      ["cm","Centimeter (cm)"],
      ["mm","Millimeter (mm)"],
      ["km","Kilometer (km)"],
      ["inch","Inch (in)"],
      ["ft","Foot (ft)"],
      ["yard","Yard (yd)"],
      ["mile","Mile (mi)"]
    ];
    list.forEach(li => {
      const o = document.createElement("option");
      o.value = li[0]; o.textContent = li[1];
      sel.appendChild(o);
    });
  }

  fill(fromSel);
  fill(toSel);

  window.convertLength = function convertLength() {
    const v = parseFloat(inEl.value);
    if (Number.isFinite(v) === false) { resP.textContent = "Enter a valid number."; return; }
    const f = fromSel.value, t = toSel.value;
    if (!UNITS[f] || !UNITS[t]) { resP.textContent = "Select units."; return; }
    const meters = v * UNITS[f];
    const out = meters / UNITS[t];
    resP.textContent = `${formatNumber(out)} ${toSel.options[toSel.selectedIndex].text.split(" ")[0]}`;
  };
}

/* ===================================================
   Add new initializers for other tools here following
   same pattern: query DOM, populate selects, expose
   window.convertXXX functions for page buttons to call.
   =================================================== */

console.log("%cConvert Labs Script Loaded ✅", "color:#2563eb;font-weight:bold;");

