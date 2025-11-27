import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import multer from "multer";
import fs from "fs";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const DEAPI_API_KEY = process.env.DEAPI_API_KEY;

app.use(cors());
app.use(express.json());

// Multer setup for image uploads
const upload = multer({ dest: "uploads/" });

// --------------------
// TEXT → IMAGE
// --------------------
app.post("/api/text2image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required." });

    const response = await fetch("https://api.deapi.ai/text2image", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DEAPI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt, model: "Flux" })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate image." });
  }
});

// --------------------
// TEXT → VIDEO
// --------------------
app.post("/api/text2video", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required." });

    const response = await fetch("https://api.deapi.ai/text2video", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DEAPI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt, model: "Runway Gen-3 Alpha" })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate video." });
  }
});

// --------------------
// IMAGE → VIDEO
// --------------------
app.post("/api/image2video", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Image file is required." });

    const imageData = fs.readFileSync(req.file.path, { encoding: "base64" });

    const response = await fetch("https://api.deapi.ai/image2video", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DEAPI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "Runway Gen-3 Alpha",
        image: imageData
      })
    });

    // Delete temp uploaded file
    fs.unlinkSync(req.file.path);

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate video." });
  }
});

// --------------------
app.get("/", (req, res) => res.send("Convert Labs AI Tools Backend is running."));
app.listen(port, () => console.log(`Backend running on port ${port}`));
