import "dotenv/config";
import { query } from "./pool.js";

try {
    const result = await query("SELECT NOW() AS current_time");

    console.log("✅ Database connected successfully");
    console.log("Database time:", result.rows[0].current_time);

    process.exit(0);
} catch (error) {
    console.error("❌ Database connection failed");
    console.error(error.message);

    process.exit(1);
}