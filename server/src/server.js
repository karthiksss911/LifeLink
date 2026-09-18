import "dotenv/config";
import express from "express";

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "LifeLink API is running",
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`LifeLink server running on http://localhost:${PORT}`);
});