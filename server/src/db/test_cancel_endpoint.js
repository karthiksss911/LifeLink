import { query } from "./pool.js";
import { cancelBloodRequest } from "../controllers/requestController.js";

async function testCancel() {
  try {
    // 1. Get a requester user
    const reqUserRes = await query("SELECT id, role FROM users WHERE role = 'requester' LIMIT 1");
    if (!reqUserRes.rows[0]) {
      console.log("No requester user found");
      process.exit(0);
    }
    const requester = reqUserRes.rows[0];

    // 2. Create a test request for this requester
    const createRes = await query(
      `INSERT INTO blood_requests
        (requester_id, blood_group, units_required, hospital_name, hospital_address, location, urgency, notes)
       VALUES
        ($1, 'O+', 1, 'Cancel Test Hosp', '123 St', ST_SetSRID(ST_MakePoint(77.59, 12.97), 4326)::geography, 'normal', 'Test cancel')
       RETURNING id, status, requester_id`,
      [requester.id]
    );
    const reqObj = createRes.rows[0];
    console.log("Created request:", reqObj.id, "Owner:", reqObj.requester_id);

    // 3. Mock Express req and res
    const req = {
      params: { requestId: reqObj.id },
      user: { id: requester.id, role: requester.role },
    };

    let responseCode = null;
    let responseData = null;

    const res = {
      status: (code) => {
        responseCode = code;
        return {
          json: (data) => {
            responseData = data;
            return data;
          },
        };
      },
      json: (data) => {
        responseCode = 200;
        responseData = data;
        return data;
      },
    };

    await cancelBloodRequest(req, res);

    console.log("Cancel Controller Result Status:", responseCode);
    console.log("Cancel Controller Result Data:", responseData);

    process.exit(0);
  } catch (err) {
    console.error("Cancel Test Error:", err);
    process.exit(1);
  }
}

testCancel();
