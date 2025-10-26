// 🌐 Splash Screen
window.addEventListener("load", () => {
  setTimeout(() => {
    const loading = document.getElementById("loading-screen");
    const app = document.getElementById("app");
    if (loading) loading.style.display = "none";
    if (app) app.style.display = "block";
  }, 800);
});

document.addEventListener("DOMContentLoaded", () => {
  // 🌙 Theme Toggle
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

  // 🔹 Tab Switching
  window.showConverter = function (id) {
    document.querySelectorAll(".converter").forEach(el => el.classList.remove("active"));
    const selected = document.getElementById(id);
    if (selected) selected.classList.add("active");

    if (id === "currency") initCurrencyConverter();
  };

  // Initialize default converters
  if (document.getElementById("lengthFrom")) initBaseConverters();
});

// 🔹 Base Converters Initialization
function initBaseConverters() {
  // Length Converter
  const lengthUnits = {
    m: 1, km: 1000, cm: 0.01, mm: 0.001, µm: 1e-6, nm: 1e-9,
    yd: 0.9144, ft: 0.3048, in: 0.0254, ly: 9.461e15
  };
  if (window.lengthFrom && window.lengthTo) {
    for (const u in lengthUnits) {
      lengthFrom.add(new Option(u, u));
      lengthTo.add(new Option(u, u));
    }
  }

  window.convertLength = function () {
    const val = parseFloat(lengthInput.value);
    if (isNaN(val)) return alert("Enter a number");
    const res = (val * lengthUnits[lengthFrom.value]) / lengthUnits[lengthTo.value];
    lengthResult.textContent = `${val} ${lengthFrom.value} = ${res.toLocaleString()} ${lengthTo.value}`;
  };

  // Temperature Converter
  const temps = ["C", "F", "K"];
  if (window.tempFrom && window.tempTo) {
    temps.forEach(t => {
      tempFrom.add(new Option(t, t));
      tempTo.add(new Option(t, t));
    });
  }

  window.convertTemperature = function () {
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
  };

  // Volume Converter
  const volumeUnits = {
    "Liter (L)": 1, "Milliliter (mL)": 0.001, "Cubic meter (m³)": 1000,
    "Cubic centimeter (cm³)": 0.001, "Cubic inch (in³)": 0.0163871,
    "Cubic foot (ft³)": 28.3168, "US gallon (gal US)": 3.78541, "UK gallon (gal UK)": 4.54609
  };
  if (window.volumeFrom && window.volumeTo) {
    for (const k in volumeUnits) {
      volumeFrom.add(new Option(k, k));
      volumeTo.add(new Option(k, k));
    }
  }

  window.convertVolume = function () {
    const val = parseFloat(volumeInput.value);
    if (isNaN(val)) return alert("Enter a number");
    const res = (val * volumeUnits[volumeFrom.value]) / volumeUnits[volumeTo.value];
    volumeResult.textContent = `${val} ${volumeFrom.value} = ${res.toLocaleString()} ${volumeTo.value}`;
  };

  // Kitchen Converter
  const kitchenUnits = ["cup", "tbsp", "tsp", "g", "oz", "lb", "ml"];
  if (window.kitchenFrom && window.kitchenTo) {
    kitchenUnits.forEach(u => {
      kitchenFrom.add(new Option(u, u));
      kitchenTo.add(new Option(u, u));
    });
  }
  const ingredientGroups = {
    "Dry Ingredients": { Flour: 120, Sugar: 200, "Brown sugar": 220, Salt: 292 },
    "Wet Ingredients": { Water: 240, Milk: 245, Oil: 218, Honey: 340 },
  };
  if (window.kitchenIngredient) {
    for (const group in ingredientGroups) {
      const og = document.createElement("optgroup");
      og.label = group;
      for (const item in ingredientGroups[group]) {
        const opt = new Option(item, item);
        og.appendChild(opt);
      }
      kitchenIngredient.appendChild(og);
    }
  }

  window.convertKitchen = function () {
    const val = parseFloat(kitchenInput.value);
    if (isNaN(val)) return alert("Enter a number");
    const from = kitchenFrom.value, to = kitchenTo.value;
    const ingr = kitchenIngredient.value;
    const gPerCup = Object.values(ingredientGroups)
      .flatMap(obj => Object.entries(obj))
      .find(([k]) => k === ingr)[1];
    const unitToCup = { cup: 1, tbsp: 1 / 16, tsp: 1 / 48, g: 1 / gPerCup, oz: 1 / (gPerCup / 8), lb: 1 / (gPerCup / 454), ml: 1 / 240 };
    const cupToUnit = { cup: 1, tbsp: 16, tsp: 48, g: gPerCup, oz: gPerCup / 8, lb: gPerCup / 454, ml: 240 };
    const result = val * unitToCup[from] * cupToUnit[to];
    kitchenResult.textContent = `${val} ${from} of ${ingr} = ${result.toFixed(2)} ${to}`;
  };
}

