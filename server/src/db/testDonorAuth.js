import "dotenv/config";
import { query } from "./pool.js";
import jwt from "jsonwebtoken";

async function testDonorAuth() {
  try {
    const userRes = await query("SELECT id, email, role, account_status FROM users WHERE role = 'donor' LIMIT 1");
    if (!userRes.rows[0]) {
      console.log("No donor user found");
      process.exit(1);
    }
    const donor = userRes.rows[0];
    console.log("Found donor user:", donor);

    const token = jwt.sign({ id: donor.id, role: donor.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    console.log("Generated test token for donor:", token.slice(0, 20) + "...");

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Verified token payload:", verified);

    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

testDonorAuth();
