// === PAGE LOAD ===
window.addEventListener("load", () => {
  const loading = document.getElementById("loading-screen");
  const app = document.getElementById("app");
  if (loading) loading.style.display = "none";
  if (app) app.style.display = "block";
});

// === INITIALIZE ===
document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initTabSwitcher();
  initBaseConverters();
});

// === THEME TOGGLE ===
function initThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

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

// === TAB SWITCHER ===
function initTabSwitcher() {
  window.showConverter = function (id) {
    document.querySelectorAll(".converter").forEach(el => el.classList.remove("active"));
    const section = document.getElementById(id);
    if (section) section.classList.add("active");

    if (id === "currency") initCurrencyConverter();
  };
}

// === BASIC CONVERTERS ===
function initBaseConverters() {
  // Length
  const lengthUnits = { m: 1, km: 1000, cm: 0.01, mm: 0.001, yd: 0.9144, ft: 0.3048, in: 0.0254 };
  const fromL = document.getElementById("lengthFrom");
  const toL = document.getElementById("lengthTo");
  Object.keys(lengthUnits).forEach(u => {
    fromL?.add(new Option(u, u));
    toL?.add(new Option(u, u));
  });

  window.convertLength = function () {
    const val = parseFloat(document.getElementById("lengthInput")?.value);
    const res = document.getElementById("lengthResult");
    if (isNaN(val)) return alert("Enter a valid number");
    const output = (val * lengthUnits[fromL.value]) / lengthUnits[toL.value];
    res.textContent = `${val} ${fromL.value} = ${output.toFixed(3)} ${toL.value}`;
  };

  // Temperature
  const tFrom = document.getElementById("tempFrom");
  const tTo = document.getElementById("tempTo");
  ["C", "F", "K"].forEach(t => {
    tFrom?.add(new Option(t, t));
    tTo?.add(new Option(t, t));
  });

  window.convertTemperature = function () {
    const val = parseFloat(document.getElementById("tempInput")?.value);
    const res = document.getElementById("tempResult");
    if (isNaN(val)) return alert("Enter a valid number");
    const f = tFrom.value, t = tTo.value;
    let r = val;
    if (f === "C" && t === "F") r = val * 9 / 5 + 32;
    else if (f === "F" && t === "C") r = (val - 32) * 5 / 9;
    else if (f === "C" && t === "K") r = val + 273.15;
    else if (f === "K" && t === "C") r = val - 273.15;
    else if (f === "F" && t === "K") r = (val - 32) * 5 / 9 + 273.15;
    else if (f === "K" && t === "F") r = (val - 273.15) * 9 / 5 + 32;
    res.textContent = `${val}°${f} = ${r.toFixed(2)}°${t}`;
  };

  // Volume
  const volumeUnits = { m3: 1, liter: 0.001, ml: 0.000001, gallon: 0.00378541 };
  const vFrom = document.getElementById("volumeFrom");
  const vTo = document.getElementById("volumeTo");
  Object.keys(volumeUnits).forEach(u => {
    vFrom?.add(new Option(u, u));
    vTo?.add(new Option(u, u));
  });

  window.convertVolume = function () {
    const val = parseFloat(document.getElementById("volumeInput")?.value);
    const res = document.getElementById("volumeResult");
    if (isNaN(val)) return alert("Enter a valid number");
    const output = (val * volumeUnits[vFrom.value]) / volumeUnits[vTo.value];
    res.textContent = `${val} ${vFrom.value} = ${output.toFixed(3)} ${vTo.value}`;
  };
}

// === CONTAINER VOLUME ===
window.calculateContainerVolume = function () {
  const type = document.getElementById("containerType")?.value;
  const result = document.getElementById("containerResult");
  if (!type || !result) return;

  let v = 0;
  if (type === "box") {
    const l = +document.getElementById("lengthBox")?.value;
    const w = +document.getElementById("widthBox")?.value;
    const h = +document.getElementById("heightBox")?.value;
    if ([l, w, h].some(isNaN)) return alert("Enter all dimensions");
    v = l * w * h;
  } else {
    const r = +document.getElementById("radiusCylinder")?.value;
    const h = +document.getElementById("heightCylinder")?.value;
    if ([r, h].some(isNaN)) return alert("Enter radius and height");
    v = Math.PI * r * r * h;
  }

  const liquid = document.getElementById("liquidType")?.value;
  const customDensity = +document.getElementById("customDensity")?.value;
  const density = liquid === "custom"
    ? customDensity
    : { water: 1, milk: 1.03, oil: 0.92, honey: 1.42 }[liquid];
  if (isNaN(density)) return alert("Enter valid density");

  const volumeLiters = v / 1000;
  const massGrams = v * density;
  result.textContent = `Volume: ${volumeLiters.toFixed(3)} L | Mass: ${massGrams.toFixed(1)} g`;
};

