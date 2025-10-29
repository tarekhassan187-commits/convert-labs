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

  // Your free Calorie Mama API key (get one at https://developer.azumio.com)
  const CALORIE_MAMA_API = 2b09c6ac3688ea052f4692860de3aff8;

  // Default calorie data for manual entry (per 100g)
  const foodCalories = {
    "rice": 130,
    "chicken breast": 165,
    "steak": 250,
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

  // Toggle between modes
  photoModeBtn.addEventListener("click", () => {
    photoSection.style.display = "block";
    manualSection.style.display = "none";
  });

  manualModeBtn.addEventListener("click", () => {
    photoSection.style.display = "none";
    manualSection.style.display = "block";
  });

  // Photo preview
  mealPhoto.addEventListener("change", () => {
    const file = mealPhoto.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      photoPreview.innerHTML = `<img src="${e.target.result}" alt="Meal photo" style="max-width:250px; border-radius:10px; box-shadow:0 0 5px #ccc;">`;
    };
    reader.readAsDataURL(file);
  });

  // Analyze photo with Calorie Mama API
  analyzePhotoBtn.addEventListener("click", async () => {
    if (!mealPhoto.files[0]) {
      photoResult.textContent = "Please upload a meal photo first.";
      return;
    }

    if (!CALORIE_MAMA_API || CALORIE_MAMA_API === 2b09c6ac3688ea052f4692860de3aff8) {
      photoResult.innerHTML = "⚠️ Automatic photo analysis requires an API key. Please use manual entry mode.";
      return;
    }

    photoResult.innerHTML = "🔍 Analyzing photo... please wait.";

    try {
      const form = new FormData();
      form.append("file", mealPhoto.files[0]);

      const response = await fetch("https://api.caloriemama.ai/v1/foodrecognition", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CALORIE_MAMA_API}`
        },
        body: form
      });

      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        photoResult.innerHTML = "⚠️ No recognizable foods found. Please try a clearer image.";
        return;
      }

      let totalCalories = 0;
      let resultHTML = "<strong>Detected Foods:</strong><br><ul style='text-align:left;'>";

      data.results.forEach(item => {
        const name = item.food_name || "Unknown";
        const cal = item.calories || 0;
        totalCalories += cal;
        resultHTML += `<li>${name} — ${cal} kcal</li>`;
      });

      resultHTML += `</ul><p><strong>Total Estimated:</strong> 🍽️ ${Math.round(totalCalories)} kcal</p>`;
      photoResult.innerHTML = resultHTML;
    } catch (err) {
      console.error(err);
      photoResult.innerHTML = "⚠️ Unable to analyze the photo right now. Please try again later or use manual input.";
    }
  });

  // Add ingredient row
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

  // Manual calorie calculation
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
