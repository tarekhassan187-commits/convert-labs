// ----------------------
// Section Toggle System
// ----------------------
function showSection(id) {
  document.querySelectorAll('.content-section').forEach(sec => sec.style.display = 'none');
  document.getElementById(id).style.display = 'block';
}

// ----------------------
// Converter Tabs System
// ----------------------
function showConverter(type) {
  let content = document.getElementById("converter-content");
  let html = "";

  if (type === "length") {
    html = `
      <h3>Length Converter</h3>
      <input type="number" id="lengthValue" placeholder="Enter value">
      <select id="fromLength">
        <option>Meter</option>
        <option>Kilometer</option>
        <option>Centimeter</option>
        <option>Millimeter</option>
        <option>Micrometer</option>
        <option>Nanometer</option>
        <option>Yard</option>
        <option>Foot</option>
        <option>Inch</option>
        <option>Lightyear</option>
      </select>
      <select id="toLength">
        <option>Meter</option>
        <option>Kilometer</option>
        <option>Centimeter</option>
        <option>Millimeter</option>
        <option>Micrometer</option>
        <option>Nanometer</option>
        <option>Yard</option>
        <option>Foot</option>
        <option>Inch</option>
        <option>Lightyear</option>
      </select>
      <button onclick="convertLength()">Convert</button>
      <p id="lengthResult"></p>
    `;
  }

  else if (type === "temperature") {
    html = `
      <h3>Temperature Converter</h3>
      <input type="number" id="tempValue" placeholder="Enter value">
      <select id="fromTemp">
        <option>Celsius</option>
        <option>Fahrenheit</option>
        <option>Kelvin</option>
      </select>
      <select id="toTemp">
        <option>Celsius</option>
        <option>Fahrenheit</option>
        <option>Kelvin</option>
      </select>
      <button onclick="convertTemperature()">Convert</button>
      <p id="tempResult"></p>
    `;
  }

  else if (type === "volume") {
    html = `
      <h3>Volume Converter</h3>
      <input type="number" id="volumeValue" placeholder="Enter value">
      <select id="fromVolume">
        <option>Liter</option>
        <option>Milliliter</option>
        <option>Cubic meter</option>
        <option>Cubic centimeter</option>
      </select>
      <select id="toVolume">
        <option>Liter</option>
        <option>Milliliter</option>
        <option>Cubic meter</option>
        <option>Cubic centimeter</option>
      </select>
      <button onclick="convertVolume()">Convert</button>
      <p id="volumeResult"></p>
    `;
  }

  else if (type === "container") {
    html = `
      <h3>Container Volume Calculator</h3>
      <label><input type="radio" name="shape" id="rect" checked> Rectangular</label>
      <label><input type="radio" name="shape" id="cyl"> Cylindrical</label><br><br>
      <input type="number" id="length" placeholder="Length (cm)">
      <input type="number" id="width" placeholder="Width (cm)">
      <input type="number" id="height" placeholder="Height (cm)"><br><br>
      <select id="liquid" onchange="toggleCustomDensity()">
        <option value="1">Water (1 g/cm³)</option>
        <option value="0.92">Oil (0.92 g/cm³)</option>
        <option value="1.03">Milk (1.03 g/cm³)</option>
        <option value="1.2">Honey (1.2 g/cm³)</option>
        <option value="custom">Custom</option>
      </select>
      <input type="number" id="customDensity" placeholder="Custom density" style="display:none;">
      <button onclick="calculateContainer()">Calculate</button>
      <p id="containerResult"></p>
    `;
  }

  else if (type === "kitchen") {
    html = `
      <h3>Kitchen Converter</h3>
      <input type="number" id="kitchenValue" placeholder="Enter value">
      <select id="fromKitchen">
        <option>Teaspoon</option>
        <option>Tablespoon</option>
        <option>Cup</option>
      </select>
      <select id="ingredient">
        <option>Flour</option>
        <option>Sugar</option>
        <option>Salt</option>
        <option>Oil</option>
        <option>Milk</option>
        <option>Water</option>
        <option>Rice</option>
        <option>Butter</option>
        <option>Honey</option>
        <option>Ground Spices</option>
      </select>
      <button onclick="convertKitchen()">Convert</button>
      <p id="kitchenResult"></p>
    `;
  }

  content.innerHTML = html;
}

