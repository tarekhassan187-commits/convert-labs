// 🌐 Initialize After Full Page Load
window.addEventListener("load", () => {
  // Hide splash after short delay
  setTimeout(() => {
    const loading = document.getElementById("loading-screen");
    const app = document.getElementById("app");
    if (loading) loading.style.display = "none";
    if (app) app.style.display = "block";
  }, 1000);

  // Initialize app logic after visible
  initApp();
});

function initApp() {
  // 🔹 Tab Switching
  window.showConverter = function (id) {
    document.querySelectorAll(".converter").forEach(el => el.classList.remove("active"));
    const target = document.getElementById(id);
    if (target) target.classList.add("active");
  };

  // 🔹 Theme Toggle
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

  // 🔹 Length Converter
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

  // 🔹 Temperature Converter
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

  // 🔹 Volume Converter
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

  // 🔹 Container Volume Calculator
  if (window.containerType) {
    containerType.onchange = () => {
      boxInputs.style.display = containerType.value === "box" ? "block" : "none";
      cylinderInputs.style.display = containerType.value === "cylinder" ? "block" : "none";
    };
    liquidType.onchange = () => {
      customDensity.style.display = liquidType.value === "custom" ? "block" : "none";
    };
  }
  window.calculateContainerVolume = function () {
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
  };

  // 🔹 Kitchen Converter
  const kitchenUnits = ["cup", "tbsp", "tsp", "g", "oz", "lb", "ml"];
  if (window.kitchenFrom && window.kitchenTo) {
    kitchenUnits.forEach(u => {
      kitchenFrom.add(new Option(u, u));
      kitchenTo.add(new Option(u, u));
    });
  }
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
  if (window.kitchenIngredient) {
    for (const group in ingredientGroups) {
      const og = document.createElement("optgroup");
      og.label = group;
      for (const item in ingredientGroups[group]) {
        og.appendChild(new Option(item, item));
      }
      kitchenIngredient.appendChild(og);
    }
  }
  window.convertKitchen = function () {
    const val = parseFloat(kitchenInput.value);
    if (isNaN(val)) return alert("Enter a number");
    const from = kitchenFrom.value, to = kitchenTo.value, ingr = kitchenIngredient.value;
    const gPerCup = Object.values(ingredientGroups)
      .flatMap(obj => Object.entries(obj))
      .find(([k]) => k === ingr)[1];
    const unitToCup = { cup: 1, tbsp: 1 / 16, tsp: 1 / 48, g: 1 / gPerCup, oz: 1 / (gPerCup / 8), lb: 1 / (gPerCup / 454), ml: 1 / 240 };
    const cupToUnit = { cup: 1, tbsp: 16, tsp: 48, g: gPerCup, oz: gPerCup / 8, lb: gPerCup / 454, ml: 240 };
    const result = val * unitToCup[from] * cupToUnit[to];
    kitchenResult.textContent = `${val} ${from} of ${ingr} = ${result.toFixed(2)} ${to}`;
  };

  // 🔹 About / Contact Popups
  if (window.aboutLink && window.contactLink) {
    aboutLink.onclick = e => { e.preventDefault(); aboutModal.style.display = "block"; };
    closeAbout.onclick = () => aboutModal.style.display = "none";
    contactLink.onclick = e => { e.preventDefault(); contactModal.style.display = "block"; };
    closeContact.onclick = () => contactModal.style.display = "none";
    window.onclick = e => {
      if (e.target === aboutModal) aboutModal.style.display = "none";
      if (e.target === contactModal) contactModal.style.display = "none";
    };
  }

  // 🔹 Formspree Submission
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async e => {
      e.preventDefault();
      const form = e.target;
      const formMessage = document.getElementById("formMessage");
      try {
        const response = await fetch(form.action, {
          method: form.method,
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (response.ok) {
          formMessage.textContent = "✅ Message sent successfully!";
          form.reset();
        } else {
          formMessage.textContent = "⚠️ Error sending message. Please try again.";
        }
      } catch {
        formMessage.textContent = "⚠️ Network error. Please check your connection.";
      }
    });
  }
  const apiKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZjA3ZDA3N2E3NzQzMTQ0YzFkYWE2OWI5NzM5NDg5NmExNTI5NzYxMWU2MGMzMDc1ZWQxOTIwYWIwMDkwMGU4YTM5YTJiYmNlYzNjYTAxMDMiLCJpYXQiOjE3NjE0NzY1NTcuMzExMzg0LCJuYmYiOjE3NjE0NzY1NTcuMzExMzg2LCJleHAiOjQ5MTcxNTAxNTcuMzA3NzQxLCJzdWIiOiI3MzI5MzQyOCIsInNjb3BlcyI6WyJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIl19.W4JR69t4p6StMrZyC8B3PpJzTO6Dw-X1jtXb6V_-Uz62tWLtdOP5-snkInbOlEkdMO2A4Ph9pVNhgJu8-oMbyvOkcXYMmJbL-VznoCLcDfJuaexVZjC07LTJxTzAP1RP5NA2MSRZF1lNRMeuWGlun5ljXzCb5kERmFD-eLczE7878w8F2cff7vDKQAB3lt8Enk3tK0i6_HdcttxI749HbobZ28afEmXOgXHIeXYKUo-0vpMB1VPUgB1U6HDfRX29oF_li-6KjqwnGHQZ3VgD525BGY6o5IFZHsDEhaJO79sQaFMzAQ1jMN8OVDNbfkCPtfPg71Adkp4ofMuEd6fKh6qkwv2_xDttbItsmLSn-G1SyrTHYAa00M5ko1au-2o8YU9eBIiDmXOgHTSwash35FpnGNuXvSEbtpwdUaZYmfENCQgemkkZgvuMMoB9WBHfShbKdcGyNgGh7Z1aVli0_Cxi2G_wjhBp-OWqulpLJbqIrlQZftJEc-a97Eo2GcZiUYdIIz_UGHBfnBBDg0ahHxpJ-isQOmtmwUItwCj3uwHsrJ43RA-Nw2Yc4hVxDaCV8wfMiywuP6YYTKoubdkEC6J2GLCTl2sychQNC4N6IMHXFLVZ5Mq9XQp2QD221_-5Mdaw5Uy_ZXPMLGfIRYJyVpNwf05jWBrSV3mbayHUtlQ";

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
              result.innerHTML = `✅ Conversion complete! <a href="${url}" target="_blank">Download Image</a>`;
            } else if (data.data.status === "error") {
              result.textContent = "❌ Conversion failed.";
            } else setTimeout(checkJob, 3000);
          });
      };
      checkJob();
    })
    .catch(() => (result.textContent = "❌ Error during conversion."));
}

