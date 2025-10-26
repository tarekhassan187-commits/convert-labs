// 🌐 Splash Screen
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loading-screen").style.display = "none";
    document.getElementById("app").style.display = "block";
  }, 800);
});

// 🔹 Theme Toggle
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("themeToggle");
  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    document.body.classList.add("dark-mode");
    toggle.textContent = "☀️";
  }
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const dark = document.body.classList.contains("dark-mode");
    toggle.textContent = dark ? "☀️" : "🌙";
    localStorage.setItem("theme", dark ? "dark" : "light");
  });
});

// 🔹 Tab Switching
function showConverter(id) {
  document.querySelectorAll(".converter").forEach(el => el.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  // Initialize currency converter only when opened
  if (id === "currency") initCurrencyConverter();
}

// ========== BASE CONVERTERS (Length, Temp, Volume, Kitchen, Container) ==========

// 🔹 Length Converter
const lengthUnits = {
  m: 1, km: 1000, cm: 0.01, mm: 0.001, µm: 1e-6, nm: 1e-9,
  yd: 0.9144, ft: 0.3048, in: 0.0254, ly: 9.461e15
};
for (const u in lengthUnits) {
  const opt1 = new Option(u, u), opt2 = new Option(u, u);
  lengthFrom.appendChild(opt1); lengthTo.appendChild(opt2);
}
function convertLength() {
  const val = parseFloat(lengthInput.value);
  if (isNaN(val)) return alert("Enter a number");
  const res = (val * lengthUnits[lengthFrom.value]) / lengthUnits[lengthTo.value];
  lengthResult.textContent = `${val} ${lengthFrom.value} = ${res.toLocaleString()} ${lengthTo.value}`;
}

// 🔹 Temperature Converter
const temps = ["C", "F", "K"];
temps.forEach(t => {
  tempFrom.add(new Option(t, t));
  tempTo.add(new Option(t, t));
});
function convertTemperature() {
  const v = parseFloat(tempInput.value), f = tempFrom.value, t = tempTo.value;
  if (isNaN(v)) return alert("Enter a number");
  let r = v;
  if (f === "C" && t === "F") r = v * 9 / 5 + 32;
  else if (f === "F" && t === "C") r = (v - 32) * 5 / 9;
  else if (f === "C" && t === "K") r = v + 273.15;
  else if (f === "K" && t === "C") r = v - 273.15;
  else if (f === "F" && t === "K") r = (v - 32) * 5 / 9 + 273.15;
  else if (f === "K" && t === "F") r = (v - 273.15) * 9 / 5 + 32;
  tempResult.textContent = `${v}°${f} = ${r.toFixed(2)}°${t}`;
}

// 🔹 Volume Converter
const volumeUnits = {
  "Liter (L)": 1, "Milliliter (mL)": 0.001, "Cubic meter (m³)": 1000,
  "Cubic centimeter (cm³)": 0.001, "Cubic inch (in³)": 0.0163871,
  "Cubic foot (ft³)": 28.3168, "US gallon (gal US)": 3.78541, "UK gallon (gal UK)": 4.54609
};
for (const k in volumeUnits) {
  volumeFrom.add(new Option(k, k));
  volumeTo.add(new Option(k, k));
}
function convertVolume() {
  const val = parseFloat(volumeInput.value);
  if (isNaN(val)) return alert("Enter a number");
  const res = (val * volumeUnits[volumeFrom.value]) / volumeUnits[volumeTo.value];
  volumeResult.textContent = `${val} ${volumeFrom.value} = ${res.toLocaleString()} ${volumeTo.value}`;
}

// 🔹 Container Volume Calculator
containerType.onchange = () => {
  boxInputs.style.display = containerType.value === "box" ? "block" : "none";
  cylinderInputs.style.display = containerType.value === "cylinder" ? "block" : "none";
};
liquidType.onchange = () => {
  customDensity.style.display = liquidType.value === "custom" ? "block" : "none";
};
function calculateContainerVolume() {
  let v = 0;
  if (containerType.value === "box") {
    const l = +lengthBox.value, w = +widthBox.value, h = +heightBox.value;
    if ([l, w, h].some(isNaN)) return alert("Enter all dimensions");
    v = l * w * h;
  } else {
    const r = +radiusCylinder.value, h = +heightCylinder.value;
    if ([r, h].some(isNaN)) return alert("Enter radius and height");
    v = Math.PI * r * r * h;
  }
  const d = liquidType.value === "custom" ? +customDensity.value :
    { water: 1, milk: 1.03, oil: 0.92, honey: 1.42 }[liquidType.value];
  if (isNaN(d)) return alert("Enter valid density");
  containerResult.textContent = `Volume: ${(v / 1000).toFixed(3)} L | Mass: ${(v * d).toFixed(1)} g`;
}

// 🔹 Kitchen Converter
const kitchenUnits = ["cup", "tbsp", "tsp", "g", "oz", "lb", "ml"];
kitchenUnits.forEach(u => {
  kitchenFrom.add(new Option(u, u));
  kitchenTo.add(new Option(u, u));
});
const ingredientGroups = {
  "Dry Ingredients": { Flour: 120, Sugar: 200, "Brown sugar": 220, Salt: 292 },
  "Wet Ingredients": { Water: 240, Milk: 245, Oil: 218, Honey: 340 },
};
for (const group in ingredientGroups) {
  const og = document.createElement("optgroup");
  og.label = group;
  for (const item in ingredientGroups[group]) {
    const opt = new Option(item, item);
    og.appendChild(opt);
  }
  kitchenIngredient.appendChild(og);
}
function convertKitchen() {
  const val = parseFloat(kitchenInput.value);
  if (isNaN(val)) return alert("Enter a number");
  const from = kitchenFrom.value, to = kitchenTo.value;
  const ingr = kitchenIngredient.value;
  const gPerCup = Object.values(ingredientGroups).flatMap(obj => Object.entries(obj))
    .find(([k]) => k === ingr)[1];
  const unitToCup = { cup: 1, tbsp: 1 / 16, tsp: 1 / 48, g: 1 / gPerCup, oz: 1 / (gPerCup / 8), lb: 1 / (gPerCup / 454), ml: 1 / 240 };
  const cupToUnit = { cup: 1, tbsp: 16, tsp: 48, g: gPerCup, oz: gPerCup / 8, lb: gPerCup / 454, ml: 240 };
  const result = val * unitToCup[from] * cupToUnit[to];
  kitchenResult.textContent = `${val} ${from} of ${ingr} = ${result.toFixed(2)} ${to}`;
}

// ========== CLOUDCONVERT SETUP ==========
const apiKey = "YOUR_API_KEY_HERE"; // replace with your actual CloudConvert API key

// 🔹 Image Converter
function convertImage() {
  const file = document.getElementById("imageFile").files[0];
  const format = document.getElementById("imageFormat").value;
  const result = document.getElementById("imageResult");

  if (!file) return alert("Please select an image first.");
  result.textContent = "⏳ Converting...";

  const formData = new FormData();
  formData.append("file", file);

  fetch("https://api.cloudconvert.com/v2/import/upload", {
    method: "POST",
    headers: { Authorization: "Bearer " + apiKey },
  })
    .then(res => res.json())
    .then(uploadData => {
      const uploadUrl = uploadData.data.result.form.url;
      const uploadParams = uploadData.data.result.form.parameters;
      const uploadForm = new FormData();
      for (const [k, v] of Object.entries(uploadParams)) uploadForm.append(k, v);
      uploadForm.append("file", file);

      return fetch(uploadUrl, { method: "POST", body: uploadForm });
    })
    .then(() =>
      fetch("https://api.cloudconvert.com/v2/jobs", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tasks: {
            "import-my-file": { operation: "import/upload" },
            "convert-my-file": {
              operation: "convert",
              input: "import-my-file",
              input_format: file.name.split(".").pop(),
              output_format: format,
            },
            "export-my-file": { operation: "export/url", input: "convert-my-file" },
          },
        }),
      })
    )
    .then(res => res.json())
    .then(job => {
      const jobId = job.data.id;
      const checkJob = () => {
        fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
          headers: { Authorization: "Bearer " + apiKey },
        })
          .then(res => res.json())
          .then(data => {
            if (data.data.status === "finished") {
              const url = data.data.tasks.find(t => t.operation === "export/url").result.files[0].url;
              result.innerHTML = `✅ Done! <a href="${url}" target="_blank">Download Image</a>`;
            } else if (data.data.status === "error") {
              result.textContent = "❌ Conversion failed.";
            } else setTimeout(checkJob, 3000);
          });
      };
      checkJob();
    })
    .catch(() => (result.textContent = "❌ Error during conversion."));
}