// 🌍 Currency Converter
let currencyInitialized = false;
async function initCurrencyConverter() {
  if (currencyInitialized) return;
  currencyInitialized = true;

  const fromCurrency = document.getElementById("fromCurrency");
  const toCurrency = document.getElementById("toCurrency");
  const currencyResult = document.getElementById("currencyResult");

  if (!fromCurrency || !toCurrency) return;

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
    } catch {
      currencyResult.textContent = "❌ Failed to get exchange rate.";
    }
  });
}

// 🔹 CloudConvert API Key
const apiKey = "YOUR_API_KEY_HERE"; // replace with your CloudConvert key

// 🔹 Image Converter
function convertImage() {
  const file = document.getElementById("imageFile")?.files[0];
  const format = document.getElementById("imageFormat")?.value;
  const result = document.getElementById("imageResult");
  if (!file || !format || !result) return;

  result.textContent = "⏳ Uploading & converting...";

  fetch("https://api.cloudconvert.com/v2/import/upload", {
    method: "POST",
    headers: { Authorization: "Bearer " + apiKey },
  })
    .then(res => res.json())
    .then(data => {
      const uploadUrl = data.data.result.form.url;
      const params = data.data.result.form.parameters;
      const form = new FormData();
      for (const [k, v] of Object.entries(params)) form.append(k, v);
      form.append("file", file);
      return fetch(uploadUrl, { method: "POST", body: form });
    })
    .then(() => startCloudConvertJob(file, file.name.split(".").pop(), format, result))
    .catch(() => (result.textContent = "❌ Conversion failed."));
}

// 🔹 Document → PDF
function convertDocToPDF() {
  const file = document.getElementById("docFile")?.files[0];
  const result = document.getElementById("docToPdfResult");
  if (!file || !result) return;
  result.textContent = "⏳ Uploading & converting...";
  startCloudConvertJob(file, file.name.split(".").pop(), "pdf", result);
}

// 🔹 PDF → Document
function convertPdfToDoc() {
  const file = document.getElementById("pdfFile")?.files[0];
  const format = document.getElementById("pdfOutputFormat")?.value;
  const result = document.getElementById("pdfToDocResult");
  if (!file || !result) return;
  result.textContent = "⏳ Uploading & converting...";
  startCloudConvertJob(file, "pdf", format, result);
}

// 🔹 Generic CloudConvert Function
function startCloudConvertJob(file, inputFormat, outputFormat, resultElement) {
  fetch("https://api.cloudconvert.com/v2/jobs", {
    method: "POST",
    headers: {
      "Authorization": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZjA3ZDA3N2E3NzQzMTQ0YzFkYWE2OWI5NzM5NDg5NmExNTI5NzYxMWU2MGMzMDc1ZWQxOTIwYWIwMDkwMGU4YTM5YTJiYmNlYzNjYTAxMDMiLCJpYXQiOjE3NjE0NzY1NTcuMzExMzg0LCJuYmYiOjE3NjE0NzY1NTcuMzExMzg2LCJleHAiOjQ5MTcxNTAxNTcuMzA3NzQxLCJzdWIiOiI3MzI5MzQyOCIsInNjb3BlcyI6WyJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIl19.W4JR69t4p6StMrZyC8B3PpJzTO6Dw-X1jtXb6V_-Uz62tWLtdOP5-snkInbOlEkdMO2A4Ph9pVNhgJu8-oMbyvOkcXYMmJbL-VznoCLcDfJuaexVZjC07LTJxTzAP1RP5NA2MSRZF1lNRMeuWGlun5ljXzCb5kERmFD-eLczE7878w8F2cff7vDKQAB3lt8Enk3tK0i6_HdcttxI749HbobZ28afEmXOgXHIeXYKUo-0vpMB1VPUgB1U6HDfRX29oF_li-6KjqwnGHQZ3VgD525BGY6o5IFZHsDEhaJO79sQaFMzAQ1jMN8OVDNbfkCPtfPg71Adkp4ofMuEd6fKh6qkwv2_xDttbItsmLSn-G1SyrTHYAa00M5ko1au-2o8YU9eBIiDmXOgHTSwash35FpnGNuXvSEbtpwdUaZYmfENCQgemkkZgvuMMoB9WBHfShbKdcGyNgGh7Z1aVli0_Cxi2G_wjhBp-OWqulpLJbqIrlQZftJEc-a97Eo2GcZiUYdIIz_UGHBfnBBDg0ahHxpJ-isQOmtmwUItwCj3uwHsrJ43RA-Nw2Yc4hVxDaCV8wfMiywuP6YYTKoubdkEC6J2GLCTl2sychQNC4N6IMHXFLVZ5Mq9XQp2QD221_-5Mdaw5Uy_ZXPMLGfIRYJyVpNwf05jWBrSV3mbayHUtlQ,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tasks: {
        "import-my-file": { operation: "import/upload" },
        "convert-my-file": {
          operation: "convert",
          input: "import-my-file",
          input_format: inputFormat,
          output_format: outputFormat,
        },
        "export-my-file": { operation: "export/url", input: "convert-my-file" },
      },
    }),
  })
    .then(res => res.json())
    .then(job => checkJobStatus(job.data.id, resultElement))
    .catch(() => (resultElement.textContent = "❌ Error creating job."));
}

