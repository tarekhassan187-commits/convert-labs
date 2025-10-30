// ==========================================
// Calorie Calculator Frontend (v5)
// ==========================================

// ===== CONFIG =====
const VISION_API_KEY = "YOUR_GOOGLE_VISION_API_KEY";
const EDAMAM_APP_ID = "YOUR_EDAMAM_APP_ID";
const EDAMAM_APP_KEY = "YOUR_EDAMAM_APP_KEY";
const fallbackApi = "https://convert-labs.onrender.com/api/calories";

// ===== DOM ELEMENTS =====
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

// ===== MODE SWITCHING =====
photoBtn.addEventListener("click", () => {
  manualSection.style.display = "none";
  photoSection.style.display = "block";
  photoBtn.classList.add("active");
  manualBtn.classList.remove("active");
});

manualBtn.addEventListener("click", () => {
  photoSection.style.display = "none";
  manualSection.style.display = "block";
  manualBtn.classList.add("active");
  photoBtn.classList.remove("active");
});

// ===== PHOTO PREVIEW =====
photoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.style.maxWidth = "240px";
  img.style.borderRadius = "8px";
  photoPreview.innerHTML = "";
  photoPreview.appendChild(img);
});

// ===== MAIN ANALYZE FUNCTION =====
async function analyzeImage() {
  const file = photoInput.files[0];
  if (!file) return alert("Please upload a meal photo first.");

  photoResult.innerHTML = "⏳ Analyzing photo... please wait.";

  try {
    const base64 = await fileToBase64(file);

    // Step 1: Use Google Vision to detect foods
    const visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64 },
              features: [{ type: "LABEL_DETECTION", maxResults: 6 }],
            },
          ],
        }),
      }
    );

    const visionData = await visionRes.json();
    const labels = visionData.responses?.[0]?.labelAnnotations || [];
    if (!labels.length) throw new Error("No food items detected.");

    const ingredients = labels
      .map((l) => l.description)
      .filter((word) =>
        /(food|meal|dish|chicken|rice|meat|bread|salad|egg|pasta|fish|fruit|vegetable|burger|soup|pizza|cheese|potato)/i.test(
          word
        )
      )
      .slice(0, 5)
      .join(", ");

    if (!ingredients) throw new Error("No recognizable foods found in image.");

    // Step 2: Send ingredients to Edamam Nutrition API
    const edamamUrl = `https://api.edamam.com/api/nutrition-data?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${encodeURIComponent(
      ingredients
    )}`;

    const nutriRes = await fetch(edamamUrl);
    const nutriData = await nutriRes.json();

    if (!nutriData.calories) throw new Error("No nutrition data received.");

    // Step 3: Display result nicely
    displayResult({
      calories: nutriData.calories,
      protein: nutriData.totalNutrients.PROCNT?.quantity.toFixed(1) || 0,
      carbs: nutriData.totalNutrients.CHOCDF?.quantity.toFixed(1) || 0,
      fat: nutriData.totalNutrients.FAT?.quantity.toFixed(1) || 0,
      detected: ingredients,
    });
  } catch (err) {
    console.warn("Error analyzing photo:", err);

    // Fallback to your backend
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(fallbackApi, { method: "POST", body: formData });
      const data = await res.json();
      if (data.calories) {
        displayResult(data);
      } else {
        throw new Error("Fallback failed too");
      }
    } catch (err2) {
      photoResult.innerHTML =
        "❌ Sorry, we couldn’t analyze this photo. Please try again later.";
    }
  }
}

// Convert file → Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Display results in formatted layout
function displayResult(data) {
  photoResult.innerHTML = `
    <div style="background:var(--card-bg);border-radius:12px;padding:1rem;box-shadow:0 2px 8px var(--shadow-color);">
      <h3>🍽 Estimated Total: ${Math.round(data.calories)} kcal</h3>
      <div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-top:0.5rem;">
        <div>🥩 Protein: <b>${data.protein}</b> g</div>
        <div>🌾 Carbs: <b>${data.carbs}</b> g</div>
        <div>🥑 Fat: <b>${data.fat}</b> g</div>
      </div>
      ${
        data.detected
          ? `<p style="margin-top:0.8rem;font-size:0.9rem;color:var(--text-color);">Detected ingredients: ${data.detected}</p>`
          : ""
      }
    </div>`;
}

// ===== Manual Input Section =====
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

// Default rows
addIngredientRow("chicken", 150);
addIngredientRow("rice", 100);

addIngredientBtn.addEventListener("click", () => addIngredientRow());

// Basic lookup table (as fallback)
const sampleCalories = {
  rice: 1.3,
  chicken: 1.65,
  potato: 0.77,
  broccoli: 0.34,
  pasta: 1.31,
  egg: 1.55,
  butter: 7.17,
  bread: 2.65,
  cheese: 4.02,
};

// Manual calorie calculation
calcCaloriesBtn.addEventListener("click", () => {
  const rows = ingredientList.querySelectorAll("div");
  let total = 0;
  rows.forEach((r) => {
    const name = r.querySelector("input[type='text']").value.trim().toLowerCase();
    const grams = parseFloat(r.querySelector("input[type='number']").value) || 0;
    if (sampleCalories[name]) {
      total += sampleCalories[name] * grams;
    }
  });
  manualResult.textContent = `Total Calories: ${Math.round(total)} kcal`;
});

// Bind analyze button
analyzeBtn.addEventListener("click", analyzeImage);
