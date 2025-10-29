document.addEventListener("DOMContentLoaded", () => {
  const photoModeBtn = document.getElementById("photoMode");
  const manualModeBtn = document.getElementById("manualMode");
  const photoSection = document.getElementById("photoSection");
  const manualSection = document.getElementById("manualSection");
  const mealPhoto = document.getElementById("mealPhoto");
  const photoPreview = document.getElementById("photoPreview");
  const photoResult = document.getElementById("photoResult");
  const analyzePhotoBtn = document.getElementById("analyzePhoto");
  const ingredientList = document.getElementById("ingredientList");
  const addIngredientBtn = document.getElementById("addIngredient");
  const calculateCaloriesBtn = document.getElementById("calculateCalories");
  const calorieResult = document.getElementById("calorieResult");

  // Default calorie data per 100g
  const foodCalories = {
    "rice": 130,
    "chicken breast": 165,
    "beef": 250,
    "fish": 190,
    "bread": 265,
    "egg": 155,
    "milk": 60,
    "banana": 89,
    "apple": 52,
    "olive oil": 884,
    "potato": 77,
    "butter": 717,
    "cheese": 402,
    "yogurt": 59,
    "sugar": 387,
    "honey": 304
  };

  // Toggle modes
  photoModeBtn.addEventListener("click", () => {
    photoSection.style.display = "block";
    manualSection.style.display = "none";
  });

  manualModeBtn.addEventListener("click", () => {
    photoSection.style.display = "none";
    manualSection.style.display = "block";
  });

  // Show photo preview
  mealPhoto.addEventListener("change", () => {
    const file = mealPhoto.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      photoPreview.innerHTML = `<img src="${e.target.result}" alt="Meal photo" style="max-width:250px; border-radius:10px; box-shadow:0 0 5px #ccc;">`;
    };
    reader.readAsDataURL(file);
  });

  // Fake photo analysis (for now)
  analyzePhotoBtn.addEventListener("click", () => {
    if (!mealPhoto.files[0]) {
      photoResult.textContent = "Please upload a meal photo first.";
      return;
    }
    photoResult.textContent = "Analyzing photo... (demo mode)";
    setTimeout(() => {
      photoResult.textContent = "Estimated total: 🍛 ~550 kcal (e.g., rice + chicken + salad)";
    }, 1500);
  });

  // Add manual ingredient row
  addIngredientBtn.addEventListener("click", () => {
    const row = document.createElement("div");
    row.className = "ingredient-row";
    row.style.marginBottom = "0.5rem";
    row.innerHTML = `
      <input type="text" class="ingredient-name" placeholder="Ingredient (e.g. rice)">
      <input type="number" class="ingredient-weight" placeholder="Weight (g)" min="1">
      <button type="button" class="remove-btn">❌</button>
    `;
    row.querySelector(".remove-btn").addEventListener("click", () => row.remove());
    ingredientList.appendChild(row);
  });

  // Calculate total calories
  calculateCaloriesBtn.addEventListener("click", () => {
    const rows = ingredientList.querySelectorAll(".ingredient-row");
    if (!rows.length) {
      calorieResult.textContent = "Please add at least one ingredient.";
      return;
    }

    let total = 0;
    rows.forEach(r => {
      const name = r.querySelector(".ingredient-name").value.trim().toLowerCase();
      const weight = parseFloat(r.querySelector(".ingredient-weight").value) || 0;
      const cals = foodCalories[name] || 0;
      total += (cals * weight) / 100;
    });

    calorieResult.innerHTML = `<strong>Total Calories:</strong> ${total.toFixed(0)} kcal`;
  });
});

