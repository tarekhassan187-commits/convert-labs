import express from "express";
import fetch from "node-fetch";
import multer from "multer";
import cors from "cors";
import FormData from "form-data";
import fs from "fs";

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());

const AZUMIO_API_KEY = "0898a32e8d75205be339371ef3cace9a"; // 🔒 keep private

app.post("/api/calories", upload.single("file"), async (req, res) => {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path));

    const response = await fetch("https://api.caloriemama.ai/v1/foodrecognition", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${0898a32e8d75205be339371ef3cace9a}`
      },
      body: form
    });

    const data = await response.json();

    fs.unlink(req.file.path, () => {}); // clean temporary file
    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy error", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Convert Labs proxy running on port ${PORT}`));