function checkJobStatus(jobId, resultElement) {
  fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
    headers: { Authorization: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZjA3ZDA3N2E3NzQzMTQ0YzFkYWE2OWI5NzM5NDg5NmExNTI5NzYxMWU2MGMzMDc1ZWQxOTIwYWIwMDkwMGU4YTM5YTJiYmNlYzNjYTAxMDMiLCJpYXQiOjE3NjE0NzY1NTcuMzExMzg0LCJuYmYiOjE3NjE0NzY1NTcuMzExMzg2LCJleHAiOjQ5MTcxNTAxNTcuMzA3NzQxLCJzdWIiOiI3MzI5MzQyOCIsInNjb3BlcyI6WyJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIl19.W4JR69t4p6StMrZyC8B3PpJzTO6Dw-X1jtXb6V_-Uz62tWLtdOP5-snkInbOlEkdMO2A4Ph9pVNhgJu8-oMbyvOkcXYMmJbL-VznoCLcDfJuaexVZjC07LTJxTzAP1RP5NA2MSRZF1lNRMeuWGlun5ljXzCb5kERmFD-eLczE7878w8F2cff7vDKQAB3lt8Enk3tK0i6_HdcttxI749HbobZ28afEmXOgXHIeXYKUo-0vpMB1VPUgB1U6HDfRX29oF_li-6KjqwnGHQZ3VgD525BGY6o5IFZHsDEhaJO79sQaFMzAQ1jMN8OVDNbfkCPtfPg71Adkp4ofMuEd6fKh6qkwv2_xDttbItsmLSn-G1SyrTHYAa00M5ko1au-2o8YU9eBIiDmXOgHTSwash35FpnGNuXvSEbtpwdUaZYmfENCQgemkkZgvuMMoB9WBHfShbKdcGyNgGh7Z1aVli0_Cxi2G_wjhBp-OWqulpLJbqIrlQZftJEc-a97Eo2GcZiUYdIIz_UGHBfnBBDg0ahHxpJ-isQOmtmwUItwCj3uwHsrJ43RA-Nw2Yc4hVxDaCV8wfMiywuP6YYTKoubdkEC6J2GLCTl2sychQNC4N6IMHXFLVZ5Mq9XQp2QD221_-5Mdaw5Uy_ZXPMLGfIRYJyVpNwf05jWBrSV3mbayHUtlQ},
  })
    .then(res => res.json())
    .then(data => {
      if (data.data.status === "finished") {
        const url = data.data.tasks.find(t => t.operation === "export/url").result.files[0].url;
        resultElement.innerHTML = `✅ Conversion complete! <a href="${url}" target="_blank">Download</a>`;
      } else if (data.data.status === "error") {
        resultElement.textContent = "❌ Conversion failed.";
      } else {
        setTimeout(() => checkJobStatus(jobId, resultElement), 3000);
      }
    })
    .catch(() => (resultElement.textContent = "❌ Error checking status."));
}