// ========== CURRENCY CONVERTER ==========
let currencyInitialized = false;
async function initCurrencyConverter() {
  if (currencyInitialized) return;
  currencyInitialized = true;

  const fromCurrency = document.getElementById("fromCurrency");
  const toCurrency = document.getElementById("toCurrency");
  const currencyResult = document.getElementById("currencyResult");

  const currencies = [
    "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "EGP",
    "AED", "SAR", "KWD", "QAR", "BHD", "OMR", "SGD", "ZAR"
  ];

  currencies.forEach(code => {
    fromCurrency.add(new Option(code, code));
    toCurrency.add(new Option(code, code));
  });

  fromCurrency.value = "EGP";
  toCurrency.value = "USD";

  document.getElementById("convertCurrencyBtn").addEventListener("click", async () => {
    const amount = parseFloat(document.getElementById("currencyAmount").value);
    const from = fromCurrency.value;
    const to = toCurrency.value;

    if (isNaN(amount) || amount <= 0) {
      currencyResult.textContent = "⚠️ Enter a valid amount.";
      return;
    }

    currencyResult.textContent = "⏳ Fetching rates...";

    try {
      const response = await fetch(`https://api.exchangerate.host/convert?from=${from}&to=${to}`);
      const data = await response.json();

      if (!data.result) throw new Error("Invalid data");
      const converted = (amount * data.result).toFixed(3);
      currencyResult.innerHTML = `💱 ${amount} ${from} = <strong>${converted} ${to}</strong>`;
    } catch (err) {
      currencyResult.textContent = "❌ Failed to get rates.";
    }
  });
}
