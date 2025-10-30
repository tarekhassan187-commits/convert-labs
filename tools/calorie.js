// ==========================================
// Calorie Calculator Frontend (v3)
// With macro breakdown + item table
// ==========================================

const apiUrl = "https://convert-labs.onrender.com/api/calories";

const photoInput = document.getElementById("mealPhoto");
const analyzeBtn = document.getElementById("analyzePhotoBtn");
const photoPreview = document.getElementById("photoPreview");
const photoResult = document.getElementById("photoResult");

// === Preview Uploaded Photo ===
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

// === Analyze Photo ===
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

    // === Build result UI ===
    let html = `<h3>🍽 Estimated total: ${data.calories} kcal</h3>
      <div style="display:flex;gap:20px;margin:10px 0;font-size:15px">
        <div>🔥 <b>${data.calories}</b> kcal</div>
        <div>🥩 <b>${data.protein}</b> g Protein</div>
        <div>🌾 <b>${data.carbs}</b> g Carbs</div>
        <div>🥑 <b>${data.fat}</b> g Fat</div>
      </div>`;

    if (data.adjusted) {
      html += `<p style="color:#b45f06;font-size:13px">⚠️ Adjusted for realistic portion size</p>`;
    }

    if (data.breakdown && data.breakdown.length > 0) {
      html += `
      <table style="width:100%;border-collapse:collapse;margin-top:15px;font-size:14px">
        <thead style="background:#f3f3f3">
          <tr>
            <th style="text-align:left;padding:6px;border-bottom:1px solid #ddd;">Food Item</th>
            <th style="text-align:right;padding:6px;border-bottom:1px solid #ddd;">Calories</th>
            <th style="text-align:right;padding:6px;border-bottom:1px solid #ddd;">Protein</th>
            <th style="text-align:right;padding:6px;border-bottom:1px solid #ddd;">Carbs</th>
            <th style="text-align:right;padding:6px;border-bottom:1px solid #ddd;">Fat</th>
          </tr>
        </thead>
        <tbody>
          ${data.breakdown
            .map(
              (item) => `
            <tr>
              <td style="padding:6px;border-bottom:1px solid #eee;">${item.name}</td>
              <td style="text-align:right;padding:6px;">${item.calories} kcal</td>
              <td style="text-align:right;padding:6px;">${item.protein} g</td>
              <td style="text-align:right;padding:6px;">${item.carbs} g</td>
              <td style="text-align:right;padding:6px;">${item.fat} g</td>
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