// ----------------------
// Conversion Functions
// ----------------------
function convertLength() {
  const value = parseFloat(document.getElementById("lengthValue").value);
  const from = document.getElementById("fromLength").value;
  const to = document.getElementById("toLength").value;

  const units = {
    Meter: 1,
    Kilometer: 1000,
    Centimeter: 0.01,
    Millimeter: 0.001,
    Micrometer: 1e-6,
    Nanometer: 1e-9,
    Yard: 0.9144,
    Foot: 0.3048,
    Inch: 0.0254,
    Lightyear: 9.461e15
  };

  const result = (value * units[from]) / units[to];
  document.getElementById("lengthResult").textContent = `${result.toLocaleString()} ${to}`;
}

function convertTemperature() {
  const value = parseFloat(document.getElementById("tempValue").value);
  const from = document.getElementById("fromTemp").value;
  const to = document.getElementById("toTemp").value;
  let result = value;

  if (from === "Celsius" && to === "Fahrenheit") result = value * 9/5 + 32;
  else if (from === "Celsius" && to === "Kelvin") result = value + 273.15;
  else if (from === "Fahrenheit" && to === "Celsius") result = (value - 32) * 5/9;
  else if (from === "Fahrenheit" && to === "Kelvin") result = (value - 32) * 5/9 + 273.15;
  else if (from === "Kelvin" && to === "Celsius") result = value - 273.15;
  else if (from === "Kelvin" && to === "Fahrenheit") result = (value - 273.15) * 9/5 + 32;

  document.getElementById("tempResult").textContent = `${result.toFixed(2)} ${to}`;
}

function convertVolume() {
  const value = parseFloat(document.getElementById("volumeValue").value);
  const from = document.getElementById("fromVolume").value;
  const to = document.getElementById("toVolume").value;

  const units = {
    "Liter": 1,
    "Milliliter": 0.001,
    "Cubic meter": 1000,
    "Cubic centimeter": 0.001
  };

  const result = (value * units[from]) / units[to];
  document.getElementById("volumeResult").textContent = `${result.toLocaleString()} ${to}`;
}

// ----------------------
// Container Volume
// ----------------------
function toggleCustomDensity() {
  const liquid = document.getElementById("liquid").value;
  const customInput = document.getElementById("customDensity");
  customInput.style.display = (liquid === "custom") ? "inline-block" : "none";
}

function calculateContainer() {
  const isRect = document.getElementById("rect").checked;
  const length = parseFloat(document.getElementById("length").value);
  const width = parseFloat(document.getElementById("width").value);
  const height = parseFloat(document.getElementById("height").value);
  const liquidSelect = document.getElementById("liquid").value;
  const density = (liquidSelect === "custom") ? parseFloat(document.getElementById("customDensity").value) : parseFloat(liquidSelect);

  let volume_cm3;
  if (isRect) {
    volume_cm3 = length * width * height;
  } else {
    volume_cm3 = Math.PI * Math.pow(width / 2, 2) * height;
  }

  const volume_liters = volume_cm3 / 1000;
  const weight_grams = volume_cm3 * density;

  document.getElementById("containerResult").textContent = 
    `Volume: ${volume_liters.toFixed(3)} L — Weight: ${weight_grams.toFixed(1)} g`;
}

// ----------------------
// Kitchen Converter
// ----------------------
function convertKitchen() {
  const value = parseFloat(document.getElementById("kitchenValue").value);
  const from = document.getElementById("fromKitchen").value;
  const ingredient = document.getElementById("ingredient").value;

  const toMl = { Teaspoon: 5, Tablespoon: 15, Cup: 240 };
  const densities = {
    Flour: 0.53, Sugar: 0.85, Salt: 1.2, Oil: 0.92, Milk: 1.03,
    Water: 1, Rice: 0.85, Butter: 0.96, Honey: 1.4, "Ground Spices": 0.56
  };

  const ml = value * toMl[from];
  const grams = ml * densities[ingredient];

  document.getElementById("kitchenResult").textContent = 
    `${grams.toFixed(1)} grams of ${ingredient}`;
}

// ----------------------
// Visitor Counter
// ----------------------
fetch('https://api.countapi.xyz/hit/convertlabs.online/visits')
  .then(response => response.json())
  .then(data => {
    document.getElementById('visit-count').textContent = data.value.toLocaleString();
  })
  .catch(() => {
    document.getElementById('visit-count').textContent = 'N/A';
  });
