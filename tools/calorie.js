// ==========================================
// Convert Labs Calorie Calculator — Lightweight + Optional AI + Manual Fallback
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

// === Local Nutrition Database (per 100 g)
const LOCAL_DB = {
  chicken:{calories:239,protein:27,carbs:0,fat:14},
  lamb:{calories:294,protein:25,carbs:0,fat:21},
  beef:{calories:250,protein:26,carbs:0,fat:15},
  fish:{calories:206,protein:22,carbs:0,fat:12},
  egg:{calories:155,protein:13,carbs:1.1,fat:11},
  rice:{calories:130,protein:2.7,carbs:28,fat:0.3},
  potato:{calories:77,protein:2,carbs:17,fat:0.1},
  mixedvegetables:{calories:65,protein:3,carbs:11,fat:1},
  bread:{calories:265,protein:9,carbs:49,fat:3.2},
  pasta:{calories:131,protein:5,carbs:25,fat:1.1},
  cheese:{calories:402,protein:25,carbs:1.3,fat:33},
  milk:{calories:42,protein:3.4,carbs:5,fat:1},
  yogurt:{calories:59,protein:10,carbs:3.6,fat:0.4},
  beans:{calories:347,protein:21,carbs:63,fat:1.6},
  lentils:{calories:116,protein:9,carbs:20,fat:0.4},
  apple:{calories:52,protein:0.3,carbs:14,fat:0.2},
  banana:{calories:89,protein:1.1,carbs:23,fat:0.3},
  orange:{calories:47,protein:0.9,carbs:12,fat:0.1},
  mango:{calories:60,protein:0.8,carbs:15,fat:0.4},
  salad:{calories:20,protein:1,carbs:3,fat:0.2},
  chocolate:{calories:546,protein:5,carbs:61,fat:31},
  fries:{calories:312,protein:3,carbs:41,fat:15},
  burger:{calories:295,protein:17,carbs:30,fat:13},
  pizza:{calories:266,protein:11,carbs:33,fat:10}
};

// === UI Enhancements ===
const style=document.createElement("style");
style.textContent=`
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes fadeUp{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:none}}
.fade-up{animation:fadeUp .6s ease both}
button:hover{transform:scale(1.05)}
`;
document.head.appendChild(style);

photoBtn.onclick=()=>{manualSection.style.display="none";photoSection.style.display="block";};
manualBtn.onclick=()=>{photoSection.style.display="none";manualSection.style.display="block";};

// === Spinner ===
function showSpinner(text){
  photoResult.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;">
  <div style="width:40px;height:40px;border:4px solid #ddd;border-top-color:#1e40af;
  border-radius:50%;animation:spin 1s linear infinite;margin:10px 0;"></div>
  <p>${text}</p></div>`;
}

// === Safe TensorFlow Loader ===
async function safeLoadTF(){
  if(window.tf) return true;
  try{
    if(window.loadTF) await window.loadTF(); else return false;
    return !!window.tf;
  }catch(e){
    console.warn("TensorFlow failed:",e);
    return false;
  }
}

// === Food-101 Model (lazy) ===
let aiModel=null,aiLabels=[];
async function loadFoodModel(){
  if(aiModel) return;
  showSpinner("⏳ Loading AI food model…");
  aiModel=await tf.loadGraphModel("https://cdn.jsdelivr.net/gh/zaidalyafeai/HostedModels/food101/model.json");
  const res=await fetch("https://cdn.jsdelivr.net/gh/zaidalyafeai/HostedModels/food101/labels.json");
  aiLabels=await res.json();
}

// === Recognize food from photo ===
async function recognizeFoodFromPhoto(file){
  const tfReady=await safeLoadTF();
  if(!tfReady) throw new Error("TF not available");
  await loadFoodModel();
  const img=document.createElement("img");
  img.src=URL.createObjectURL(file);
  await img.decode();
  const tensor=tf.browser.fromPixels(img).resizeNearestNeighbor([224,224])
    .toFloat().expandDims(0).div(255);
  const preds=await aiModel.predict(tensor).data();
  const idx=preds.indexOf(Math.max(...preds));
  return aiLabels[idx].replace(/_/g," ");
}

// === Photo Upload with AI fallback ===
photoInput.onchange=async e=>{
  const file=e.target.files[0]; if(!file)return;
  const img=document.createElement("img");
  img.src=URL.createObjectURL(file);
  img.style.maxWidth="240px"; img.style.borderRadius="8px";
  photoPreview.innerHTML=""; photoPreview.appendChild(img);
  photoResult.innerHTML="<p>🔍 Detecting food from photo…</p>";

  try{
    const guess=await recognizeFoodFromPhoto(file);
    if(guess){
      photoResult.innerHTML=`<label>Detected food:</label><br>
      <input id="foodNameInput" value="${guess}" style="padding:6px;border-radius:6px;width:220px;">`;
    }else throw new Error("No guess");
  }catch{
    photoResult.innerHTML=`<label>AI unavailable — enter manually:</label><br>
    <input id="foodNameInput" placeholder="e.g., chicken and rice"
    style="padding:6px;border-radius:6px;width:220px;">`;
  }
};

// === Open Food Facts API ===
async function getFromOpenFoodFacts(food){
  try{
    const res=await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(food)}&search_simple=1&action=process&json=1`);
    const data=await res.json();
    if(!data.products?.length) return null;
    const p=data.products[0];
    let cal=p.nutriments["energy-kcal_100g"];
    const prot=p.nutriments.proteins_100g||0,carbs=p.nutriments.carbohydrates_100g||0,fat=p.nutriments.fat_100g||0;
    if(!cal) cal=prot*4+carbs*4+fat*9;
    return {name:p.product_name||food,calories:cal,protein:prot,carbs:carbs,fat:fat};
  }catch{return null;}
}

