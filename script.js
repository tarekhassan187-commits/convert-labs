// === PAGE LOAD ===
window.addEventListener("load", () => {
  const loading = document.getElementById("loading-screen");
  const app = document.getElementById("app");
  if (loading) loading.style.display = "none";
  if (app) app.style.display = "block";
});

// === THEME TOGGLE ===
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
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
  }
});

// === TAB SWITCHING ===
function showConverter(id) {
  document.querySelectorAll(".converter").forEach(el => el.classList.remove("active"));
  document.getElementById(id)?.classList.add("active");
  if (id === "currency") initCurrencyConverter();
}

// === LENGTH CONVERTER ===
const lengthUnits = { m: 1, km: 1000, cm: 0.01, mm: 0.001, yd: 0.9144, ft: 0.3048, in: 0.0254 };
for (const u in lengthUnits) {
  lengthFrom?.add(new Option(u, u));
  lengthTo?.add(new Option(u, u));
}
function convertLength() {
  const val = parseFloat(lengthInput.value);
  if (isNaN(val)) return alert("Enter a number");
  const res = (val * lengthUnits[lengthFrom.value]) / lengthUnits[lengthTo.value];
  lengthResult.textContent = `${val} ${lengthFrom.value} = ${res.toFixed(3)} ${lengthTo.value}`;
}

