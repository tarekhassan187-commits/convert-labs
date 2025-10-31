// ==========================================
// Calorie Calculator — GitHub Edition (CORS Proxy + Fallback + Manual Input)
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

  const guess = file.name.split(".")[0].replace(/[-_]/g, " ");
  photoResult.innerHTML = `
    <label>What food is in this photo?</label><br>
    <input id="foodNameInput" value="${guess}" 
      placeholder="e.g., pizza, salad, rice" 
      style="padding:6px;border-radius:6px;width:220px;">
  `;
};

// === Analyze using Calorie Ninjas + fallback to Open Food Facts ===
analyzeBtn.onclick = async () => {
  const input = document.getElementById("foodNameInput");
  if (!input) return alert("Please upload a photo first.");
  const query = input.value.trim();
  if (!query) return alert("Please enter or type the food name.");

  showSpinner("Analyzing nutrition data…");

  const data = await getCaloriesFromNinjas(query);
  if (data) return displayNutrition(data, "Calorie Ninjas");

  const fallback = await getFromOpenFoodFacts(query);
  if (fallback) displayNutrition(fallback, "Open Food Facts");
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

// === Call Calorie Ninjas via free CORS proxy ===
async function getCaloriesFromNinjas(food) {
  try {
    const res = await fetch(
      `https://corsproxy.io/?https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(food)}`,
      { headers: { "X-Api-Key": CALORIE_NINJAS_KEY } }
    );

    if (!res.ok) throw new Error("API error");
    const arr = await res.json();
    if (!arr || !arr.length) return null;

    const item = arr[0];
    return {
      name: item.name,
      calories: item.calories,
      protein: item.protein_g,
      carbs: item.carbohydrates_total_g,
      fat: item.fat_total_g,
    };
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

// === Display result ===
function displayNutrition(data, source) {
  photoResult.innerHTML = `
    <h3>${data.name}</h3>
    <p>Calories: ${data.calories.toFixed(0)} kcal</p>
    <p>Protein: ${data.protein.toFixed(1)} g</p>
    <p>Carbs: ${data.carbs.toFixed(1)} g</p>
    <p>Fat: ${data.fat.toFixed(1)} g</p>
    <p style="font-size:12px;color:gray;">Source: ${source}</p>`;
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
