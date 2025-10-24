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
