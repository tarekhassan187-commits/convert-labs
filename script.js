function showSection(id) {
  document.querySelectorAll(".converter-section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// LENGTH
const lengthFactors = {
  km: 1000, m: 1, cm: 0.01, mm: 0.001, um: 1e-6, nm: 1e-9,
  yd: 0.9144, ft: 0.3048, in: 0.0254, ly: 9.461e15
};
function convertLength() {
  const val = parseFloat(lengthInput.value);
  const result = val * lengthFactors[lengthFrom.value] / lengthFactors[lengthTo.value];
  lengthResult.textContent = `${val} ${lengthFrom.value} = ${result.toLocaleString()} ${lengthTo.value}`;
}

// TEMPERATURE
function convertTemperature() {
  let val = parseFloat(tempInput.value);
  let from = tempFrom.value, to = tempTo.value, result = val;
  if (from === "C" && to === "F") result = val * 9/5 + 32;
  else if (from === "F" && to === "C") result = (val - 32) * 5/9;
  else if (from === "C" && to === "K") result = val + 273.15;
  else if (from === "K" && to === "C") result = val - 273.15;
  else if (from === "F" && to === "K") result = (val - 32) * 5/9 + 273.15;
  else if (from === "K" && to === "F") result = (val - 273.15) * 9/5 + 32;
  tempResult.textContent = `${val}°${from} = ${result.toFixed(2)}°${to}`;
}

// VOLUME
const volumeFactors = { L: 1, mL: 0.001, m3: 1000 };
function convertVolume() {
  const val = parseFloat(volumeInput.value);
  const result = val * volumeFactors[volumeFrom.value] / volumeFactors[volumeTo.value];
  volumeResult.textContent = `${val} ${volumeFrom.value} = ${result.toLocaleString()} ${volumeTo.value}`;
}

// CONTAINER
function toggleShapeInputs() {
  document.getElementById("rectangularInputs").style.display =
    containerShape.value === "rectangular" ? "block" : "none";
  document.getElementById("cylinderInputs").style.display =
    containerShape.value === "cylindrical" ? "block" : "none";
}
function toggleCustomDensity() {
  document.getElementById("customDensity").style.display =
    liquidType.value === "custom" ? "inline-block" : "none";
}
function calculateContainerVolume() {
  let volume = 0;
  if (containerShape.value === "rectangular") {
    let L = +lengthBox.value, W = +widthBox.value, H = +heightBox.value;
    volume = L * W * H; // cm³
  } else {
    let r = +radius.value, h = +heightCylinder.value;
    volume = Math.PI * r * r * h;
  }
  let density = {
    water: 1, milk: 1.03, oil: 0.92, honey: 1.4
  }[liquidType.value] || parseFloat(customDensity.value) || 1;
  const mass = volume * density;
  containerResult.textContent = `Volume: ${volume.toFixed(2)} cm³ | Mass: ${mass.toFixed(2)} g`;
}

// KITCHEN
const kitchenData = {
  flour: { cup: 120, tbsp: 7.5, tsp: 2.5 },
  sugar: { cup: 200, tbsp: 12.5, tsp: 4.2 },
  salt: { cup: 273, tbsp: 18, tsp: 6 },
  oil: { cup: 220, tbsp: 14, tsp: 4.6 },
  milk: { cup: 240, tbsp: 15, tsp: 5 },
  water: { cup: 240, tbsp: 15, tsp: 5 },
  spices: { cup: 80, tbsp: 5, tsp: 1.6 }
};
function convertKitchen() {
  const val = parseFloat(kitchenInput.value);
  const unit = kitchenUnit.value;
  const ingr = ingredient.value;
  const grams = val * kitchenData[ingr][unit];
  kitchenResult.textContent = `${val} ${unit}(s) of ${ingr} = ${grams.toFixed(1)} g`;
}

// VISITOR COUNTER (CountAPI)
fetch("https://api.countapi.xyz/hit/convertlabs.online/visits")
  .then(res => res.json())
  .then(data => document.getElementById("visitorCount").textContent = data.value.toLocaleString());
