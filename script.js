// ✅ Safe Page Loader
window.addEventListener("load", () => {
  const loading = document.getElementById("loading-screen");
  const app = document.getElementById("app");
  if (loading) loading.style.display = "none";
  if (app) app.style.display = "block";
});

// ✅ Wait until DOM fully ready
document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initTabSwitcher();
  safeInitBaseConverters();
});

// 🌙 Theme Toggle (dark/light)
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

// 🔹 Tabs
function initTabSwitcher() {
  window.showConverter = function (id) {
    document.querySelectorAll(".converter").forEach(el => el.classList.remove("active"));
    const section = document.getElementById(id);
    if (section) section.classList.add("active");

    if (id === "currency") initCurrencyConverter();
  };
}

// 🔹 Safe Converters Initialization
function safeInitBaseConverters() {
  try {
    if (document.getElementById("lengthFrom")) initBaseConverters();
  } catch (err) {
    console.error("Base converter init failed:", err);
  }
}

// ========== BASIC CONVERTERS ==========
function initBaseConverters() {
  // Length
  const lengthUnits = {
    m: 1, km: 1000, cm: 0.01, mm: 0.001,
    yd: 0.9144, ft: 0.3048, in: 0.0254
  };
  const from = document.getElementById("lengthFrom");
  const to = document.getElementById("lengthTo");
  const result = document.getElementById("lengthResult");
  if (from && to) {
    Object.keys(lengthUnits).forEach(u => {
      from.add(new Option(u, u));
      to.add(new Option(u, u));
    });
  }

  window.convertLength = () => {
    const input = document.getElementById("lengthInput");
    if (!input || !result) return;
    const val = parseFloat(input.value);
    if (isNaN(val)) return alert("Enter a number");
    const res = (val * lengthUnits[from.value]) / lengthUnits[to.value];
    result.textContent = `${val} ${from.value} = ${res.toFixed(3)} ${to.value}`;
  };

  // Temperature
  const tFrom = document.getElementById("tempFrom");
  const tTo = document.getElementById("tempTo");
  const tInput = document.getElementById("tempInput");
  const tResult = document.getElementById("tempResult");
  if (tFrom && tTo) ["C", "F", "K"].forEach(t => {
    tFrom.add(new Option(t, t));
    tTo.add(new Option(t, t));
  });

  window.convertTemperature = () => {
    if (!tInput || !tResult) return;
    const v = parseFloat(tInput.value);
    if (isNaN(v)) return alert("Enter a number");
    let r = v;
    const f = tFrom.value, t = tTo.value;
    if (f === "C" && t === "F") r = v * 9 / 5 + 32;
    else if (f === "F" && t === "C") r = (v - 32) * 5 / 9;
    else if (f === "C" && t === "K") r = v + 273.15;
    else if (f === "K" && t === "C") r = v - 273.15;
    else if (f === "F" && t === "K") r = (v - 32) * 5 / 9 + 273.15;
    else if (f === "K" && t === "F") r = (v - 273.15) * 9 / 5 + 32;
    tResult.textContent = `${v}°${f} = ${r.toFixed(2)}°${t}`;
  };
}

// ========== CURRENCY CONVERTER ==========
let currencyReady = false;
async function initCurrencyConverter() {
  if (currencyReady) return;
  currencyReady = true;

  const from = document.getElementById("fromCurrency");
  const to = document.getElementById("toCurrency");
  const result = document.getElementById("currencyResult");
  if (!from || !to || !result) return;

  const currencies = ["USD","EUR","GBP","JPY","AUD","CAD","CHF","CNY","INR","EGP","AED","SAR","KWD","QAR","BHD","OMR","SGD","ZAR"];
  currencies.forEach(c => {
    from.add(new Option(c, c));
    to.add(new Option(c, c));
  });
  from.value = "EGP"; 
  to.value = "USD";

  const button = document.getElementById("convertCurrencyBtn");
  if (!button) return;
  button.addEventListener("click", async () => {
    const amount = parseFloat(document.getElementById("currencyAmount").value);
    if (isNaN(amount) || amount <= 0) {
      result.textContent = "⚠️ Enter valid amount";
      return;
    }
    result.textContent = "⏳ Fetching rates...";
    try {
      const r = await fetch(`https://api.exchangerate.host/convert?from=${from.value}&to=${to.value}`);
      const data = await r.json();
      if (!data.result) throw new Error("Bad data");
      const converted = (amount * data.result).toFixed(3);
      result.innerHTML = `💱 ${amount} ${from.value} = <strong>${converted} ${to.value}</strong>`;
    } catch {
      result.textContent = "❌ Failed to get rates";
    }
  });
}

// ========== CLOUDCONVERT ==========
const apiKey = "YOUR_API_KEY_HERE"; // Replace with your actual CloudConvert key

function startCloudConvertJob(file, inputFormat, outputFormat, resultEl) {
  if (!file || !resultEl) return;

  resultEl.textContent = "⏳ Uploading & converting...";
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
          input_format: inputFormat,
          output_format: outputFormat,
        },
        "export-my-file": { operation: "export/url", input: "convert-my-file" }
      }
    }),
  })
  .then(res => res.json())
  .then(job => checkCloudJob(job.data.id, resultEl))
  .catch(() => (resultEl.textContent = "❌ Error creating job"));
}

function checkCloudJob(jobId, resultEl) {
  fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
    headers: { Authorization: "Bearer " + apiKey },
  })
  .then(res => res.json())
  .then(data => {
    if (data.data.status === "finished") {
      const url = data.data.tasks.find(t => t.operation === "export/url").result.files[0].url;
      resultEl.innerHTML = `✅ Done! <a href="${url}" target="_blank">Download</a>`;
    } else if (data.data.status === "error") {
      resultEl.textContent = "❌ Conversion failed.";
    } else {
      setTimeout(() => checkCloudJob(jobId, resultEl), 3000);
    }
  })
  .catch(() => (resultEl.textContent = "❌ Error checking job"));
}

// IMAGE converter
function convertImage() {
  const file = document.getElementById("imageFile")?.files[0];
  const format = document.getElementById("imageFormat")?.value;
  const result = document.getElementById("imageResult");
  if (!file || !format || !result) return;
  startCloudConvertJob(file, file.name.split(".").pop(), format, result);
}

// DOC ➜ PDF
function convertDocToPDF() {
  const file = document.getElementById("docFile")?.files[0];
  const result = document.getElementById("docToPdfResult");
  if (!file || !result) return;
  startCloudConvertJob(file, file.name.split(".").pop(), "pdf", result);
}

// PDF ➜ DOC
function convertPdfToDoc() {
  const file = document.getElementById("pdfFile")?.files[0];
  const format = document.getElementById("pdfOutputFormat")?.value;
  const result = document.getElementById("pdfToDocResult");
  if (!file || !result) return;
  startCloudConvertJob(file, "pdf", format, result);
}
