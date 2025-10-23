window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loading-screen").style.display = "none";
    document.getElementById("app").style.display = "block";
  }, 1000);
});

// Tabs
function showConverter(id) {
  document.querySelectorAll(".converter").forEach(el => el.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// Length
function convertLength() {
  const val = parseFloat(lengthInput.value);
  if (isNaN(val)) return alert("Enter a valid number");
  const units = { m:1, km:1000, cm:0.01, mm:0.001, "µm":1e-6, nm:1e-9, yd:0.9144, ft:0.3048, in:0.0254, ly:9.461e15 };
  const result = (val * units[lengthFrom.value]) / units[lengthTo.value];
  lengthResult.textContent = `${val} ${lengthFrom.value} = ${result.toLocaleString()} ${lengthTo.value}`;
}

// Temperature
function convertTemperature() {
  const val = parseFloat(tempInput.value);
  if (isNaN(val)) return alert("Enter a valid number");
  const f = tempFrom.value, t = tempTo.value;
  let r = val;
  if (f==="C"&&t==="F")r=val*9/5+32;
  else if(f==="F"&&t==="C")r=(val-32)*5/9;
  else if(f==="C"&&t==="K")r=val+273.15;
  else if(f==="K"&&t==="C")r=val-273.15;
  else if(f==="F"&&t==="K")r=(val-32)*5/9+273.15;
  else if(f==="K"&&t==="F")r=(val-273.15)*9/5+32;
  tempResult.textContent=`${val}°${f} = ${r.toFixed(2)}°${t}`;
}

// Volume
const volumeUnits = {
  "Liter (L)":1,"Milliliter (mL)":0.001,"Cubic meter (m³)":1000,
  "Cubic centimeter (cm³)":0.001,"Cubic inch (in³)":0.0163871,
  "Cubic foot (ft³)":28.3168,"US gallon (gal US)":3.78541,"UK gallon (gal UK)":4.54609
};
for (const k in volumeUnits){
  const o1=document.createElement("option");o1.textContent=k;o1.value=k;
  const o2=o1.cloneNode(true);
  volumeFrom.appendChild(o1);volumeTo.appendChild(o2);
}
function convertVolume(){
  const val=parseFloat(volumeInput.value);
  if(isNaN(val))return alert("Enter a valid number");
  const r=(val*volumeUnits[volumeFrom.value])/volumeUnits[volumeTo.value];
  volumeResult.textContent=`${val} ${volumeFrom.value} = ${r.toLocaleString()} ${volumeTo.value}`;
}

// Container
containerType.onchange=()=>{boxInputs.style.display=containerType.value==="box"?"block":"none";
cylinderInputs.style.display=containerType.value==="cylinder"?"block":"none";}
liquidType.onchange=()=>{customDensity.style.display=liquidType.value==="custom"?"block":"none";}
function calculateContainerVolume(){
  let v=0;if(containerType.value==="box"){
    const l=+lengthBox.value,w=+widthBox.value,h=+heightBox.value;if([l,w,h].some(isNaN))return alert("Enter all dimensions");v=l*w*h;
  }else{const r=+radiusCylinder.value,h=+heightCylinder.value;if([r,h].some(isNaN))return alert("Enter radius & height");v=Math.PI*r*r*h;}
  const d=liquidType.value==="custom"?+customDensity.value:{water:1,milk:1.03,oil:0.92,honey:1.42}[liquidType.value];
  if(isNaN(d))return alert("Enter valid density");
  containerResult.textContent=`Volume: ${(v/1000).toFixed(3)} L | Mass: ${(v*d).toFixed(2)} g`;
}

// Kitchen
const ingredients={
  "Flour":120,"Sugar":200,"Brown sugar":220,"Powdered sugar":120,"Cocoa powder":100,
  "Salt":292,"Oil":218,"Butter (melted)":227,"Honey":340,"Milk":245,"Water":240,
  "Soya sauce":230,"Vanilla":208,"Rice":195,"Oats":90,"Spices":220
};
for(const n in ingredients){
  const o=document.createElement("option");o.textContent=n;o.value=n;kitchenIngredient.appendChild(o);
}
function convertKitchen(){
  const v=parseFloat(kitchenInput.value);if(isNaN(v))return alert("Enter a number");
  const u=kitchenUnit.value,f={cup:1,tbsp:1/16,tsp:1/48};const g=ingredients[kitchenIngredient.value];
  const r=v*f[u]*g;kitchenResult.textContent=`${v} ${u}(s) of ${kitchenIngredient.value} = ${r.toFixed(1)} g`;
}

// Theme toggle
document.addEventListener("DOMContentLoaded",()=>{
  const b=document.getElementById("themeToggle");
  const saved=localStorage.getItem("theme");if(saved==="dark"){document.body.classList.add("dark-mode");b.textContent="☀️";}
  b.addEventListener("click",()=>{
    document.body.classList.toggle("dark-mode");
    const d=document.body.classList.contains("dark-mode");
    b.textContent=d?"☀️":"🌙";localStorage.setItem("theme",d?"dark":"light");
  });
});

// About modal
aboutLink.onclick=e=>{e.preventDefault();aboutModal.style.display="block";}
closeAbout.onclick=()=>aboutModal.style.display="none";
window.onclick=e=>{if(e.target===aboutModal)aboutModal.style.display="none";}

// Visitor Counter
fetch('https://api.countapi.xyz/hit/convertlabs.online/visits')
  .then(r=>r.json())
  .then(d=>{visitorCount.textContent=d.value.toLocaleString();})
  .catch(()=>{visitorCount.textContent="N/A";});
