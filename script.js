// 🌐 Splash Screen
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loading-screen").style.display = "none";
    document.getElementById("app").style.display = "block";
  }, 800);
});

// 🔹 Show selected converter tab
function showConverter(id) {
  document.querySelectorAll(".converter").forEach(el => el.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// 🔹 Theme Toggle
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("themeToggle");
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

  // ✅ Populate kitchen unit dropdowns safely
  const kitchenFrom = document.getElementById("kitchenFrom");
  const kitchenTo = document.getElementById("kitchenTo");
  const units = ["cup", "tbsp", "tsp", "g", "oz", "lb", "ml"];
  if (kitchenFrom && kitchenTo) {
    units.forEach(u => {
      kitchenFrom.add(new Option(u, u));
      kitchenTo.add(new Option(u, u));
    });
  }
});

// 🔹 Length Converter
const lengthUnits = {
  m: 1, km: 1000, cm: 0.01, mm: 0.001, µm: 1e-6, nm: 1e-9,
  yd: 0.9144, ft: 0.3048, in: 0.0254, mi: 1609.34
};
for (const u in lengthUnits) {
  lengthFrom.add(new Option(u, u));
  lengthTo.add(new Option(u, u));
}
function convertLength() {
  const val = parseFloat(lengthInput.value);
  if (isNaN(val)) return alert("Please enter a number");
  const res = (val * lengthUnits[lengthFrom.value]) / lengthUnits[lengthTo.value];
  lengthResult.textContent = `${val} ${lengthFrom.value} = ${res.toLocaleString()} ${lengthTo.value}`;
}

// 🔹 Temperature Converter
const temps = ["C", "F", "K"];
temps.forEach(t => {
  tempFrom.add(new Option(t, t));
  tempTo.add(new Option(t, t));
});
function convertTemperature() {
  const v = parseFloat(tempInput.value), f = tempFrom.value, t = tempTo.value;
  if (isNaN(v)) return alert("Please enter a number");
  let r = v;
  if (f === "C" && t === "F") r = v * 9 / 5 + 32;
  else if (f === "F" && t === "C") r = (v - 32) * 5 / 9;
  else if (f === "C" && t === "K") r = v + 273.15;
  else if (f === "K" && t === "C") r = v - 273.15;
  else if (f === "F" && t === "K") r = (v - 32) * 5 / 9 + 273.15;
  else if (f === "K" && t === "F") r = (v - 273.15) * 9 / 5 + 32;
  tempResult.textContent = `${v}°${f} = ${r.toFixed(2)}°${t}`;
}

// 🔹 Volume Converter
const volumeUnits = {
  "Liter (L)": 1,
  "Milliliter (mL)": 0.001,
  "Cubic meter (m³)": 1000,
  "Cubic centimeter (cm³)": 0.001,
  "Cubic inch (in³)": 0.0163871,
  "Cubic foot (ft³)": 28.3168,
  "US gallon (gal US)": 3.78541,
  "UK gallon (gal UK)": 4.54609
};
for (const k in volumeUnits) {
  volumeFrom.add(new Option(k, k));
  volumeTo.add(new Option(k, k));
}
function convertVolume() {
  const val = parseFloat(volumeInput.value);
  if (isNaN(val)) return alert("Please enter a number");
  const res = (val * volumeUnits[volumeFrom.value]) / volumeUnits[volumeTo.value];
  volumeResult.textContent = `${val} ${volumeFrom.value} = ${res.toLocaleString()} ${volumeTo.value}`;
}

// 🔹 Container Volume Calculator
containerType.onchange = () => {
  boxInputs.style.display = containerType.value === "box" ? "block" : "none";
  cylinderInputs.style.display = containerType.value === "cylinder" ? "block" : "none";
};
liquidType.onchange = () => {
  customDensity.style.display = liquidType.value === "custom" ? "block" : "none";
};
function calculateContainerVolume() {
  let v = 0;
  if (containerType.value === "box") {
    const l = +lengthBox.value, w = +widthBox.value, h = +heightBox.value;
    if ([l, w, h].some(isNaN)) return alert("Please enter all dimensions");
    v = l * w * h;
  } else {
    const r = +radiusCylinder.value, h = +heightCylinder.value;
    if ([r, h].some(isNaN)) return alert("Please enter radius and height");
    v = Math.PI * r * r * h;
  }

  const d = liquidType.value === "custom"
    ? +customDensity.value
    : { water: 1, milk: 1.03, oil: 0.92, honey: 1.42 }[liquidType.value];

  if (isNaN(d)) return alert("Please enter a valid density");
  containerResult.textContent = `Volume: ${(v / 1000).toFixed(3)} L | Mass: ${(v * d).toFixed(1)} g`;
}

