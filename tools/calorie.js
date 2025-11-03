// ==========================================
// Convert Labs Calorie Calculator — Clean, Accurate & AdSense Safe
// ==========================================

// === DOM Elements ===
const addIngredientBtn = document.getElementById("addIngredientBtn");
const calcCaloriesBtn = document.getElementById("calculateCaloriesBtn");
const manualResult = document.getElementById("manualResult");
const ingredientList = document.getElementById("ingredientList");
const dailyBox = document.getElementById("dailyTracker");

// === Local Nutrition Database (per 100 g)
const LOCAL_DB = {
  chicken: { calories: 239, protein: 27, carbs: 0, fat: 14 },
  lamb: { calories: 294, protein: 25, carbs: 0, fat: 21 },
  beef: { calories: 250, protein: 26, carbs: 0, fat: 15 },
  fish: { calories: 206, protein: 22, carbs: 0, fat: 12 },
  egg: { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  potato: { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  mixedvegetables: { calories: 65, protein: 3, carbs: 11, fat: 1 },
  bread: { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
  pasta: { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
  cheese: { calories: 402, protein: 25, carbs: 1.3, fat: 33 },
  milk: { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
  yogurt: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  beans: { calories: 347, protein: 21, carbs: 63, fat: 1.6 },
  lentils: { calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  apple: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  banana: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  orange: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  mango: { calories: 60, protein: 0.8, carbs: 15, fat: 0.4 },
  salad: { calories: 20, protein: 1, carbs: 3, fat: 0.2 },
  chocolate: { calories: 546, protein: 5, carbs: 61, fat: 31 },
  fries: { calories: 312, protein: 3, carbs: 41, fat: 15 },
  burger: { calories: 295, protein: 17, carbs: 30, fat: 13 },
  pizza: { calories: 266, protein: 11, carbs: 33, fat: 10 }
};

// === Add Ingredient Row ===
function addIngredientRow(n = "", g = "") {
  const r = document.createElement("div");
  r.style.margin = "6px";
  r.innerHTML = `
    <input list="foodList" type="text" placeholder="Food" value="${n}" style="padding:6px;border-radius:6px;width:130px;">
    <input type="number" placeholder="Grams" value="${g}" style="padding:6px;border-radius:6px;width:70px;">
    <button class="removeBtn">❌</button>
  `;
  r.querySelector(".removeBtn").onclick = () => r.remove();
  ingredientList.appendChild(r);
}

addIngredientRow();
addIngredientBtn.onclick = () => addIngredientRow();

// === Calculate Calories ===
calcCaloriesBtn.onclick = () => {
  const rows = ingredientList.querySelectorAll("div");
  let total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  rows.forEach(r => {
    const f = r.querySelector("input[type=text]").value.toLowerCase().trim();
    const g = parseFloat(r.querySelector("input[type=number]").value) || 100;
    const i = LOCAL_DB[f.replace(/\s/g, "")];
    if (i) {
      total.calories += i.calories * (g / 100);
      total.protein += i.protein * (g / 100);
      total.carbs += i.carbs * (g / 100);
      total.fat += i.fat * (g / 100);
    }
  });

  displayManualResult(total);
  addToDailyTotal(total);
};

// === Display Manual Result ===
function displayManualResult(t) {
  const dark = window.matchMedia("(prefers-color-scheme: dark)").matches || document.body.classList.contains("dark");
  const bg = dark ? "#1e293b" : "#f1f5f9";
  const tc = dark ? "#f8fafc" : "#0f172a";
  const st = dark ? "#94a3b8" : "#475569";
  const s = `🍱 Total Meal — 🔥 ${t.calories.toFixed(0)} kcal | 💪 ${t.protein.toFixed(1)}g | 🍞 ${t.carbs.toFixed(1)}g | 🥑 ${t.fat.toFixed(1)}g`;

  manualResult.innerHTML = `
    <div id="manualCard" class="fade-up" style="background:${bg};color:${tc};padding:15px;border-radius:14px;
    box-shadow:0 4px 10px rgba(0,0,0,.4);max-width:340px;margin:auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <h3 style="margin:0;">🍱 Total Meal</h3>
        <button onclick="closeNutritionCard()" style="background:none;border:none;color:${tc};font-size:20px;">✖</button>
      </div>
      <p>🔥 ${t.calories.toFixed(0)} kcal</p>
      <p>💪 ${t.protein.toFixed(1)} g protein</p>
      <p>🍞 ${t.carbs.toFixed(1)} g carbs</p>
      <p>🥑 ${t.fat.toFixed(1)} g fat</p>
      <p style="font-size:12px;color:${st};">Source: Manual Input</p>
      <button onclick="shareResult('${s}')" style="margin-top:8px;padding:8px 14px;background:#2563eb;color:#fff;border:none;border-radius:8px;">📤 Share</button>
      <button onclick="copySiteLink()" style="margin-left:6px;padding:8px 12px;background:#1e40af;color:#fff;border:none;border-radius:8px;">🔗 Copy Link</button>
    </div>`;
}

// === Share & Copy ===
async function shareResult(txt) {
  const t = `${txt}\nvia Convert Labs — https://convertlabs.online`;
  try {
    if (navigator.share)
      await navigator.share({ title: "My Meal Nutrition", text: t, url: "https://convertlabs.online" });
    else {
      await navigator.clipboard.writeText(t);
      alert("✅ Copied!");
    }
  } catch {
    alert("⚠️ Unable to share.");
  }
}

async function copySiteLink() {
  try {
    await navigator.clipboard.writeText("https://convertlabs.online");
    alert("🔗 Link copied!");
  } catch {
    alert("⚠️ Failed to copy.");
  }
}

function closeNutritionCard() {
  const c = document.querySelector("#manualCard");
  if (c) {
    c.classList.add("fade-out");
    setTimeout(() => c.remove(), 300);
  }
}

// === Auto-complete ===
const datalist = document.createElement("datalist");
datalist.id = "foodList";
Object.keys(LOCAL_DB).forEach(f => {
  const opt = document.createElement("option");
  opt.value = f;
  datalist.appendChild(opt);
});
document.body.appendChild(datalist);

// === Daily Tracker ===
let totals = JSON.parse(localStorage.getItem("convertlabs_totals")) || {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  date: new Date().toDateString()
};

function checkReset() {
  const today = new Date().toDateString();
  if (totals.date !== today) {
    totals = { calories: 0, protein: 0, carbs: 0, fat: 0, date: today };
    saveTotals();
  }
}

function saveTotals() {
  localStorage.setItem("convertlabs_totals", JSON.stringify(totals));
}

function addToDailyTotal(i) {
  checkReset();
  totals.calories += i.calories;
  totals.protein += i.protein;
  totals.carbs += i.carbs;
  totals.fat += i.fat;
  saveTotals();
  updateDailyTracker();
}

function updateDailyTracker() {
  checkReset();
  if (!dailyBox) return;
  const dark = window.matchMedia("(prefers-color-scheme: dark)").matches || document.body.classList.contains("dark");
  dailyBox.style.background = dark ? "#0f172a" : "#f1f5f9";
  dailyBox.style.color = dark ? "#f8fafc" : "#0f172a";
  if (!totals || totals.calories === 0) {
    dailyBox.style.display = "none";
    return;
  }
  dailyBox.style.display = "block";
  dailyBox.innerHTML = `
    <h3 style="margin-bottom:8px;">📅 Today’s Total</h3>
    <p>🔥 <b>${totals.calories.toFixed(0)}</b> kcal</p>
    <p>💪 ${totals.protein.toFixed(1)} g protein</p>
    <p>🍞 ${totals.carbs.toFixed(1)} g carbs</p>
    <p>🥑 ${totals.fat.toFixed(1)} g fat</p>
    <div style="margin-top:10px;">
      <button id="resetDailyBtn" style="padding:6px 12px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;">🔄 Reset Today</button>
    </div>`;
  const resetBtn = document.getElementById("resetDailyBtn");
  if (resetBtn) resetBtn.onclick = resetDailyTotals;
}

window.resetDailyTotals = function () {
  totals = { calories: 0, protein: 0, carbs: 0, fat: 0, date: new Date().toDateString() };
  saveTotals();
  updateDailyTracker();
  alert("✅ Daily totals cleared.");
};

// === Initialize ===
updateDailyTracker();
