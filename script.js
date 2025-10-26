console.log("✅ Script loaded start");

// === SAFE PAGE LOADER ===
window.addEventListener("load", () => {
  try {
    const loading = document.getElementById("loading-screen");
    const app = document.getElementById("app");
    if (loading) loading.style.display = "none";
    if (app) app.style.display = "block";
    console.log("✅ Page loaded");
  } catch (e) {
    console.error("❌ Page load error:", e);
  }
});

// === MAIN INITIALIZER ===
document.addEventListener("DOMContentLoaded", () => {
  try {
    initThemeToggle();
    initTabSwitcher();
    if (document.getElementById("lengthFrom")) initBaseConverters();
    console.log("✅ DOM fully initialized");
  } catch (err) {
    console.error("❌ Init error:", err);
  }
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

// === TAB SYSTEM ===
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
  console.log("⚙️ Base converters loaded");
  // Length converter
  const units = { m: 1, km: 1000, cm: 0.01, mm: 0.001, yd: 0.9144, ft: 0.3048, in: 0.0254 };
  const from = document.getElementById("lengthFrom");
  const to = document.getElementById("lengthTo");
  if (from && to) Object.keys(units).forEach(u => {
    from.add(new Option(u, u));
    to.add(new Option(u, u));
  });

  window.convertLength = () => {
    const input = parseFloat(document.getElementById("lengthInput")?.value || 0);
    const result = document.getElementById("lengthResult");
    if (!result) return;
    if (isNaN(input)) return alert("Enter a number");
    const val = (input * units[from.value]) / units[to.value];
    result.textContent = `${input} ${from.value} = ${val.toFixed(3)} ${to.value}`;
  };
}

// === CURRENCY CONVERTER ===
let currencyReady = false;
async function initCurrencyConverter() {
  if (currencyReady) return;
  currencyReady = true;
  console.log("💱 Currency converter initialized");

  const from = document.getElementById("fromCurrency");
  const to = document.getElementById("toCurrency");
  const result = document.getElementById("currencyResult");
  const button = document.getElementById("convertCurrencyBtn");
  if (!from || !to || !button || !result) return;

  const currencies = ["USD","EUR","GBP","JPY","AUD","CAD","CHF","CNY","INR","EGP","AED","SAR","KWD","QAR","BHD","OMR","SGD","ZAR"];
  currencies.forEach(c => {
    from.add(new Option(c, c));
    to.add(new Option(c, c));
  });
  from.value = "EGP"; 
  to.value = "USD";

  button.addEventListener("click", async () => {
    const amount = parseFloat(document.getElementById("currencyAmount")?.value || 0);
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
    } catch (e) {
      result.textContent = "❌ Failed to get rates";
      console.error("Currency error:", e);
    }
  });
}

// === CLOUDCONVERT INTEGRATION ===
const apiKey = "YOUR_API_KEY_HERE"; // Replace with your real CloudConvert key

function startCloudConvertJob(file, inputFormat, outputFormat, resultEl) {
  if (!file || !resultEl) return;
  resultEl.textContent = "⏳ Uploading & converting...";

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
        "export-my-file": { operation: "export/url", input: "convert-my-file" }
      }
    }),
  })
  .then(res => res.json())
  .then(job => checkCloudJob(job.data.id, resultEl))
  .catch(err => {
    resultEl.textContent = "❌ Error creating job";
    console.error(err);
  });
}

function checkCloudJob(jobId, resultEl) {
  fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
    headers: { Authorization: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZjA3ZDA3N2E3NzQzMTQ0YzFkYWE2OWI5NzM5NDg5NmExNTI5NzYxMWU2MGMzMDc1ZWQxOTIwYWIwMDkwMGU4YTM5YTJiYmNlYzNjYTAxMDMiLCJpYXQiOjE3NjE0NzY1NTcuMzExMzg0LCJuYmYiOjE3NjE0NzY1NTcuMzExMzg2LCJleHAiOjQ5MTcxNTAxNTcuMzA3NzQxLCJzdWIiOiI3MzI5MzQyOCIsInNjb3BlcyI6WyJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIl19.W4JR69t4p6StMrZyC8B3PpJzTO6Dw-X1jtXb6V_-Uz62tWLtdOP5-snkInbOlEkdMO2A4Ph9pVNhgJu8-oMbyvOkcXYMmJbL-VznoCLcDfJuaexVZjC07LTJxTzAP1RP5NA2MSRZF1lNRMeuWGlun5ljXzCb5kERmFD-eLczE7878w8F2cff7vDKQAB3lt8Enk3tK0i6_HdcttxI749HbobZ28afEmXOgXHIeXYKUo-0vpMB1VPUgB1U6HDfRX29oF_li-6KjqwnGHQZ3VgD525BGY6o5IFZHsDEhaJO79sQaFMzAQ1jMN8OVDNbfkCPtfPg71Adkp4ofMuEd6fKh6qkwv2_xDttbItsmLSn-G1SyrTHYAa00M5ko1au-2o8YU9eBIiDmXOgHTSwash35FpnGNuXvSEbtpwdUaZYmfENCQgemkkZgvuMMoB9WBHfShbKdcGyNgGh7Z1aVli0_Cxi2G_wjhBp-OWqulpLJbqIrlQZftJEc-a97Eo2GcZiUYdIIz_UGHBfnBBDg0ahHxpJ-isQOmtmwUItwCj3uwHsrJ43RA-Nw2Yc4hVxDaCV8wfMiywuP6YYTKoubdkEC6J2GLCTl2sychQNC4N6IMHXFLVZ5Mq9XQp2QD221_-5Mdaw5Uy_ZXPMLGfIRYJyVpNwf05jWBrSV3mbayHUtlQ },
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
  .catch(err => {
    resultEl.textContent = "❌ Error checking job";
    console.error(err);
  });
}

// === IMAGE CONVERTER ===
function convertImage() {
  const file = document.getElementById("imageFile")?.files[0];
  const format = document.getElementById("imageFormat")?.value;
  const result = document.getElementById("imageResult");
  if (!file || !format || !result) return;
  startCloudConvertJob(file, file.name.split(".").pop(), format, result);
}

// === DOC ➜ PDF ===
function convertDocToPDF() {
  const file = document.getElementById("docFile")?.files[0];
  const result = document.getElementById("docToPdfResult");
  if (!file || !result) return;
  startCloudConvertJob(file, file.name.split(".").pop(), "pdf", result);
}

// === PDF ➜ DOC ===
function convertPdfToDoc() {
  const file = document.getElementById("pdfFile")?.files[0];
  const format = document.getElementById("pdfOutputFormat")?.value;
  const result = document.getElementById("pdfToDocResult");
  if (!file || !result) return;
  startCloudConvertJob(file, "pdf", format, result);
}

console.log("✅ Script loaded complete");