// === Local DB Fallback ===
function estimateFromLocalDB(q){
  const parts=q.split(/,|and/).map(p=>p.trim());
  let total={name:"",calories:0,protein:0,carbs:0,fat:0},c=0;
  parts.forEach(w=>{
    const k=w.replace(/\s/g,"");
    const d=LOCAL_DB[k];
    if(d){total.name+=(c?", ":"")+w;
      total.calories+=d.calories;total.protein+=d.protein;
      total.carbs+=d.carbs;total.fat+=d.fat;c++;}});
  return c?total:null;
}

// === Analyze Photo ===
analyzeBtn.onclick=async()=>{
  const input=document.getElementById("foodNameInput");
  if(!input)return alert("Please upload a photo first.");
  let q=input.value.trim().toLowerCase();
  if(!q||/^\d+$/.test(q)) q="chicken and rice";
  showSpinner("Analyzing nutrition data…");
  const data=await getFromOpenFoodFacts(q);
  const local=estimateFromLocalDB(q);
  if(data&&local){
    const m={name:local.name,
      calories:(data.calories+local.calories)/2,
      protein:(data.protein+local.protein)/2,
      carbs:(data.carbs+local.carbs)/2,
      fat:(data.fat+local.fat)/2};
    return displayNutrition([m],"AI + OpenFoodFacts + Local");
  }
  if(local) return displayNutrition([local],"Local Estimate");
  if(data) return displayNutrition([data],"OpenFoodFacts");
  photoResult.innerHTML=`⚠️ No data found for <b>${q}</b>.`;
};

// === Display Card ===
function displayNutrition(items,src){
  const i=items[0];
  const dark=window.matchMedia("(prefers-color-scheme: dark)").matches||document.body.classList.contains("dark");
  const bg=dark?"#1e293b":"#f1f5f9",tc=dark?"#f8fafc":"#0f172a",st=dark?"#94a3b8":"#475569";
  const summary=`🍽️ ${i.name} — 🔥 ${i.calories.toFixed(0)} kcal | 💪 ${i.protein.toFixed(1)}g | 🍞 ${i.carbs.toFixed(1)}g | 🥑 ${i.fat.toFixed(1)}g`;
  photoResult.innerHTML=`
  <div id="nutritionCard" class="fade-up" style="background:${bg};color:${tc};padding:15px;border-radius:14px;
  box-shadow:0 4px 10px rgba(0,0,0,.4);max-width:340px;margin:auto;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
  <h3 style="margin:0;">🍽️ ${i.name}</h3>
  <button onclick="closeNutritionCard()" style="background:none;border:none;color:${tc};font-size:20px;">✖</button></div>
  <p>🔥 ${i.calories.toFixed(0)} kcal</p>
  <p>💪 ${i.protein.toFixed(1)} g protein</p>
  <p>🍞 ${i.carbs.toFixed(1)} g carbs</p>
  <p>🥑 ${i.fat.toFixed(1)} g fat</p>
  <p style="font-size:12px;color:${st};">Source: ${src}</p>
  <button onclick="shareResult('${summary}')" style="margin-top:8px;padding:8px 14px;background:#2563eb;color:#fff;border:none;border-radius:8px;">📤 Share</button>
  <button onclick="copySiteLink()" style="margin-left:6px;padding:8px 12px;background:#1e40af;color:#fff;border:none;border-radius:8px;">🔗 Copy Link</button>
  </div>`;
}

