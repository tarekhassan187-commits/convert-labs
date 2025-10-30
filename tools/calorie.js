// ==========================================
// Calorie Calculator — Fast Edition (MobileNet + Spinner + Fallback)
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

let model = null;

// === Spinner styles (light + dark mode) ===
const spinnerStyle = document.createElement("style");
spinnerStyle.textContent = `
@keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }
.spinner {
  width:40px;height:40px;
  border:4px solid rgba(150,150,150,0.3);
  border-top-color: var(--accent-color, #1e40af);
  border-radius:50%;
  animation:spin 1s linear infinite;
}
body.dark-mode .spinner {
  border:4px solid rgba(255,255,255,0.15);
  border-top-color:#fff;
}
`;
document.head.appendChild(spinnerStyle);

function showSpinner(message="Loading...") {
  photoResult.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
      <div class="spinner"></div>
      <p style="font-weight:600;color:var(--text-color);text-align:center;">${message}</p>
    </div>`;
}
function hideSpinner(){ photoResult.innerHTML = ""; }

// === Switch modes ===
photoBtn.onclick = () => { manualSection.style.display="none"; photoSection.style.display="block"; };
manualBtn.onclick = () => { photoSection.style.display="none"; manualSection.style.display="block"; };

// === Preview + compress image ===
photoInput.onchange = async (e)=>{
  const file=e.target.files[0];
  if(!file)return;
  const img=document.createElement("img");
  img.src=URL.createObjectURL(file);
  img.id="previewImg";
  img.style.maxWidth="240px";img.style.borderRadius="8px";
  photoPreview.innerHTML="";photoPreview.appendChild(img);
  const compressed=await compressImage(file,800);
  img.dataset.compressed=URL.createObjectURL(compressed);
};
async function compressImage(file,max){
  const img=await createImageBitmap(file);
  const c=document.createElement("canvas");
  const s=Math.min(max/img.width,max/img.height,1);
  c.width=img.width*s;c.height=img.height*s;
  c.getContext("2d").drawImage(img,0,0,c.width,c.height);
  return new Promise(r=>c.toBlob(b=>r(new File([b],file.name,{type:"image/jpeg"})),"image/jpeg",0.8));
}

// === Lazy-load lightweight MobileNet model ===
async function loadModel(){
  showSpinner("Loading quick analysis model…");
  model = await tf.loadGraphModel(
    "https://tfhub.dev/google/imagenet/mobilenet_v3_small_100_224/classification/5",
    { fromTFHub:true }
  );
  hideSpinner();
}

// === Analyze photo ===
analyzeBtn.onclick = async ()=>{
  const file=photoInput.files[0];
  if(!file)return alert("Please upload a meal photo first.");
  if(!model) await loadModel();

  showSpinner("Analyzing photo (5s)…");
  const imgEl=document.getElementById("previewImg");
  const src=imgEl.dataset.compressed||imgEl.src;
  const img=await createImageBitmap(await fetch(src).then(r=>r.blob()));
  const c=document.createElement("canvas");
  const ctx=c.getContext("2d");
  c.width=224;c.height=224;
  ctx.drawImage(img,0,0,224,224);
  const tensor=tf.browser.fromPixels(c).toFloat().div(255).expandDims();

  // Time limit: 15s
  const resultPromise = model.predict(tensor).data();
  const preds = await Promise.race([
    resultPromise,
    new Promise((_,reject)=>setTimeout(()=>reject("timeout"),15000))
  ]).catch(()=>null);

  if(!preds){
    photoResult.innerHTML=`⏱ Too slow to analyze this image.<br><br>
      <b>Tip:</b> Try smaller photo or type food name manually below.`;
    return;
  }

  const idx = preds.indexOf(Math.max(...preds));
  const label = IMAGENET_CLASSES[idx] || "food";
  showSpinner(`🍽 Detected: <b>${label}</b><br>Fetching nutrition info…`);
  fetchNutrition(label);
};

// === Nutrition lookup (USDA free API) ===
async function fetchNutrition(foodName){
  try{
    const apiKey="DEMO_KEY"; // replace with your free FoodData Central key
    const url=`https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodName)}&pageSize=1&api_key=${apiKey}`;
    const res=await fetch(url);const data=await res.json();
    const food=data.foods?.[0];if(!food) throw 0;
    const n={};food.foodNutrients.forEach(f=>n[f.nutrientName]=f.value);
    photoResult.innerHTML=`
      <h3>${food.description}</h3>
      <p>Calories: ${n["Energy"]||0} kcal</p>
      <p>Protein: ${n["Protein"]||0} g</p>
      <p>Carbs: ${n["Carbohydrate, by difference"]||0} g</p>
      <p>Fat: ${n["Total lipid (fat)"]||0} g</p>`;
  }catch(e){
    photoResult.innerHTML=`⚠️ Couldn't find nutrition data.<br>
      Please type food manually below.`;
  }
}

// === Manual input ===
function addIngredientRow(n="",g=""){
  const r=document.createElement("div");
  r.style.margin="5px";
  r.innerHTML=`<input type="text" placeholder="Ingredient" value="${n}">
  <input type="number" placeholder="Weight (g)" value="${g}">
  <button class="removeBtn">❌</button>`;
  r.querySelector(".removeBtn").onclick=()=>r.remove();
  ingredientList.appendChild(r);
}
addIngredientRow("chicken",150);addIngredientRow("rice",100);
addIngredientBtn.onclick=()=>addIngredientRow();
calcCaloriesBtn.onclick=()=>{
  const rows=ingredientList.querySelectorAll("div");let total=0;
  rows.forEach(r=>{
    const g=parseFloat(r.querySelector("input[type='number']").value)||0;
    total+=g*1.3;
  });
  manualResult.textContent=`Total Calories: ${Math.round(total)} kcal`;
};

// === Simplified ImageNet foodish labels ===
const IMAGENET_CLASSES={
  924:"pizza",934:"rice",967:"hamburger",961:"hotdog",963:"broccoli",
  953:"banana",956:"apple",969:"ice cream",975:"burrito",979:"omelet",
  978:"cupcake",948:"strawberry",925:"plate of food"
};
