// ==========================================
// Calorie Calculator — GitHub Edition (AllOrigins Proxy + Smart Fallback)
// ==========================================

// === DOM Elements ===
const photoBtn = document.getElementById("photoModeBtn");
const manualBtn = document.getElementById("manualModeBtn");
const photoSection = document.getElementById("photoSection");
const manualSection = document.getElementById("manualSection");
const photoInput = document.getElementById("mealPhoto");
const analyzeBtn = document.getElementById("analyzePhotoBtn");
const photoPreview = document.getElementById("photoPreview");
const photoResult = document.getElementById("photoResult");
const addIngredientBtn = document.getElementById("addIngredientBtn");
const calcCaloriesBtn = document.getElementById("calculateCaloriesBtn");
const manualResult = document.getElementById("manualResult");
const ingredientList = document.getElementById("ingredientList");

// ✅ Paste your Calorie Ninjas key inside the quotes
const CALORIE_NINJAS_KEY = "CY71CYQzW/IPaj4uZ7adgw==ZVWd8maEsi8V5Rri";

// === Mode switching ===
photoBtn.onclick = () => {
  manualSection.style.display = "none";
  photoSection.style.display = "block";
};
manualBtn.onclick = () => {
  photoSection.style.display = "none";
  manualSection.style.display = "block";
};

// === Preview uploaded image + ask for food name ===
photoInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.id = "previewImg";
  img.style.maxWidth = "240px";
  img.style.borderRadius = "8px";
  photoPreview.innerHTML = "";
  photoPreview.appendChild(img);

  let guess = file.name.split(".")[0].replace(/[-_]/g, " ");
  // Ignore useless numeric names
  if (/^\d+$/.test(guess) || guess.toLowerCase().startsWith("img")) guess = "";

  photoResult.innerHTML = `
    <label>What food is in this photo?</label><br>
    <input id="foodNameInput" value="${guess}" 
      placeholder="e.g., chicken and potato, pizza, salad"
      style="padding:6px;border-radius:6px;width:220px;">
  `;
};

// === Analyze using Calorie Ninjas + fallback ===
analyzeBtn.onclick = async () => {
  const input = document.getElementById("foodNameInput");
  if (!input) return alert("Please upload a photo first.");
  let query = input.value.trim();
  if (!query || /^\d+$/.test(query)) query = "chicken and rice";

  showSpinner("Analyzing nutrition data…");

  const data = await getCaloriesFromNinjas(query);
  if (data && data.length) {
    displayNutrition(data, "Calorie Ninjas");
    return;
  }

  const fallback = await getFromOpenFoodFacts(query);
  if (fallback) displayNutrition([fallback], "Open Food Facts");
  else photoResult.innerHTML = `⚠️ No data found for <b>${query}</b>. Try another name.`;
};

// === Spinner animation ===
function showSpinner(text) {
  photoResult.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:40px;height:40px;border:4px solid #ddd;border-top-color:#1e40af;
      border-radius:50%;animation:spin 1s linear infinite;margin:10px 0;"></div>
      <p>${text}</p>
    </div>`;
}
const style = document.createElement("style");
style.textContent = "@keyframes spin {from{transform:rotate(0deg)}to{transform:rotate(360deg)}}";
document.head.appendChild(style);

// === Calorie Ninjas via AllOrigins Proxy (CORS-safe) ===
async function getCaloriesFromNinjas(food) {
  try {
    const proxyUrl = "https://api.allorigins.win/get?url=";
    const targetUrl = `https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(food)}`;

    const res = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
      headers: { "X-Api-Key": CALORIE_NINJAS_KEY },
    });

    if (!res.ok) throw new Error("Proxy or API error");

    const wrapped = await res.json();
    const arr = JSON.parse(wrapped.contents);

    if (!arr || !arr.length) return null;

    // Handle multiple foods: sum their values
    const combined = arr.reduce(
      (acc, f) => ({
        name: (acc.name ? acc.name + ", " : "") + f.name,
        calories: acc.calories + (f.calories || 0),
        protein: acc.protein + (f.protein_g || 0),
        carbs: acc.carbs + (f.carbohydrates_total_g || 0),
        fat: acc.fat + (f.fat_total_g || 0),
      }),
      { name: "", calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return [combined];
  } catch (err) {
    console.warn("Ninjas API failed", err);
    return null;
  }
}

// === Open Food Facts fallback ===
async function getFromOpenFoodFacts(food) {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(food)}&search_simple=1&action=process&json=1`
    );
    const data = await res.json();
    if (!data.products?.length) return null;

    const p = data.products[0];
    return {
      name: p.product_name || food,
      calories: p.nutriments["energy-kcal_100g"] || 0,
      protein: p.nutriments.proteins_100g || 0,
      carbs: p.nutriments.carbohydrates_100g || 0,
      fat: p.nutriments.fat_100g || 0,
    };
  } catch (err) {
    console.warn("Open Food Facts failed", err);
    return null;
  }
}

// === Display nutrition results ===
function displayNutrition(items, source) {
  if (!items.length) {
    photoResult.innerHTML = "⚠️ No nutrition info available.";
    return;
  }

  const item = items[0];
  photoResult.innerHTML = `
    <h3>${item.name}</h3>
    <p>Calories: ${item.calories.toFixed(0)} kcal</p>
    <p>Protein: ${item.protein.toFixed(1)} g</p>
    <p>Carbs: ${item.carbs.toFixed(1)} g</p>
    <p>Fat: ${item.fat.toFixed(1)} g</p>
    <p style="font-size:12px;color:gray;">Source: ${source}</p>
  `;
}

// === Manual input mode ===
function addIngredientRow(name = "", grams = "") {
  const row = document.createElement("div");
  row.style.margin = "5px";
  row.innerHTML = `
    <input type="text" placeholder="Ingredient" value="${name}">
    <input type="number" placeholder="Weight (g)" value="${grams}">
    <button class="removeBtn">❌</button>`;
  row.querySelector(".removeBtn").onclick = () => row.remove();
  ingredientList.appendChild(row);
}

addIngredientRow("chicken", 150);
addIngredientRow("rice", 100);

addIngredientBtn.onclick = () => addIngredientRow();
calcCaloriesBtn.onclick = () => {
  const rows = ingredientList.querySelectorAll("div");
  let total = 0;
  rows.forEach((r) => {
    const g = parseFloat(r.querySelector("input[type='number']").value) || 0;
    total += g * 1.3;
  });
  manualResult.textContent = `Total Calories: ${Math.round(total)} kcal`;
};
