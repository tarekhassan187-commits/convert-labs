// === PAGE INITIALIZATION ===
window.addEventListener("load", () => {
  document.getElementById("loading-screen").style.display = "none";
  document.getElementById("app").style.display = "block";
  initializeConverters();
});

// === THEME TOGGLE ===
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const mode = document.body.classList.contains("dark") ? "🌞" : "🌙";
  document.getElementById("themeToggle").textContent = mode;
});

// === TAB SWITCHER ===
function showConverter(id) {
  document.querySelectorAll(".converter").forEach(c => c.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// === UNIT CONVERTERS ===
function initializeConverters() {
  // Length units
  const lengthUnits = { m: 1, cm: 100, mm: 1000, km: 0.001, inch: 39.37, ft: 3.281, yard: 1.094, mile: 0.0006214 };
  populateSelects("lengthFrom", "lengthTo", lengthUnits);

  // Temperature units
  const tempUnits = ["Celsius", "Fahrenheit", "Kelvin"];
  populateSelects("tempFrom", "tempTo", tempUnits);

  // Volume units
  const volumeUnits = { L: 1, mL: 1000, "cm³": 1000, "m³": 0.001, gallon: 0.264, pint: 2.113 };
  populateSelects("volumeFrom", "volumeTo", volumeUnits);

  // Kitchen units
  const kitchenUnits = ["tsp", "tbsp", "cup", "g", "ml", "oz"];
  populateSelects("kitchenFrom", "kitchenTo", kitchenUnits);

  const kitchenIngredients = [
    "Water", "Milk", "Oil", "Flour", "Sugar", "Butter", "Honey", "Rice",
    "Salt", "Baking Powder", "Yogurt", "Cocoa Powder", "Corn Syrup", "Peanut Butter"
  ];
  const ingredientSelect = document.getElementById("kitchenIngredient");
  kitchenIngredients.forEach(i => {
    const opt = document.createElement("option");
    opt.value = i.toLowerCase();
    opt.textContent = i;
    ingredientSelect.appendChild(opt);
  });

  // Currency list (major + regional)
  const currencyList = ["USD", "EUR", "GBP", "EGP", "AED", "SAR", "KWD", "QAR", "OMR", "BHD", "SGD", "INR", "JPY", "CAD", "AUD"];
  populateSelects("currencyFrom", "currencyTo", currencyList);

  // Event for container shape toggle
  document.getElementById("containerType").addEventListener("change", e => {
    const type = e.target.value;
    document.getElementById("boxInputs").style.display = type === "box" ? "block" : "none";
    document.getElementById("cylinderInputs").style.display = type === "cylinder" ? "block" : "none";
  });

  document.getElementById("liquidType").addEventListener("change", e => {
    document.getElementById("customDensity").style.display = e.target.value === "custom" ? "block" : "none";
  });
}

// === POPULATE DROPDOWNS ===
function populateSelects(id1, id2, data) {
  const from = document.getElementById(id1);
  const to = document.getElementById(id2);
  for (const key in data) {
    const opt1 = document.createElement("option");
    const opt2 = document.createElement("option");
    opt1.value = opt2.value = key;
    opt1.textContent = opt2.textContent = key;
    from.appendChild(opt1);
    to.appendChild(opt2);
  }
}

// === LENGTH CONVERSION ===
function convertLength() {
  const v = parseFloat(document.getElementById("lengthInput").value);
  const f = document.getElementById("lengthFrom").value;
  const t = document.getElementById("lengthTo").value;
  const rates = { m: 1, cm: 100, mm: 1000, km: 0.001, inch: 39.37, ft: 3.281, yard: 1.094, mile: 0.0006214 };
  const result = (v / rates[f]) * rates[t];
  document.getElementById("lengthResult").textContent = `${v} ${f} = ${result.toFixed(3)} ${t}`;
}

// === TEMPERATURE CONVERSION ===
function convertTemperature() {
  const v = parseFloat(document.getElementById("tempInput").value);
  const f = document.getElementById("tempFrom").value;
  const t = document.getElementById("tempTo").value;
  let result = v;
  if (f === "Celsius" && t === "Fahrenheit") result = (v * 9) / 5 + 32;
  else if (f === "Fahrenheit" && t === "Celsius") result = ((v - 32) * 5) / 9;
  else if (f === "Celsius" && t === "Kelvin") result = v + 273.15;
  else if (f === "Kelvin" && t === "Celsius") result = v - 273.15;
  else if (f === "Fahrenheit" && t === "Kelvin") result = ((v - 32) * 5) / 9 + 273.15;
  else if (f === "Kelvin" && t === "Fahrenheit") result = ((v - 273.15) * 9) / 5 + 32;
  document.getElementById("tempResult").textContent = `${v}° ${f} = ${result.toFixed(2)}° ${t}`;
}

// === VOLUME CONVERSION ===
function convertVolume() {
  const v = parseFloat(document.getElementById("volumeInput").value);
  const f = document.getElementById("volumeFrom").value;
  const t = document.getElementById("volumeTo").value;
  const units = { L: 1, mL: 1000, "cm³": 1000, "m³": 0.001, gallon: 0.264, pint: 2.113 };
  const result = (v / units[f]) * units[t];
  document.getElementById("volumeResult").textContent = `${v} ${f} = ${result.toFixed(3)} ${t}`;
}

// === CONTAINER VOLUME ===
function calculateContainerVolume() {
  const type = document.getElementById("containerType").value;
  const liquid = document.getElementById("liquidType").value;
  const densityMap = { water: 1, milk: 1.03, oil: 0.92, honey: 1.42 };
  let density = liquid === "custom" ? parseFloat(document.getElementById("customDensity").value) : densityMap[liquid];

  let volume = 0;
  if (type === "box") {
    const l = parseFloat(document.getElementById("lengthBox").value);
    const w = parseFloat(document.getElementById("widthBox").value);
    const h = parseFloat(document.getElementById("heightBox").value);
    volume = l * w * h;
  } else {
    const r = parseFloat(document.getElementById("radiusCylinder").value);
    const h = parseFloat(document.getElementById("heightCylinder").value);
    volume = Math.PI * r * r * h;
  }

  const mass = volume * density;
  document.getElementById("containerResult").textContent = `Volume: ${volume.toFixed(2)} cm³ | Mass: ${mass.toFixed(2)} g`;
}

// === KITCHEN CONVERTER ===
function convertKitchen() {
  const value = parseFloat(document.getElementById("kitchenInput").value);
  const from = document.getElementById("kitchenFrom").value;
  const to = document.getElementById("kitchenTo").value;
  const conversions = { tsp: 1, tbsp: 0.333, cup: 0.021, ml: 4.93, g: 5, oz: 0.17 };
  const result = (value / conversions[from]) * conversions[to];
  document.getElementById("kitchenResult").textContent = `${value} ${from} = ${result.toFixed(2)} ${to}`;
}

// === CURRENCY CONVERTER ===
async function convertCurrency() {
  const amount = parseFloat(document.getElementById("currencyAmount").value);
  const from = document.getElementById("currencyFrom").value;
  const to = document.getElementById("currencyTo").value;
  const resultField = document.getElementById("currencyResult");

  try {
    const res = await fetch(`https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`);
    const data = await res.json();
    resultField.textContent = `${amount} ${from} = ${data.result.toFixed(2)} ${to}`;
  } catch {
    resultField.textContent = "⚠️ Unable to fetch exchange rates.";
  }
}

// === FILE CONVERTERS (ConvertAPI) ===
async function convertFile(file, fromFormat, toFormat) {
  const status = document.getElementById("conversionStatus");
  status.textContent = "⏳ Uploading file...";

  const formData = new FormData();
  formData.append("File", file);

  try {
    const response = await fetch(`https://v2.convertapi.com/convert/${fromFormat}/to/${toFormat}?Secret=demo`, {
      method: "POST",
      body: formData
    });
    const data = await response.json();

    if (data.Files && data.Files.length > 0) {
      const downloadUrl = data.Files[0].Url;
      status.innerHTML = `✅ Conversion complete — <a href="${downloadUrl}" target="_blank">Download</a>`;
    } else {
      status.textContent = "⚠️ Conversion failed. Please try again.";
    }
  } catch (error) {
    console.error("Conversion Error:", error);
    status.textContent = "❌ Error during conversion. Please try again.";
  }
}

// === IMAGE, PDF, DOC EVENTS ===
document.getElementById("imageConvertBtn")?.addEventListener("click", async () => {
  const file = document.getElementById("imageFile").files[0];
  const format = document.getElementById("imageFormat").value;
  if (!file) return alert("Please select an image file.");
  await convertFile(file, file.name.split('.').pop(), format);
});

document.getElementById("docToPdfBtn")?.addEventListener("click", async () => {
  const file = document.getElementById("docFile").files[0];
  if (!file) return alert("Please select a document file.");
  await convertFile(file, "docx", "pdf");
});

document.getElementById("pdfToDocBtn")?.addEventListener("click", async () => {
  const file = document.getElementById("pdfFile").files[0];
  if (!file) return alert("Please select a PDF file.");
  await convertFile(file, "pdf", "docx");
});
