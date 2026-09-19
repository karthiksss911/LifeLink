import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import donorRoutes from "./routes/donorRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import matchActionRoutes from "./routes/matchActionRoutes.js";
import myMatchRoutes from "./routes/myMatchRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import requesterMatchRoutes from "./routes/requesterMatchRoutes.js";
const app = express();

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

const allowedOrigins = [
    "https://life-link-phi-flax.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
];

if (process.env.CLIENT_URL) {
    const urls = process.env.CLIENT_URL.split(",").map((url) => url.trim().replace(/\/$/, ""));
    urls.forEach((url) => {
        if (url && !allowedOrigins.includes(url)) {
            allowedOrigins.push(url);
        }
    });
}

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy: Origin ${origin} is not allowed`));
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "1mb" }));

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 200,
        standardHeaders: true,
        legacyHeaders: false,
    })
);

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "LifeLink API is running",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/match-actions", matchActionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/my-matches", myMatchRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/request-matches", requesterMatchRoutes);
export default app;