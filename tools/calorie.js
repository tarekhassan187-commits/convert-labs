// ==========================================
// Calorie Calculator — Food-101 (Optimized Free Edition)
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

let model = null; // will load lazily

// ==============================
// MODE SWITCHING
// ==============================
photoBtn.onclick = () => {
  manualSection.style.display = "none";
  photoSection.style.display = "block";
};
manualBtn.onclick = () => {
  photoSection.style.display = "none";
  manualSection.style.display = "block";
};

// ==============================
// IMAGE PREVIEW + COMPRESSION
// ==============================
photoInput.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Create preview
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.id = "previewImg";
  img.style.maxWidth = "240px";
  img.style.borderRadius = "8px";
  photoPreview.innerHTML = "";
  photoPreview.appendChild(img);

  // Compress/rescale image before analysis (keep under 800 px)
  const compressed = await compressImage(file, 800);
  img.dataset.compressed = URL.createObjectURL(compressed);
};

// Compress uploaded photo for faster inference
async function compressImage(file, maxSize) {
  const img = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) =>
    canvas.toBlob(
      (b) => resolve(new File([b], file.name, { type: "image/jpeg" })),
      "image/jpeg",
      0.8
    )
  );
}

// ==============================
// MODEL LOADING (lazy)
// ==============================
async function loadModel() {
  photoResult.innerHTML = "⏳ Loading Food-101 model (first use)…";
  model = await tf.loadGraphModel(
    "https://tfhub.dev/google/food_classifier/1",
    { fromTFHub: true }
  );
  photoResult.innerHTML = "";
}

// ==============================
// ANALYZE PHOTO
// ==============================
analyzeBtn.onclick = async () => {
  const file = photoInput.files[0];
  if (!file) return alert("Please upload a meal photo first.");

  // Lazy-load the model on first use
  if (!model) await loadModel();

  // Wait a moment so UI updates before heavy work
  await new Promise((r) => setTimeout(r, 100));

  photoResult.innerHTML = "🔍 Analyzing image…";

  const imgEl = document.getElementById("previewImg");
  const src = imgEl.dataset.compressed || imgEl.src;
  const img = await createImageBitmap(await fetch(src).then((r) => r.blob()));
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 224;
  canvas.height = 224;
  ctx.drawImage(img, 0, 0, 224, 224);

  const tensor = tf.browser.fromPixels(canvas)
    .toFloat()
    .div(255)
    .expandDims();

  const preds = await model.predict(tensor).data();
  const topIdx = preds.indexOf(Math.max(...preds));
  const foodName = FOOD_CLASSES[topIdx] || "food";

  photoResult.innerHTML = `🍽 <b>${foodName}</b><br>Fetching nutrition info…`;
  fetchNutrition(foodName);
};

// ==============================
// FETCH NUTRITION DATA (Free USDA API)
// ==============================
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

// ==============================
// MANUAL INPUT MODE (same logic)
// ==============================
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

// ==============================
// SHORT FOOD-101 LABEL MAP
// ==============================
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