// 🔹 Document → PDF Converter
function convertDocToPDF() {
  const file = document.getElementById("docFile").files[0];
  const result = document.getElementById("docToPdfResult");
  if (!file) return alert("Please select a file.");
  result.textContent = "⏳ Converting...";
  // identical upload/convert logic with output_format: "pdf"
}

// 🔹 PDF → Document Converter
function convertPdfToDoc() {
  const file = document.getElementById("pdfFile").files[0];
  const format = document.getElementById("pdfOutputFormat").value;
  const result = document.getElementById("pdfToDocResult");
  if (!file) return alert("Please select a PDF.");
  result.textContent = "⏳ Converting...";
  // identical upload/convert logic with input_format: "pdf", output_format: format
}

// 🌍 Currency Converter
document.addEventListener("DOMContentLoaded", () => {
  const fromCurrency = document.getElementById("fromCurrency");
  const toCurrency = document.getElementById("toCurrency");
  const currencyResult = document.getElementById("currencyResult");

  // Supported currencies — expanded list (includes EGP, KWD, AED, SGD)
  const currencies = [
    "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "EGP",
    "AED", "SAR", "KWD", "QAR", "BHD", "OMR", "SGD", "ZAR"
  ];

  // Fill dropdowns
  currencies.forEach(code => {
    const opt1 = new Option(code, code);
    const opt2 = new Option(code, code);
    fromCurrency.add(opt1);
    toCurrency.add(opt2);
  });

  // Set defaults
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

    currencyResult.textContent = "⏳ Fetching latest rates...";

    try {
      // Use a free API for real-time currency rates
      const response = await fetch(`https://api.exchangerate.host/convert?from=${from}&to=${to}`);
      const data = await response.json();

      if (!data.result) {
        throw new Error("No conversion data found");
      }

      const converted = (amount * data.result).toFixed(3);
      currencyResult.innerHTML = `💱 ${amount} ${from} = <strong>${converted} ${to}</strong>`;
    } catch (error) {
      console.error(error);
      currencyResult.textContent = "❌ Unable to fetch exchange rates.";
    }
  });
});

  // 🔹 Visitor Counter
  fetch("https://api.countapi.xyz/hit/convertlabs.online/visits")
    .then(r => r.json())
    .then(d => {
      if (window.visitorCount) visitorCount.textContent = d.value.toLocaleString();
    })
    .catch(() => {
      if (window.visitorCount) visitorCount.textContent = "N/A";
    });
}

