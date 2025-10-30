// ==========================================
// Calorie Calculator Frontend (v4)
// ==========================================

// Backend proxy endpoint on Render
const apiUrl = "https://convert-labs.onrender.com/api/calories";

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

// === Mode switching ===
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

// === Preview uploaded photo ===
photoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.style.maxWidth = "220px";
  img.style.borderRadius = "8px";
  photoPreview.innerHTML = "";
  photoPreview.appendChild(img);
});

// === Analyze uploaded image ===
analyzeBtn.addEventListener("click", async () => {
  const file = photoInput.files[0];
  if (!file) return alert("Please upload a meal photo first.");

  const formData = new FormData();
  formData.append("image", file);
  photoResult.innerHTML = "Analyzing photo...";

  try {
    const res = await fetch(apiUrl, { method: "POST", body: formData });
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    let html = `<h3>🍽 Estimated total: ${data.calories} kcal</h3>
      <div style="display:flex;gap:15px;margin:10px 0;font-size:15px">
        <div>🔥 <b>${data.calories}</b> kcal</div>
        <div>🥩 <b>${data.protein}</b> g Protein</div>
        <div>🌾 <b>${data.carbs}</b> g Carbs</div>
        <div>🥑 <b>${data.fat}</b> g Fat</div>
      </div>`;

    if (data.adjusted) {
      html += `<p style="color:#b45f06;font-size:13px;">⚠️ Adjusted for realistic portion size</p>`;
    }

    if (data.breakdown?.length) {
      html += `
      <table style="width:100%;border-collapse:collapse;margin-top:10px;font-size:14px;">
        <thead style="background:#f8f8f8;">
          <tr>
            <th style="text-align:left;padding:6px;">Food</th>
            <th style="text-align:right;padding:6px;">Calories</th>
            <th style="text-align:right;padding:6px;">Protein</th>
            <th style="text-align:right;padding:6px;">Carbs</th>
            <th style="text-align:right;padding:6px;">Fat</th>
          </tr>
        </thead>
        <tbody>
          ${data.breakdown
            .map(
              (i) => `
            <tr>
              <td style="padding:6px;">${i.name}</td>
              <td style="text-align:right;">${i.calories} kcal</td>
              <td style="text-align:right;">${i.protein} g</td>
              <td style="text-align:right;">${i.carbs} g</td>
              <td style="text-align:right;">${i.fat} g</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>`;
    }

    photoResult.innerHTML = html;
  } catch (err) {
    console.error(err);
    photoResult.textContent = "❌ Could not analyze photo. Please try again later.";
  }
});

// === Manual Input Section ===
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

// Example calorie data
const sampleCalories = {
  rice: 1.3,
  "cooked rice": 1.3,
  chicken: 1.65,
  steak: 2.5,
  potato: 0.77,
  broccoli: 0.34,
  salad: 0.2,
  pasta: 1.31,
  egg: 1.55,
  milk: 0.64,
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
