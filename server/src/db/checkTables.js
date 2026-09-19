import "dotenv/config";
import { query } from "./pool.js";

async function main() {
  try {
    const tables = await query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
    );
    console.log("Tables:", tables.rows.map((r) => r.table_name));
    for (const t of tables.rows) {
      const cols = await query(
        "SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name=$1",
        [t.table_name]
      );
      console.log(`\n--- Table: ${t.table_name} ---`);
      console.table(cols.rows);
    }
    process.exit(0);
  } catch (err) {
    console.error("Error inspecting database:", err);
    process.exit(1);
  }
}

main();
