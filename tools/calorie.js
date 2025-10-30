// ==========================================
// Calorie Calculator Script (v2)
// ==========================================
Connect calorie calculator to Render API

// ✅ Backend endpoint on Render
const apiUrl = "https://convert-labs.onrender.com/api/calories";

// === UI Elements ===
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

// === Mode Switching ===
photoBtn.addEventListener("click", () => {
  manualSection.style.display = "none";
  photoSection.style.display = "block";
});
manualBtn.addEventListener("click", () => {
  photoSection.style.display = "none";
  manualSection.style.display = "block";
});

// === Preview Uploaded Photo ===
photoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.style.maxWidth = "200px";
  img.style.borderRadius = "8px";
  photoPreview.innerHTML = "";
  photoPreview.appendChild(img);
});

// === Analyze Photo (send to backend) ===
analyzeBtn.addEventListener("click", async () => {
  const file = photoInput.files[0];
  if (!file) return alert("Please upload a meal photo first.");
  const formData = new FormData();
  formData.append("image", file);

  photoResult.textContent = "Analyzing image...";
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    photoResult.textContent = `Estimated total: 🍽️ ${data.calories} kcal (${data.description || "meal"})`;
  } catch (err) {
    console.error(err);
    photoResult.textContent = "❌ Could not analyze photo. Please try again later.";
  }
});

// === Manual Entry Section ===
const sampleCalories = {
  "rice": 1.3,
  "cooked rice": 1.3,
  "chicken breast": 1.65,
  "steak": 2.5,
  "potato": 0.77,
  "broccoli": 0.34,
  "salad": 0.2,
  "pasta": 1.31,
  "egg": 1.55,
  "milk": 0.64,
  "butter": 7.17,
  "bread": 2.65,
  "cheese": 4.02
};

function addIngredientRow(name = "", grams = "") {
  const row = document.createElement("div");
  row.style.margin = "5px";
  row.innerHTML = `
    <input type="text" placeholder="Ingredient (e.g., rice)" value="${name}">
    <input type="number" placeholder="Weight (g)" value="${grams}">
    <button class="removeBtn">❌</button>
  `;
  row.querySelector(".removeBtn").addEventListener("click", () => row.remove());
  ingredientList.appendChild(row);
}

// Add default example rows
addIngredientRow("steak", 200);
addIngredientRow("cooked rice", 150);

addIngredientBtn.addEventListener("click", () => addIngredientRow());

calcCaloriesBtn.addEventListener("click", () => {
  const rows = ingredientList.querySelectorAll("div");
  let total = 0;
  rows.forEach(r => {
    const name = r.querySelector("input[type='text']").value.trim().toLowerCase();
    const grams = parseFloat(r.querySelector("input[type='number']").value) || 0;
    if (sampleCalories[name]) {
      total += sampleCalories[name] * grams;
    }
  });
  manualResult.textContent = `Total Calories: ${Math.round(total)} kcal`;
});
