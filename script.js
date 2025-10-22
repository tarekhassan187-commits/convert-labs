/* === Convert Labs JavaScript === */

/* === Loading Screen Fade === */
window.addEventListener("load", function() {
  const loading = document.getElementById("loading-screen");
  setTimeout(() => {
    loading.classList.add("fade-out");
    setTimeout(() => {
      loading.style.display = "none";
    }, 1000); // matches the CSS fade duration
  }, 500); // small delay to ensure smooth fade
});


/* === Tab Switching === */
const buttons = document.querySelectorAll(".tab-button");
const tabs = document.querySelectorAll(".tab-content");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabId = btn.getAttribute("data-tab");
    tabs.forEach((tab) => tab.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
  });
});

/* === Dark / Light Mode === */
const modeToggle = document.getElementById("mode-toggle");
modeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  modeToggle.textContent = document.body.classList.contains("dark") ? "🌞" : "🌙";
});

/* === LENGTH CONVERTER === */
function convertLength() {
  const value = parseFloat(document.getElementById("lengthInput").value);
  const from = document.getElementById("lengthFrom").value;
  const to = document.getElementById("lengthTo").value;
  const result = document.getElementById("lengthResult");

  if (isNaN(value)) {
    result.textContent = "Please enter a number.";
    return;
  }

  const factors = {
    meter: 1,
    kilometer: 1000,
    centimeter: 0.01,
    millimeter: 0.001,
    micrometer: 1e-6,
    nanometer: 1e-9,
    mile: 1609.34,
    yard: 0.9144,
    foot: 0.3048,
    inch: 0.0254,
    lightyear: 9.461e15,
  };

  const meters = value * factors[from];
  const converted = meters / factors[to];

  result.textContent = `${value} ${from} = ${converted.toLocaleString(undefined, {
    maximumFractionDigits: 6,
  })} ${to}`;
}

/* === TEMPERATURE CONVERTER === */
function convertTemperature() {
  const value = parseFloat(document.getElementById("tempInput").value);
  const from = document.getElementById("tempFrom").value;
  const to = document.getElementById("tempTo").value;
  const result = document.getElementById("tempResult");

  if (isNaN(value)) {
    result.textContent = "Please enter a number.";
    return;
  }

  let celsius;
  if (from === "C") celsius = value;
  else if (from === "F") celsius = (value - 32) * (5 / 9);
  else celsius = value - 273.15;

  let output;
  if (to === "C") output = celsius;
  else if (to === "F") output = celsius * (9 / 5) + 32;
  else output = celsius + 273.15;

  result.textContent = `${value}°${from} = ${output.toFixed(2)}°${to}`;
}

/* === VOLUME CONVERTER === */
function convertVolume() {
  const value = parseFloat(document.getElementById("volInput").value);
  const from = document.getElementById("volFrom").value;
  const to = document.getElementById("volTo").value;
  const result = document.getElementById("volResult");

  if (isNaN(value)) {
    result.textContent = "Please enter a number.";
    return;
  }

  const liters = {
    liter: 1,
    milliliter: 0.001,
    gallon: 3.78541,
    quart: 0.946353,
    pint: 0.473176,
    cup: 0.24,
  };

  const inLiters = value * liters[from];
  const converted = inLiters / liters[to];

  result.textContent = `${value} ${from} = ${converted.toLocaleString(undefined, {
    maximumFractionDigits: 6,
  })} ${to}`;
}

/* === CONTAINER VOLUME CALCULATOR === */
const shapeRadios = document.querySelectorAll("input[name='shape']");
shapeRadios.forEach((r) =>
  r.addEventListener("change", () => {
    document.getElementById("rectInputs").style.display =
      r.value === "rectangular" ? "block" : "none";
    document.getElementById("cylInputs").style.display =
      r.value === "cylindrical" ? "block" : "none";
  })
);

document.getElementById("liquidType").addEventListener("change", (e) => {
  document.getElementById("customDensity").style.display =
    e.target.value === "custom" ? "block" : "none";
});

function calculateContainerVolume() {
  const shape = document.querySelector("input[name='shape']:checked").value;
  const liquid = document.getElementById("liquidType").value;
  const result = document.getElementById("containerResult");

  let density = 1;
  if (liquid === "milk") density = 1.03;
  else if (liquid === "oil") density = 0.92;
  else if (liquid === "honey") density = 1.42;
  else if (liquid === "custom")
    density = parseFloat(document.getElementById("customDensity").value) || 1;

  let volumeCm3 = 0;

  if (shape === "rectangular") {
    const L = parseFloat(document.getElementById("lengthDim").value);
    const W = parseFloat(document.getElementById("widthDim").value);
    const H = parseFloat(document.getElementById("heightDim").value);
    if (isNaN(L) || isNaN(W) || isNaN(H)) {
      result.textContent = "Please fill all dimensions.";
      return;
    }
    volumeCm3 = L * W * H;
  } else {
    const R = parseFloat(document.getElementById("radiusDim").value);
    const H = parseFloat(document.getElementById("heightCyl").value);
    if (isNaN(R) || isNaN(H)) {
      result.textContent = "Please fill all dimensions.";
      return;
    }
    volumeCm3 = Math.PI * R * R * H;
  }

  const volumeLiters = volumeCm3 / 1000;
  const massGrams = volumeCm3 * density;

  result.textContent = `Volume: ${volumeLiters.toFixed(
    2
  )} L, Mass: ${massGrams.toFixed(2)} g`;
}

/* === KITCHEN CONVERTER === */
function convertKitchen() {
  const value = parseFloat(document.getElementById("kitchenInput").value);
  const unit = document.getElementById("kitchenUnit").value;
  const ingredient = document.getElementById("ingredient").value;
  const result = document.getElementById("kitchenResult");

  if (isNaN(value)) {
    result.textContent = "Please enter a number.";
    return;
  }

  // Densities (grams per milliliter)
  const densities = {
    flour: 0.53,
    sugar: 0.85,
    salt: 1.2,
    oil: 0.92,
    milk: 1.03,
    water: 1.0,
    butter: 0.96,
    rice: 0.85,
    honey: 1.42,
    spices: 0.5,
  };

  // Unit to milliliter
  const unitML = {
    teaspoon: 4.93,
    tablespoon: 14.79,
    cup: 240,
    ml: 1,
  };

  const volumeML = value * unitML[unit];
  const weightG = volumeML * densities[ingredient];

  result.textContent = `${value} ${unit} of ${ingredient} ≈ ${weightG.toFixed(
    1
  )} g`;
}

