// ==========================================
// Convert Labs Calorie Calculator (Final Edition)
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

// === Offline database (per 100g)
const LOCAL_DB = {
  chicken: { calories: 239, protein: 27, carbs: 0, fat: 14 },
  beef: { calories: 250, protein: 26, carbs: 0, fat: 15 },
  fish: { calories: 206, protein: 22, carbs: 0, fat: 12 },
  egg: { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  potato: { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  pasta: { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
  bread: { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
  oats: { calories: 389, protein: 17, carbs: 66, fat: 7 },
  cheese: { calories: 402, protein: 25, carbs: 1.3, fat: 33 },
  milk: { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
  yogurt: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  beans: { calories: 347, protein: 21, carbs: 63, fat: 1.6 },
  lentils: { calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  apple: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  banana: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  orange: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  mango: { calories: 60, protein: 0.8, carbs: 15, fat: 0.4 },
  dates: { calories: 282, protein: 2.5, carbs: 75, fat: 0.4 },
  tomato: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  cucumber: { calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
  carrot: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  spinach: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  broccoli: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  pizza: { calories: 266, protein: 11, carbs: 33, fat: 10 },
  burger: { calories: 295, protein: 17, carbs: 30, fat: 13 },
  fries: { calories: 312, protein: 3.4, carbs: 41, fat: 15 },
  chocolate: { calories: 546, protein: 4.9, carbs: 61, fat: 31 },
  icecream: { calories: 207, protein: 3.5, carbs: 24, fat: 11 },
  donut: { calories: 452, protein: 4.9, carbs: 51, fat: 25 },
  cake: { calories: 350, protein: 4, carbs: 50, fat: 15 },
  juice: { calories: 45, protein: 0.7, carbs: 10, fat: 0.1 },
  coffee: { calories: 2, protein: 0.3, carbs: 0, fat: 0 },
  tea: { calories: 1, protein: 0, carbs: 0, fat: 0 },
  soda: { calories: 41, protein: 0, carbs: 10, fat: 0 },
  salad: { calories: 20, protein: 1, carbs: 3, fat: 0.2 },
  mixedvegetables: { calories: 65, protein: 3, carbs: 11, fat: 1 }
};

// === Animations ===
const fadeStyle = document.createElement("style");
fadeStyle.textContent = `
@keyframes spin {from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes fadeUpBounce {
  0% { opacity: 0; transform: translateY(20px) scale(0.97); }
  60% { opacity: 1; transform: translateY(-5px) scale(1.02); }
  80% { transform: translateY(2px) scale(0.995); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.fade-up { animation: fadeUpBounce 0.8s cubic-bezier(0.22, 1.28, 0.36, 1) both; }
button:hover { background:#1e40af !important; transform: scale(1.04); }
button:active { transform: scale(0.96); }
`;
document.head.appendChild(fadeStyle);

// === Mode switching ===
photoBtn.onclick = () => { manualSection.style.display = "none"; photoSection.style.display = "block"; };
manualBtn.onclick = () => { photoSection.style.display = "none"; manualSection.style.display = "block"; };

// === Spinner ===
function showSpinner(text) {
  photoResult.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:40px;height:40px;border:4px solid #ddd;border-top-color:#1e40af;
      border-radius:50%;animation:spin 1s linear infinite;margin:10px 0;"></div>
      <p>${text}</p>
    </div>`;
}

// === Photo Preview ===
photoInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.style.maxWidth = "240px"; img.style.borderRadius = "8px";
  photoPreview.innerHTML = ""; photoPreview.appendChild(img);
  let guess = file.name.split(".")[0].replace(/[-_]/g, " ");
  if (/^\d+$/.test(guess) || guess.toLowerCase().startsWith("img")) guess = "";
  photoResult.innerHTML = `
    <label>What food is in this photo?</label><br>
    <input id="foodNameInput" value="${guess}" placeholder="e.g., chicken and rice" 
    style="padding:6px;border-radius:6px;width:220px;">
  `;
};

// === Open Food Facts API ===
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
      fat: p.nutriments.fat_100g || 0
    };
  } catch { return null; }
}

// === Local DB fallback ===
function estimateFromLocalDB(query) {
  const parts = query.split(/,|and/).map(p => p.trim());
  let total = { name: "", calories: 0, protein: 0, carbs: 0, fat: 0 }, count = 0;
  parts.forEach(word => {
    const key = word.replace(/\s/g, "");
    const data = LOCAL_DB[key];
    if (data) {
      total.name += (count ? ", " : "") + word;
      total.calories += data.calories;
      total.protein += data.protein;
      total.carbs += data.carbs;
      total.fat += data.fat;
      count++;
    }
  });
  if (!count) return null;
  return total;
}

// === Analyze Button ===
analyzeBtn.onclick = async () => {
  const input = document.getElementById("foodNameInput");
  if (!input) return alert("Please upload a photo first.");
  let query = input.value.trim().toLowerCase();
  if (!query || /^\d+$/.test(query)) query = "chicken and rice";
  showSpinner("Analyzing nutrition data…");

  const data = await getFromOpenFoodFacts(query);
  if (data && data.name && data.name.toLowerCase().includes(query.split(" ")[0]) && data.calories > 20)
    return displayNutrition([data], "Open Food Facts");

  const estimate = estimateFromLocalDB(query);
  if (estimate) return displayNutrition([estimate], "Local Estimate");
  photoResult.innerHTML = `⚠️ No data found for <b>${query}</b>.`;
};

// === Unified Display Function (Card + Scroll + Share) ===
function displayNutrition(items, source) {
  const item = items[0];
  const prefersDark = document.body.classList.contains("dark") || window.matchMedia("(prefers-color-scheme: dark)").matches;
  const cardBg = prefersDark ? "#1e293b" : "#f1f5f9";
  const textColor = prefersDark ? "#f8fafc" : "#0f172a";
  const subText = prefersDark ? "#94a3b8" : "#475569";

  const summary = `🍽️ ${item.name} — 🔥 ${item.calories.toFixed(0)} kcal | 💪 ${item.protein.toFixed(1)}g protein | 🍞 ${item.carbs.toFixed(1)}g carbs | 🥑 ${item.fat.toFixed(1)}g fat`;

  photoResult.innerHTML = `
    <div id="nutritionCard" class="fade-up" style="
      background:${cardBg};
      color:${textColor};
      padding:15px;
      border-radius:14px;
      box-shadow:0 4px 10px rgba(0,0,0,0.4);
      max-width:340px;margin:auto;font-size:15px;text-align:left;">
      <h3 style="margin-bottom:10px;">🍽️ ${item.name}</h3>
      <p>🔥 <b>${item.calories.toFixed(0)}</b> kcal</p>
      <p>💪 <b>${item.protein.toFixed(1)}</b> g protein</p>
      <p>🍞 <b>${item.carbs.toFixed(1)}</b> g carbs</p>
      <p>🥑 <b>${item.fat.toFixed(1)}</b> g fat</p>
      <p style="font-size:12px;color:${subText};margin-top:5px;">Source: ${source}</p>
      <button onclick="shareResult('${summary}')" style="margin-top:10px;padding:8px 14px;background:#2563eb;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer;">📤 Share Result</button>
      <button onclick="copySiteLink()" style="margin-left:6px;padding:8px 12px;background:#1e40af;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer;">🔗 Copy Link</button>
    </div>`;

  setTimeout(() => {
    const card = document.getElementById("nutritionCard");
    if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 700);
}

// === Manual Section ===
function addIngredientRow(name = "", grams = "") {
  const row = document.createElement("div");
  row.style.margin = "6px";
  row.innerHTML = `
    <input list="foodList" type="text" placeholder="Food" value="${name}" style="padding:6px;border-radius:6px;width:130px;">
    <input type="number" placeholder="Grams" value="${grams}" style="padding:6px;border-radius:6px;width:70px;">
    <button class="removeBtn">❌</button>`;
  row.querySelector(".removeBtn").onclick = () => row.remove();
  ingredientList.appendChild(row);
}

addIngredientRow();
addIngredientBtn.onclick = () => addIngredientRow();

calcCaloriesBtn.onclick = () => {
  const rows = ingredientList.querySelectorAll("div");
  let total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  rows.forEach(r => {
    const food = r.querySelector("input[type=text]").value.toLowerCase().trim();
    const grams = parseFloat(r.querySelector("input[type=number]").value) || 100;
    const item = LOCAL_DB[food.replace(/\s/g, "")];
    if (item) {
      total.calories += item.calories * (grams / 100);
      total.protein += item.protein * (grams / 100);
      total.carbs += item.carbs * (grams / 100);
      total.fat += item.fat * (grams / 100);
    }
  });

  const prefersDark = document.body.classList.contains("dark") || window.matchMedia("(prefers-color-scheme: dark)").matches;
  const cardBg = prefersDark ? "#1e293b" : "#f1f5f9";
  const textColor = prefersDark ? "#f8fafc" : "#0f172a";
  const subText = prefersDark ? "#94a3b8" : "#475569";

  const summary = `🍱 Total Meal — 🔥 ${total.calories.toFixed(0)} kcal | 💪 ${total.protein.toFixed(1)}g protein | 🍞 ${total.carbs.toFixed(1)}g carbs | 🥑 ${total.fat.toFixed(1)}g fat`;

  manualResult.innerHTML = `
    <div id="manualCard" class="fade-up" style="
      background:${cardBg};
      color:${textColor};
      padding:15px;
      border-radius:14px;
      box-shadow:0 4px 10px rgba(0,0,0,0.4);
      max-width:340px;margin:auto;font-size:15px;text-align:left;">
      <h3>🍱 Total Meal</h3>
      <p>🔥 ${total.calories.toFixed(0)} kcal</p>
      <p>💪 ${total.protein.toFixed(1)} g protein</p>
      <p>🍞 ${total.carbs.toFixed(1)} g carbs</p>
      <p>🥑 ${total.fat.toFixed(1)} g fat</p>
      <p style="font-size:12px;color:${subText};margin-top:5px;">Source: Manual Calculation</p>
      <button onclick="shareResult('${summary}')" style="margin-top:10px;padding:8px 14px;background:#2563eb;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer;">📤 Share Result</button>
      <button onclick="copySiteLink()" style="margin-left:6px;padding:8px 12px;background:#1e40af;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer;">🔗 Copy Link</button>
    </div>`;

  setTimeout(() => {
    const card = document.getElementById("manualCard");
    if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 700);
};

// === Share Function ===
async function shareResult(summaryText) {
  const shareText = `${summaryText}\nvia Convert Labs — https://convertlabs.online`;
  try {
    if (navigator.share) {
      await navigator.share({
        title: "My Meal Nutrition",
        text: shareText,
        url: "https://convertlabs.online"
      });
    } else {
      await navigator.clipboard.writeText(shareText);
      alert("✅ Result copied to clipboard!");
    }
  } catch {
    alert("⚠️ Unable to share or copy the result.");
  }
}

// === Copy site link only ===
async function copySiteLink() {
  try {
    await navigator.clipboard.writeText("https://convertlabs.online");
    alert("🔗 Site link copied to clipboard!");
  } catch {
    alert("⚠️ Unable to copy link.");
  }
}

// === Auto-complete list ===
const datalist = document.createElement("datalist");
datalist.id = "foodList";
Object.keys(LOCAL_DB).forEach(food => {
  const opt = document.createElement("option");
  opt.value = food;
  datalist.appendChild(opt);
});
document.body.appendChild(datalist);
