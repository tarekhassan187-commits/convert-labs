import express from "express";
import fetch from "node-fetch";
import multer from "multer";
import FormData from "form-data";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 3000;
const AZUMIO_KEY = process.env.AZUMIO_API_KEY; // keep in Render Environment Variables

// Serve static frontend
app.use(express.static("."));

// API route to handle photo analysis
app.post("/api/calories", upload.single("image"), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("image", req.file.buffer, { filename: req.file.originalname });
    const response = await fetch("https://api-portal.azumio.com/v1/foodrecognition", {
      method: "POST",
      headers: { "Authorization": `Bearer ${AZUMIO_KEY}` },
      body: formData
    });
    const data = await response.json();
    if (!data || !data.items) throw new Error("No response from API");

    const totalCalories = data.items.reduce((sum, item) => sum + (item.calories || 0), 0);
    const names = data.items.map(i => i.name).join(", ");

    res.json({ calories: totalCalories, description: names });
  } catch (err) {
    console.error(err);
    res.json({ error: "Analysis failed" });
  }
});

app.listen(PORT, () => console.log(`Convert Labs proxy running on port ${PORT}`));