// === KITCHEN CONVERTER ===
const ingredients = {
  Flour: 120, Sugar: 200, Butter: 227, Honey: 340, Milk: 245, Water: 240, Oil: 218
};
const kFrom = document.getElementById("kitchenFrom");
const kTo = document.getElementById("kitchenTo");
const kIngr = document.getElementById("kitchenIngredient");
["cup", "tbsp", "tsp", "g", "oz", "ml"].forEach(u => {
  kFrom?.add(new Option(u, u));
  kTo?.add(new Option(u, u));
});
Object.keys(ingredients).forEach(i => kIngr?.add(new Option(i, i)));

window.convertKitchen = function () {
  const val = parseFloat(document.getElementById("kitchenInput")?.value);
  const res = document.getElementById("kitchenResult");
  if (isNaN(val)) return alert("Enter a valid number");
  const from = kFrom.value, to = kTo.value, ingr = kIngr.value;
  const gPerCup = ingredients[ingr];
  const toCup = { cup: 1, tbsp: 1 / 16, tsp: 1 / 48, g: 1 / gPerCup, oz: 1 / (gPerCup / 8), ml: 1 / 240 };
  const fromCup = { cup: 1, tbsp: 16, tsp: 48, g: gPerCup, oz: gPerCup / 8, ml: 240 };
  const resultVal = val * toCup[from] * fromCup[to];
  res.textContent = `${val} ${from} of ${ingr} = ${resultVal.toFixed(2)} ${to}`;
};

// === CURRENCY CONVERTER ===
let currencyReady = false;
async function initCurrencyConverter() {
  if (currencyReady) return;
  currencyReady = true;

  const from = document.getElementById("fromCurrency");
  const to = document.getElementById("toCurrency");
  const res = document.getElementById("currencyResult");
  if (!from || !to || !res) return;

  const currencies = ["USD","EUR","GBP","JPY","AUD","CAD","CHF","CNY","INR","EGP","AED","SAR","KWD","QAR","BHD","OMR","SGD","ZAR"];
  currencies.forEach(c => {
    from.add(new Option(c, c));
    to.add(new Option(c, c));
  });
  from.value = "USD"; to.value = "EGP";

  document.getElementById("convertCurrencyBtn").addEventListener("click", async () => {
    const amount = parseFloat(document.getElementById("currencyAmount")?.value);
    if (isNaN(amount) || amount <= 0) {
      res.textContent = "⚠️ Enter valid amount";
      return;
    }
    res.textContent = "⏳ Fetching rates...";
    try {
      const r = await fetch(`https://api.exchangerate.host/convert?from=${from.value}&to=${to.value}`);
      const data = await r.json();
      if (!data.result) throw new Error("Bad data");
      const converted = (amount * data.result).toFixed(3);
      res.innerHTML = `💱 ${amount} ${from.value} = <strong>${converted} ${to.value}</strong>`;
    } catch {
      res.textContent = "❌ Error fetching rates";
    }
  });
}

// === CLOUDCONVERT API ===
const apiKey = "YOUR_API_KEY_HERE"; // replace with your CloudConvert key

function startCloudConvertJob(file, inputFormat, outputFormat, resultEl) {
  if (!file || !resultEl) return;
  resultEl.textContent = "⏳ Uploading & converting...";

  fetch("https://api.cloudconvert.com/v2/jobs", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZjA3ZDA3N2E3NzQzMTQ0YzFkYWE2OWI5NzM5NDg5NmExNTI5NzYxMWU2MGMzMDc1ZWQxOTIwYWIwMDkwMGU4YTM5YTJiYmNlYzNjYTAxMDMiLCJpYXQiOjE3NjE0NzY1NTcuMzExMzg0LCJuYmYiOjE3NjE0NzY1NTcuMzExMzg2LCJleHAiOjQ5MTcxNTAxNTcuMzA3NzQxLCJzdWIiOiI3MzI5MzQyOCIsInNjb3BlcyI6WyJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIl19.W4JR69t4p6StMrZyC8B3PpJzTO6Dw-X1jtXb6V_-Uz62tWLtdOP5-snkInbOlEkdMO2A4Ph9pVNhgJu8-oMbyvOkcXYMmJbL-VznoCLcDfJuaexVZjC07LTJxTzAP1RP5NA2MSRZF1lNRMeuWGlun5ljXzCb5kERmFD-eLczE7878w8F2cff7vDKQAB3lt8Enk3tK0i6_HdcttxI749HbobZ28afEmXOgXHIeXYKUo-0vpMB1VPUgB1U6HDfRX29oF_li-6KjqwnGHQZ3VgD525BGY6o5IFZHsDEhaJO79sQaFMzAQ1jMN8OVDNbfkCPtfPg71Adkp4ofMuEd6fKh6qkwv2_xDttbItsmLSn-G1SyrTHYAa00M5ko1au-2o8YU9eBIiDmXOgHTSwash35FpnGNuXvSEbtpwdUaZYmfENCQgemkkZgvuMMoB9WBHfShbKdcGyNgGh7Z1aVli0_Cxi2G_wjhBp-OWqulpLJbqIrlQZftJEc-a97Eo2GcZiUYdIIz_UGHBfnBBDg0ahHxpJ-isQOmtmwUItwCj3uwHsrJ43RA-Nw2Yc4hVxDaCV8wfMiywuP6YYTKoubdkEC6J2GLCTl2sychQNC4N6IMHXFLVZ5Mq9XQp2QD221_-5Mdaw5Uy_ZXPMLGfIRYJyVpNwf05jWBrSV3mbayHUtlQ,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tasks: {
        "import-my-file": { operation: "import/upload" },
        "convert-my-file": { operation: "convert", input: "import-my-file", input_format: inputFormat, output_format: outputFormat },
        "export-my-file": { operation: "export/url", input: "convert-my-file" }
      }
    }),
  })
  .then(res => res.json())
  .then(job => checkCloudJob(job.data.id, resultEl))
  .catch(() => resultEl.textContent = "❌ Error creating job");
}

