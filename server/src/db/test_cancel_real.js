import { query } from "./pool.js";

async function testRealCancel() {
  const reqUserRes = await query("SELECT id FROM users WHERE email = 'req@gmail.com' LIMIT 1");
  const reqUserId = reqUserRes.rows[0].id;

  const res = await query(
    `UPDATE blood_requests SET status = 'cancelled', updated_at = NOW() WHERE requester_id = $1 AND status = 'open' RETURNING id, status`,
    [reqUserId]
  );
  console.log("Cancelled open requests count:", res.rows.length);
  process.exit(0);
}

testRealCancel();