// 🔹 Kitchen Converter (uses HTML ingredient list)
function convertKitchen() {
  const val = parseFloat(document.getElementById("kitchenInput").value);
  const from = document.getElementById("kitchenFrom").value;
  const to = document.getElementById("kitchenTo").value;
  const ingr = document.getElementById("kitchenIngredient").value;
  const resultText = document.getElementById("kitchenResult");

  if (isNaN(val)) return alert("Please enter an amount");
  if (!from || !to) return alert("Please select both units");
  if (!ingr) return alert("Please select an ingredient");

  const weightMap = {
    Flour: 120, Sugar: 200, "Brown Sugar": 220, "Powdered Sugar": 120,
    Salt: 292, "Baking Powder": 230, "Cocoa Powder": 100, Rice: 195,
    Oats: 90, "Corn Starch": 128, Water: 240, Milk: 245, Oil: 218,
    Butter: 227, Honey: 340, "Soya Sauce": 230, Vanilla: 208, Yogurt: 250,
    Cream: 240, Almonds: 95, Walnuts: 100, Peanuts: 145, "Sunflower Seeds": 140,
    Sesame: 135, Cashew: 120, Yeast: 90, "Chocolate Chips": 170,
    "Peanut Butter": 270, "Tomato Paste": 260, "Coconut Flakes": 100,
    "Ground Coffee": 90
  };

  const gPerCup = weightMap[ingr] || 240;
  const unitToCup = { cup: 1, tbsp: 1 / 16, tsp: 1 / 48, g: 1 / gPerCup, oz: 1 / (gPerCup / 8), lb: 1 / (gPerCup / 454), ml: 1 / 240 };
  const cupToUnit = { cup: 1, tbsp: 16, tsp: 48, g: gPerCup, oz: gPerCup / 8, lb: gPerCup / 454, ml: 240 };

  const result = val * unitToCup[from] * cupToUnit[to];
  resultText.textContent = `${val} ${from} of ${ingr} = ${result.toFixed(2)} ${to}`;
}


// === IMAGE UPSCALER ===
const fileInput = document.getElementById("imageInput");
const upscaleBtn = document.getElementById("upscaleBtn");
const scaleSelect = document.getElementById("scaleSelect");
const errorMsg = document.getElementById("errorMsg");
const originalImage = document.getElementById("originalImage");
const upscaledImage = document.getElementById("upscaledImage");
const previewContainer = document.getElementById("previewContainer");
const downloadBtn = document.getElementById("downloadBtn");
const zoomToggleBtn = document.getElementById("zoomToggleBtn");
const splitPreview = document.getElementById("splitPreview");
const overlay = document.getElementById("splitOverlay");
const handle = document.getElementById("splitHandle");
const zoomCanvas = document.getElementById("zoomCanvas");
const zctx = zoomCanvas.getContext("2d");

let selectedFile, upscaler, dragging = false, zoomEnabled = false;

// Load selected image
fileInput.addEventListener("change", e => {
  selectedFile = e.target.files[0];
  if (selectedFile) {
    const reader = new FileReader();
    reader.onload = () => {
      originalImage.src = reader.result;
      previewContainer.style.display = "none";
      errorMsg.textContent = "";
    };
    reader.readAsDataURL(selectedFile);
  }
});

