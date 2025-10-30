// ==========================================
// Calorie Calculator — Fast Free API Edition
// With Smart Auto-Guess + Dropdown
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

// === Your free API key from https://api-ninjas.com/profile
const CALORIE_NINJAS_KEY = "CY71CYQzW/IPaj4uZ7adgw==ZVWd8maEsi8V5Rri";

// === Common food dropdown suggestions ===
const COMMON_FOODS = [
  "pizza","burger","pasta","rice","salad","sushi","sandwich","chicken",
  "steak","fish","tacos","fries","ice cream","cake","curry","soup","eggs",
  "bread","pancakes","falafel","shawarma","kebab","noodles","burrito","wrap"
];

// === Mode switching ===
photoBtn.onclick = () => {
  manualSection.style.display = "none";
  photoSection.style.display = "block";
};
manualBtn.onclick = () => {
  photoSection.style.display = "none";
  manualSection.style.display = "block";
};

// === Preview uploaded image and get guess ===
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

  // Try to guess from file name if meaningful
  let guess = file.name.split(".")[0].replace(/[-_]/g, " ").trim().toLowerCase();
  if (/^(img|pxl|dsc|photo|202|jpg|jpeg|png|\d+|\W)/i.test(guess)) guess = "";

  // Build a dropdown list
  const dropdown = COMMON_FOODS.map(
    (f) => `<option value="${f}">${f}</option>`
  ).join("");

  photoResult.innerHTML = `
    <label style="display:block;margin-top:10px;">What food is in this photo?</label>
    <input id="foodNameInput" list="foodList" value="${guess}" 
      placeholder="e.g., pizza, salad, rice" 
      style="padding:6px;border-radius:6px;width:220px;">
    <datalist id="foodList">${dropdown}</datalist>
  `;
};

// === Analyze with Calorie Ninjas + Open Food Facts fallback ===
analyzeBtn.onclick = async () => {
  const input = document.getElementById("foodNameInput");
  if (!input) return alert("Please upload a photo first.");
  const query = input.value.trim();
  if (!query) return alert("Please enter or choose the food name.");

  showSpinner("Analyzing nutrition data…");

  const data = await getCaloriesFromNinjas(query);
  if (data) return displayNutrition(data, "Calorie Ninjas");

  const fallback = await getFromOpenFoodFacts(query);
  if (fallback) displayNutrition(fallback, "Open Food Facts");
  else photoResult.innerHTML = `⚠️ No data found for <b>${query}</b>. Try another name.`;
};

// === Spinner ===
function showSpinner(text) {
  photoResult.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:40px;height:40px;border:4px solid #ddd;border-top-color:#1e40af;border-radius:50%;animation:spin 1s linear infinite;margin:10px 0;"></div>
      <p>${text}</p>
    </div>
  `;
}
const style = document.createElement("style");
style.textContent = "@keyframes spin {from{transform:rotate(0deg)}to{transform:rotate(360deg)}}";
document.head.appendChild(style);

// === Calorie Ninjas API ===
async function getCaloriesFromNinjas(food) {
  try {
    const res = await fetch(
      `https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(food)}`,
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
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        food
      )}&search_simple=1&action=process&json=1`
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

// === Display Nutrition Results ===
function displayNutrition(data, source) {
  photoResult.innerHTML = `
    <h3>${data.name}</h3>
    <p>Calories: ${data.calories.toFixed(0)} kcal</p>
    <p>Protein: ${data.protein.toFixed(1)} g</p>
    <p>Carbs: ${data.carbs.toFixed(1)} g</p>
    <p>Fat: ${data.fat.toFixed(1)} g</p>
    <p style="font-size:12px;color:gray;">Source: ${source}</p>
  `;
}

// === Manual Input Mode (unchanged) ===
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
