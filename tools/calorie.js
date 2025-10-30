// ==========================================
// Calorie Calculator — Food-101 Offline Edition
// ==========================================

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

let model;

// ===== Load Food-101 TF.js model =====
async function loadModel() {
  photoResult.innerHTML = "⏳ Loading Food-101 model...";
  // hosted community TF.js model converted from Food-101 (mobile-optimized)
  model = await tf.loadGraphModel(
    "https://tfhub.dev/google/food_classifier/1",
    { fromTFHub: true }
  );
  photoResult.innerHTML = "";
}
loadModel();

// ===== Switch modes =====
photoBtn.onclick = () => {
  manualSection.style.display = "none";
  photoSection.style.display = "block";
};
manualBtn.onclick = () => {
  photoSection.style.display = "none";
  manualSection.style.display = "block";
};

// ===== Preview uploaded image =====
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
};

// ===== Analyze image locally =====
analyzeBtn.onclick = async () => {
  const file = photoInput.files[0];
  if (!file) return alert("Please upload a meal photo first.");
  if (!model) return alert("Model not ready yet, please wait a few seconds.");

  const imgEl = document.getElementById("previewImg");
  const tensor = tf.browser.fromPixels(imgEl)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .div(255)
    .expandDims();

  const preds = await model.predict(tensor).data();
  const topIdx = preds.indexOf(Math.max(...preds));
  const foodName = FOOD_CLASSES[topIdx] || "food";

  photoResult.innerHTML = `🍽 <b>${foodName}</b><br>Fetching nutrition info...`;
  fetchNutrition(foodName);
};

// ===== Fetch nutrition from FoodData Central =====
async function fetchNutrition(foodName) {
  try {
    const apiKey = "DEMO_KEY"; // replace with your free key from fdc.nal.usda.gov
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
      foodName
    )}&pageSize=1&api_key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    const food = data.foods?.[0];
    if (!food) throw new Error("No nutrition found");

    const nutrients = {};
    food.foodNutrients.forEach((n) => (nutrients[n.nutrientName] = n.value));

    photoResult.innerHTML = `
      <h3>${food.description}</h3>
      <p>Calories: ${nutrients["Energy"] || 0} kcal</p>
      <p>Protein: ${nutrients["Protein"] || 0} g</p>
      <p>Carbs: ${nutrients["Carbohydrate, by difference"] || 0} g</p>
      <p>Fat: ${nutrients["Total lipid (fat)"] || 0} g</p>`;
  } catch (err) {
    console.error(err);
    photoResult.innerHTML =
      "⚠️ Unable to get nutrition data. Try manual input instead.";
  }
}

// ===== Manual input (same as before) =====
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

// ===== Food-101 label list (short version for demo) =====
const FOOD_CLASSES = [
  "apple pie","baby back ribs","baklava","beef carpaccio","beef tartare",
  "beet salad","beignets","bibimbap","bread pudding","breakfast burrito",
  "bruschetta","caesar salad","cheesecake","chicken curry","chicken quesadilla",
  "chicken wings","chocolate cake","chocolate mousse","clam chowder","club sandwich",
  "crab cakes","creme brulee","cup cakes","deviled eggs","donuts","dumplings",
  "edamame","eggs benedict","falafel","filet mignon","fish and chips","foie gras",
  "french fries","french onion soup","french toast","fried calamari","fried rice",
  "frozen yogurt","garlic bread","gnocchi","greek salad","grilled cheese sandwich",
  "grilled salmon","guacamole","gyoza","hamburger","hot and sour soup","hot dog",
  "huevos rancheros","ice cream","lasagna","lobster bisque","lobster roll sandwich",
  "macaroni and cheese","macarons","miso soup","mussels","nachos","omelet",
  "onion rings","oysters","pad thai","paella","pancakes","panna cotta","peking duck",
  "pho","pizza","pork chop","poutine","prime rib","pulled pork sandwich","ramen",
  "ravioli","red velvet cake","risotto","samosa","sashimi","scallops","seaweed salad",
  "shrimp and grits","spaghetti bolognese","spaghetti carbonara","spring rolls",
  "steak","strawberry shortcake","sushi","tacos","takoyaki","tiramisu","tuna tartare",
  "waffles"
];