function checkCloudJob(jobId, resultEl) {
  fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
    headers: { Authorization: "Bearer " + eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZjA3ZDA3N2E3NzQzMTQ0YzFkYWE2OWI5NzM5NDg5NmExNTI5NzYxMWU2MGMzMDc1ZWQxOTIwYWIwMDkwMGU4YTM5YTJiYmNlYzNjYTAxMDMiLCJpYXQiOjE3NjE0NzY1NTcuMzExMzg0LCJuYmYiOjE3NjE0NzY1NTcuMzExMzg2LCJleHAiOjQ5MTcxNTAxNTcuMzA3NzQxLCJzdWIiOiI3MzI5MzQyOCIsInNjb3BlcyI6WyJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIl19.W4JR69t4p6StMrZyC8B3PpJzTO6Dw-X1jtXb6V_-Uz62tWLtdOP5-snkInbOlEkdMO2A4Ph9pVNhgJu8-oMbyvOkcXYMmJbL-VznoCLcDfJuaexVZjC07LTJxTzAP1RP5NA2MSRZF1lNRMeuWGlun5ljXzCb5kERmFD-eLczE7878w8F2cff7vDKQAB3lt8Enk3tK0i6_HdcttxI749HbobZ28afEmXOgXHIeXYKUo-0vpMB1VPUgB1U6HDfRX29oF_li-6KjqwnGHQZ3VgD525BGY6o5IFZHsDEhaJO79sQaFMzAQ1jMN8OVDNbfkCPtfPg71Adkp4ofMuEd6fKh6qkwv2_xDttbItsmLSn-G1SyrTHYAa00M5ko1au-2o8YU9eBIiDmXOgHTSwash35FpnGNuXvSEbtpwdUaZYmfENCQgemkkZgvuMMoB9WBHfShbKdcGyNgGh7Z1aVli0_Cxi2G_wjhBp-OWqulpLJbqIrlQZftJEc-a97Eo2GcZiUYdIIz_UGHBfnBBDg0ahHxpJ-isQOmtmwUItwCj3uwHsrJ43RA-Nw2Yc4hVxDaCV8wfMiywuP6YYTKoubdkEC6J2GLCTl2sychQNC4N6IMHXFLVZ5Mq9XQp2QD221_-5Mdaw5Uy_ZXPMLGfIRYJyVpNwf05jWBrSV3mbayHUtlQ },
  })
  .then(res => res.json())
  .then(data => {
    if (data.data.status === "finished") {
      const url = data.data.tasks.find(t => t.operation === "export/url").result.files[0].url;
      resultEl.innerHTML = `✅ Done! <a href="${url}" target="_blank">Download</a>`;
    } else if (data.data.status === "error") {
      resultEl.textContent = "❌ Conversion failed.";
    } else setTimeout(() => checkCloudJob(jobId, resultEl), 3000);
  })
  .catch(() => resultEl.textContent = "❌ Error checking job");
}

// === IMAGE CONVERTER ===
window.convertImage = function () {
  const file = document.getElementById("imageFile")?.files[0];
  const format = document.getElementById("imageFormat")?.value;
  const res = document.getElementById("imageResult");
  if (!file || !format || !res) return;
  startCloudConvertJob(file, file.name.split(".").pop(), format, res);
};

// === DOC ➜ PDF ===
window.convertDocToPDF = function () {
  const file = document.getElementById("docFile")?.files[0];
  const res = document.getElementById("docToPdfResult");
  if (!file || !res) return;
  startCloudConvertJob(file, file.name.split(".").pop(), "pdf", res);
};

// === PDF ➜ DOC ===
window.convertPdfToDoc = function () {
  const file = document.getElementById("pdfFile")?.files[0];
  const format = document.getElementById("pdfOutputFormat")?.value;
  const res = document.getElementById("pdfToDocResult");
  if (!file || !res) return;
  startCloudConvertJob(file, "pdf", format, res);
};

