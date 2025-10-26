// Splash Screen
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loading-screen").style.display = "none";
    document.getElementById("app").style.display = "block";
  }, 1000);
});

// Tab Switching
function showConverter(id) {
  document.querySelectorAll(".converter").forEach(el => el.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// Theme Toggle
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("themeToggle");
  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    document.body.classList.add("dark-mode");
    toggle.textContent = "☀️";
  }
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const dark = document.body.classList.contains("dark-mode");
    toggle.textContent = dark ? "☀️" : "🌙";
    localStorage.setItem("theme", dark ? "dark" : "light");
  });
});

// Length Converter
const lengthUnits = { m: 1, km: 1000, cm: 0.01, mm: 0.001, yd: 0.9144, ft: 0.3048, in: 0.0254 };
for (const u in lengthUnits) {
  const opt1 = new Option(u, u), opt2 = new Option(u, u);
  lengthFrom.append(opt1); lengthTo.append(opt2);
}
function convertLength() {
  const val = parseFloat(lengthInput.value);
  if (isNaN(val)) return alert("Enter a number");
  const res = (val * lengthUnits[lengthFrom.value]) / lengthUnits[lengthTo.value];
  lengthResult.textContent = `${val} ${lengthFrom.value} = ${res.toLocaleString()} ${lengthTo.value}`;
}

// Temperature Converter
const temps = ["C", "F", "K"];
temps.forEach(t => {
  tempFrom.add(new Option(t, t));
  tempTo.add(new Option(t, t));
});
function convertTemperature() {
  const v = parseFloat(tempInput.value), f = tempFrom.value, t = tempTo.value;
  if (isNaN(v)) return alert("Enter a number");
  let r = v;
  if (f==="C"&&t==="F")r=v*9/5+32;
  else if(f==="F"&&t==="C")r=(v-32)*5/9;
  else if(f==="C"&&t==="K")r=v+273.15;
  else if(f==="K"&&t==="C")r=v-273.15;
  else if(f==="F"&&t==="K")r=(v-32)*5/9+273.15;
  else if(f==="K"&&t==="F")r=(v-273.15)*9/5+32;
  tempResult.textContent=`${v}°${f} = ${r.toFixed(2)}°${t}`;
}

// Volume Converter
const volumeUnits = { "Liter (L)": 1, "Milliliter (mL)": 0.001, "Cubic meter (m³)": 1000, "Cubic inch (in³)": 0.0163871, "US gallon (gal US)": 3.78541 };
for (const k in volumeUnits) {
  volumeFrom.add(new Option(k, k));
  volumeTo.add(new Option(k, k));
}
function convertVolume() {
  const val=parseFloat(volumeInput.value);
  if(isNaN(val))return alert("Enter a number");
  const res=(val*volumeUnits[volumeFrom.value])/volumeUnits[volumeTo.value];
  volumeResult.textContent=`${val} ${volumeFrom.value} = ${res.toLocaleString()} ${volumeTo.value}`;
}

// Container Volume
containerType.onchange=()=> {
  boxInputs.style.display=containerType.value==="box"?"block":"none";
  cylinderInputs.style.display=containerType.value==="cylinder"?"block":"none";
};
liquidType.onchange=()=> {
  customDensity.style.display=liquidType.value==="custom"?"block":"none";
};
function calculateContainerVolume(){
  let v=0;
  if(containerType.value==="box"){
    const l=+lengthBox.value,w=+widthBox.value,h=+heightBox.value;
    if([l,w,h].some(isNaN))return alert("Enter all dimensions");
    v=l*w*h;
  }else{
    const r=+radiusCylinder.value,h=+heightCylinder.value;
    if([r,h].some(isNaN))return alert("Enter radius and height");
    v=Math.PI*r*r*h;
  }
  const d=liquidType.value==="custom"?+customDensity.value:{water:1,milk:1.03,oil:0.92,honey:1.42}[liquidType.value];
  if(isNaN(d))return alert("Enter valid density");
  containerResult.textContent=`Volume: ${(v/1000).toFixed(3)} L | Mass: ${(v*d).toFixed(1)} g`;
}

// Kitchen Converter
const kitchenUnits=["cup","tbsp","tsp","g","oz","ml"];
kitchenUnits.forEach(u=>{
  kitchenFrom.add(new Option(u,u));
  kitchenTo.add(new Option(u,u));
});
const ingredientGroups={
  "Dry Ingredients":{Flour:120,Sugar:200,"Brown sugar":220,Rice:195},
  "Wet Ingredients":{Water:240,Milk:245,Oil:218,Honey:340},
};
for(const group in ingredientGroups){
  const og=document.createElement("optgroup");
  og.label=group;
  for(const item in ingredientGroups[group]){
    const opt=new Option(item,item);
    og.append(opt);
  }
  kitchenIngredient.append(og);
}
function convertKitchen(){
  const val=parseFloat(kitchenInput.value);
  if(isNaN(val))return alert("Enter a number");
  const from=kitchenFrom.value,to=kitchenTo.value,ing=kitchenIngredient.value;
  const gPerCup=Object.values(ingredientGroups).flatMap(obj=>Object.entries(obj)).find(([k])=>k===ing)[1];
  const unitToCup={cup:1,tbsp:1/16,tsp:1/48,g:1/gPerCup,oz:1/(gPerCup/8),ml:1/240};
  const cupToUnit={cup:1,tbsp:16,tsp:48,g:gPerCup,oz:gPerCup/8,ml:240};
  const result=val*unitToCup[from]*cupToUnit[to];
  kitchenResult.textContent=`${val} ${from} of ${ing} = ${result.toFixed(2)} ${to}`;
}