// Upscale logic
upscaleBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    errorMsg.textContent = "Please choose an image first.";
    return;
  }
  errorMsg.textContent = "Upscaling... please wait ⏳";

  const scale = parseInt(scaleSelect.value);
  try {
    const imageBitmap = await createImageBitmap(selectedFile);
    const canvas = document.createElement("canvas");
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageBitmap, 0, 0);

    upscaler = new window.Realesrgan({ scale: scale >= 8 ? 4 : scale, model: "x4" });
    let upscaled = await upscaler.upscale(canvas);

    // For 8x upscale, do two passes (4x then 2x)
    if (scale === 8) {
      const img2 = new Image();
      img2.src = upscaled;
      await img2.decode();
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = img2.width;
      tempCanvas.height = img2.height;
      tempCanvas.getContext("2d").drawImage(img2, 0, 0);
      upscaler = new window.Realesrgan({ scale: 2, model: "x2" });
      upscaled = await upscaler.upscale(tempCanvas);
    }

    upscaledImage.src = upscaled;
    previewContainer.style.display = "block";
    errorMsg.textContent = "";
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "⚠️ Error upscaling. Try smaller size or lower scale.";
  }
});

// === SPLIT SLIDER LOGIC ===
let draggingSlider = false;

handle.addEventListener("mousedown", () => draggingSlider = true);
window.addEventListener("mouseup", () => draggingSlider = false);
window.addEventListener("mousemove", e => {
  if (!draggingSlider) return;
  const rect = splitPreview.getBoundingClientRect();
  let pos = ((e.clientX - rect.left) / rect.width) * 100;
  pos = Math.max(0, Math.min(100, pos));
  overlay.style.width = pos + "%";
  handle.style.left = pos + "%";
});

// Touch support
handle.addEventListener("touchstart", () => draggingSlider = true);
window.addEventListener("touchend", () => draggingSlider = false);
window.addEventListener("touchmove", e => {
  if (!draggingSlider) return;
  const touch = e.touches[0];
  const rect = splitPreview.getBoundingClientRect();
  let pos = ((touch.clientX - rect.left) / rect.width) * 100;
  pos = Math.max(0, Math.min(100, pos));
  overlay.style.width = pos + "%";
  handle.style.left = pos + "%";
});

// === DOWNLOAD ===
downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = upscaledImage.src;
  link.download = "upscaled-image.png";
  link.click();
});

// === ZOOM VIEW ===
zoomToggleBtn.addEventListener("click", () => {
  zoomEnabled = !zoomEnabled;
  zoomCanvas.style.display = zoomEnabled ? "block" : "none";
  zoomToggleBtn.textContent = zoomEnabled ? "❌ Close Zoom" : "🔍 Zoom View";
  if (zoomEnabled) initializeZoom();
});

function initializeZoom() {
  const img = new Image();
  img.src = upscaledImage.src;
  img.onload = () => {
    zoomCanvas.width = img.width;
    zoomCanvas.height = img.height;
    zctx.drawImage(img, 0, 0);
  };

  function drawZoom(x, y) {
    const size = 150, zoomFactor = 2;
    const zoomSize = size / zoomFactor;
    zctx.clearRect(0, 0, zoomCanvas.width, zoomCanvas.height);
    zctx.drawImage(img, 0, 0);
    zctx.save();
    zctx.beginPath();
    zctx.arc(x, y, size / 2, 0, Math.PI * 2);
    zctx.clip();
    zctx.drawImage(
      img,
      x - zoomSize / 2, y - zoomSize / 2, zoomSize, zoomSize,
      x - size / 2, y - size / 2, size, size
    );
    zctx.restore();
    zctx.strokeStyle = "#1e40af";
    zctx.lineWidth = 2;
    zctx.beginPath();
    zctx.arc(x, y, size / 2, 0, Math.PI * 2);
    zctx.stroke();
  }

  zoomCanvas.addEventListener("mousemove", e => {
    if (!zoomEnabled) return;
    const rect = zoomCanvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * img.width;
    const y = ((e.clientY - rect.top) / rect.height) * img.height;
    drawZoom(x, y);
  });

  zoomCanvas.addEventListener("touchmove", e => {
    if (!zoomEnabled) return;
    const touch = e.touches[0];
    const rect = zoomCanvas.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * img.width;
    const y = ((touch.clientY - rect.top) / rect.height) * img.height;
    drawZoom(x, y);
  });
}