function closeNutritionCard(){
  const c=document.querySelector("#nutritionCard,#manualCard");
  if(c){c.classList.add("fade-out");setTimeout(()=>c.remove(),300);}
}

// === Share + Copy ===
async function shareResult(txt){
  const t=`${txt}\nvia Convert Labs — https://convertlabs.online`;
  try{
    if(navigator.share) await navigator.share({title:"My Meal Nutrition",text:t,url:"https://convertlabs.online"});
    else{await navigator.clipboard.writeText(t);alert("✅ Copied!");}
  }catch{alert("⚠️ Unable to share.");}
}
async function copySiteLink(){
  try{await navigator.clipboard.writeText("https://convertlabs.online");alert("🔗 Link copied!");}
  catch{alert("⚠️ Failed to copy.");}
}

// === Manual Input ===
function addIngredientRow(n="",g=""){
  const r=document.createElement("div");r.style.margin="6px";
  r.innerHTML=`<input list="foodList" type="text" placeholder="Food" value="${n}" style="padding:6px;border-radius:6px;width:130px;">
  <input type="number" placeholder="Grams" value="${g}" style="padding:6px;border-radius:6px;width:70px;">
  <button class="removeBtn">❌</button>`;
  r.querySelector(".removeBtn").onclick=()=>r.remove();
  ingredientList.appendChild(r);
}
addIngredientRow();addIngredientBtn.onclick=()=>addIngredientRow();

calcCaloriesBtn.onclick=()=>{
  const rows=ingredientList.querySelectorAll("div");
  let t={calories:0,protein:0,carbs:0,fat:0};
  rows.forEach(r=>{
    const f=r.querySelector("input[type=text]").value.toLowerCase().trim();
    const g=parseFloat(r.querySelector("input[type=number]").value)||100;
    const i=LOCAL_DB[f.replace(/\s/g,"")];
    if(i){t.calories+=i.calories*(g/100);t.protein+=i.protein*(g/100);
      t.carbs+=i.carbs*(g/100);t.fat+=i.fat*(g/100);}
  });
  const dark=window.matchMedia("(prefers-color-scheme: dark)").matches||document.body.classList.contains("dark");
  const bg=dark?"#1e293b":"#f1f5f9",tc=dark?"#f8fafc":"#0f172a",st=dark?"#94a3b8":"#475569";
  const s=`🍱 Total Meal — 🔥 ${t.calories.toFixed(0)} kcal | 💪 ${t.protein.toFixed(1)}g | 🍞 ${t.carbs.toFixed(1)}g | 🥑 ${t.fat.toFixed(1)}g`;
  manualResult.innerHTML=`
  <div id="manualCard" class="fade-up" style="background:${bg};color:${tc};padding:15px;border-radius:14px;
  box-shadow:0 4px 10px rgba(0,0,0,.4);max-width:340px;margin:auto;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
  <h3 style="margin:0;">🍱 Total Meal</h3>
  <button onclick="closeNutritionCard()" style="background:none;border:none;color:${tc};font-size:20px;">✖</button></div>
  <p>🔥 ${t.calories.toFixed(0)} kcal</p>
  <p>💪 ${t.protein.toFixed(1)} g protein</p>
  <p>🍞 ${t.carbs.toFixed(1)} g carbs</p>
  <p>🥑 ${t.fat.toFixed(1)} g fat</p>
  <p style="font-size:12px;color:${st};">Source: Manual Input</p>
  <button onclick="shareResult('${s}')" style="margin-top:8px;padding:8px 14px;background:#2563eb;color:#fff;border:none;border-radius:8px;">📤 Share</button>
  <button onclick="copySiteLink()" style="margin-left:6px;padding:8px 12px;background:#1e40af;color:#fff;border:none;border-radius:8px;">🔗 Copy Link</button>
  </div>`;
};

// === Auto-complete list ===
const datalist=document.createElement("datalist");
datalist.id="foodList";
Object.keys(LOCAL_DB).forEach(f=>{
  const opt=document.createElement("option");
  opt.value=f;
  datalist.appendChild(opt);
});
document.body.appendChild(datalist);
