import { query } from "./pool.js";

async function testDistance() {
  const res = await query(`
    SELECT ROUND(
      (ST_Distance(
        ST_SetSRID(ST_MakePoint(76.2000, 10.2000), 4326)::geography,
        ST_SetSRID(ST_MakePoint(76.2500, 10.2300), 4326)::geography
      ) / 1000)::numeric, 2
    ) AS distance_km
  `);
  console.log("Calculated distance in KM:", res.rows[0].distance_km);
  process.exit(0);
}

testDistance();