// === TEMPERATURE CONVERTER ===
["C", "F", "K"].forEach(t => {
  tempFrom?.add(new Option(t, t));
  tempTo?.add(new Option(t, t));
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

// === VOLUME CONVERTER ===
const volumeUnits = {
  "Liter (L)": 1,
  "Milliliter (mL)": 0.001,
  "Cubic meter (m³)": 1000,
  "Cubic centimeter (cm³)": 0.001,
  "US gallon (gal US)": 3.78541,
  "UK gallon (gal UK)": 4.54609
};
for (const k in volumeUnits) {
  volumeFrom?.add(new Option(k, k));
  volumeTo?.add(new Option(k, k));
}
function convertVolume() {
  const val = parseFloat(volumeInput.value);
  if (isNaN(val)) return alert("Enter a number");
  const res = (val * volumeUnits[volumeFrom.value]) / volumeUnits[volumeTo.value];
  volumeResult.textContent = `${val} ${volumeFrom.value} = ${res.toFixed(3)} ${volumeTo.value}`;
}

// === CONTAINER VOLUME ===
containerType?.addEventListener("change", () => {
  if (containerType.value === "box") {
    boxInputs.style.display = "block";
    cylinderInputs.style.display = "none";
  } else {
    boxInputs.style.display = "none";
    cylinderInputs.style.display = "block";
  }
});
liquidType?.addEventListener("change", () => {
  customDensity.style.display = liquidType.value === "custom" ? "block" : "none";
});
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

// === KITCHEN CONVERTER ===
const kitchenUnits = ["cup", "tbsp", "tsp", "g", "oz", "lb", "ml"];
kitchenUnits.forEach(u => {
  kitchenFrom?.add(new Option(u, u));
  kitchenTo?.add(new Option(u, u));
});
const ingredientGroups = {
  "Dry Ingredients": {
    Flour: 120, Sugar: 200, "Brown sugar": 220, "Powdered sugar": 120, Salt: 292,
    "Baking powder": 230, "Cocoa powder": 100, Rice: 195, Oats: 90, "Corn starch": 128
  },
  "Wet Ingredients": {
    Water: 240, Milk: 245, Oil: 218, Butter: 227, Honey: 340, "Soya sauce": 230, Vanilla: 208
  },
  "Nuts & Seeds": {
    Almonds: 95, Walnuts: 100, Peanuts: 145, "Sunflower seeds": 140
  },
  "Special Ingredients": {
    Yeast: 90, "Chocolate chips": 170, "Peanut butter": 270, "Tomato paste": 260
  }
};
for (const group in ingredientGroups) {
  const og = document.createElement("optgroup");
  og.label = group;
  for (const item in ingredientGroups[group]) {
    og.appendChild(new Option(item, item));
  }
  kitchenIngredient?.appendChild(og);
}
function convertKitchen() {
  const val = parseFloat(kitchenInput.value);
  if (isNaN(val)) return alert("Enter a number");
  const from = kitchenFrom.value, to = kitchenTo.value, ingr = kitchenIngredient.value;
  const gPerCup = Object.values(ingredientGroups).flatMap(obj => Object.entries(obj)).find(([k]) => k === ingr)?.[1];
  const unitToCup = { cup: 1, tbsp: 1 / 16, tsp: 1 / 48, g: 1 / gPerCup, oz: 1 / (gPerCup / 8), lb: 1 / (gPerCup / 454), ml: 1 / 240 };
  const cupToUnit = { cup: 1, tbsp: 16, tsp: 48, g: gPerCup, oz: gPerCup / 8, lb: gPerCup / 454, ml: 240 };
  const result = val * unitToCup[from] * cupToUnit[to];
  kitchenResult.textContent = `${val} ${from} of ${ingr} = ${result.toFixed(2)} ${to}`;
}

// === CURRENCY CONVERTER ===
let currencyReady = false;
async function initCurrencyConverter() {
  if (currencyReady) return;
  currencyReady = true;
  const from = document.getElementById("fromCurrency");
  const to = document.getElementById("toCurrency");
  const res = document.getElementById("currencyResult");
  const amount = document.getElementById("currencyAmount");
  if (!from || !to) return;

  const list = ["USD","EUR","GBP","JPY","AUD","CAD","CHF","CNY","INR","EGP","AED","SAR","KWD","QAR","BHD","OMR","SGD","ZAR"];
  list.forEach(c => {
    from.add(new Option(c, c));
    to.add(new Option(c, c));
  });
  from.value = "USD"; to.value = "EGP";

  document.getElementById("convertCurrencyBtn").onclick = async () => {
    if (!amount.value) return alert("Enter amount");
    res.textContent = "Fetching...";
    try {
      const data = await fetch(`https://api.exchangerate.host/convert?from=${from.value}&to=${to.value}`);
      const json = await data.json();
      const converted = (json.result * amount.value).toFixed(3);
      res.innerHTML = `${amount.value} ${from.value} = <b>${converted} ${to.value}</b>`;
    } catch {
      res.textContent = "Error fetching rates";
    }
  };
}

// === CLOUDCONVERT FILE CONVERSIONS ===
const apiKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZjA3ZDA3N2E3NzQzMTQ0YzFkYWE2OWI5NzM5NDg5NmExNTI5NzYxMWU2MGMzMDc1ZWQxOTIwYWIwMDkwMGU4YTM5YTJiYmNlYzNjYTAxMDMiLCJpYXQiOjE3NjE0NzY1NTcuMzExMzg0LCJuYmYiOjE3NjE0NzY1NTcuMzExMzg2LCJleHAiOjQ5MTcxNTAxNTcuMzA3NzQxLCJzdWIiOiI3MzI5MzQyOCIsInNjb3BlcyI6WyJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIl19.W4JR69t4p6StMrZyC8B3PpJzTO6Dw-X1jtXb6V_-Uz62tWLtdOP5-snkInbOlEkdMO2A4Ph9pVNhgJu8-oMbyvOkcXYMmJbL-VznoCLcDfJuaexVZjC07LTJxTzAP1RP5NA2MSRZF1lNRMeuWGlun5ljXzCb5kERmFD-eLczE7878w8F2cff7vDKQAB3lt8Enk3tK0i6_HdcttxI749HbobZ28afEmXOgXHIeXYKUo-0vpMB1VPUgB1U6HDfRX29oF_li-6KjqwnGHQZ3VgD525BGY6o5IFZHsDEhaJO79sQaFMzAQ1jMN8OVDNbfkCPtfPg71Adkp4ofMuEd6fKh6qkwv2_xDttbItsmLSn-G1SyrTHYAa00M5ko1au-2o8YU9eBIiDmXOgHTSwash35FpnGNuXvSEbtpwdUaZYmfENCQgemkkZgvuMMoB9WBHfShbKdcGyNgGh7Z1aVli0_Cxi2G_wjhBp-OWqulpLJbqIrlQZftJEc-a97Eo2GcZiUYdIIz_UGHBfnBBDg0ahHxpJ-isQOmtmwUItwCj3uwHsrJ43RA-Nw2Yc4hVxDaCV8wfMiywuP6YYTKoubdkEC6J2GLCTl2sychQNC4N6IMHXFLVZ5Mq9XQp2QD221_-5Mdaw5Uy_ZXPMLGfIRYJyVpNwf05jWBrSV3mbayHUtlQ"; // Replace with your CloudConvert API token

async function startCloudConvertJob(file, inputFormat, outputFormat, resultEl) {
  try {
    resultEl.textContent = "Uploading and converting...";
    const jobRes = await fetch("https://api.cloudconvert.com/v2/jobs", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tasks: {
          "import-my-file": { operation: "import/upload" },
          "convert-my-file": { operation: "convert", input: "import-my-file", input_format: inputFormat, output_format: outputFormat },
          "export-my-file": { operation: "export/url", input: "convert-my-file" }
        }
      }),
    });
    const job = await jobRes.json();
    const uploadTask = job.data.tasks.find(t => t.name === "import-my-file");
    const uploadUrl = uploadTask.result.form.url;
    const formData = new FormData();
    Object.keys(uploadTask.result.form.parameters).forEach(key =>
      formData.append(key, uploadTask.result.form.parameters[key])
    );
    formData.append("file", file);
    await fetch(uploadUrl, { method: "POST", body: formData });
    checkCloudJob(job.data.id, resultEl);
  } catch {
    resultEl.textContent = "Conversion failed.";
  }
}

async function checkCloudJob(jobId, resultEl) {
  try {
    const res = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
      headers: { Authorization: "Bearer " + apiKey },
    });
    const data = await res.json();
    if (data.data.status === "finished") {
      const url = data.data.tasks.find(t => t.operation === "export/url").result.files[0].url;
      resultEl.innerHTML = `✅ Done! <a href="${url}" target="_blank">Download</a>`;
    } else if (data.data.status === "error") {
      resultEl.textContent = "Conversion failed.";
    } else {
      setTimeout(() => checkCloudJob(jobId, resultEl), 4000);
    }
  } catch {
    resultEl.textContent = "Error checking job status.";
  }
}

// === IMAGE CONVERTER ===
function convertImage() {
  const file = imageFile.files[0];
  const format = imageFormat.value;
  startCloudConvertJob(file, file.name.split(".").pop(), format, imageResult);
}

// === DOC TO PDF ===
function convertDocToPDF() {
  const file = docFile.files[0];
  startCloudConvertJob(file, file.name.split(".").pop(), "pdf", docToPdfResult);
}

// === PDF TO DOC ===
function convertPdfToDoc() {
  const file = pdfFile.files[0];
  const format = pdfOutputFormat.value;
  startCloudConvertJob(file, "pdf", format, pdfToDocResult);
}

