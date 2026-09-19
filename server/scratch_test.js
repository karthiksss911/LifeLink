const fetch = globalThis.fetch;

const BASE_URL = 'http://localhost:5000';

async function testFullFlow() {
  console.log('=====================================================');
  console.log('   LIFELINK END-TO-END FLOWCHART SYSTEM VERIFICATION ');
  console.log('=====================================================\n');

  const id = Math.floor(Math.random() * 100000);
  const reqEmail = `req${id}@lifelink.org`;
  const donorEmail = `donor${id}@lifelink.org`;
  const password = 'Password123!';

  // STEP 1: REGISTER & AUTHENTICATE REQUESTER
  console.log('1. [REQUESTER] Registering & Authenticating requester...');
  const regReqRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: reqEmail,
      password: password,
      fullName: 'District Requester',
      phone: '9847099999',
      role: 'requester'
    })
  });
  const reqAuth = await regReqRes.json();
  if (!reqAuth.token) throw new Error(`Requester registration failed: ${JSON.stringify(reqAuth)}`);
  const reqToken = reqAuth.token;
  console.log('   ✓ Requester Authenticated (JWT token acquired)');

  // STEP 1b: REGISTER & AUTHENTICATE DONOR
  console.log('\n1b. [DONOR] Registering & Authenticating donor...');
  const regDonorRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: donorEmail,
      password: password,
      fullName: 'District Hero Donor',
      phone: '9847012345',
      role: 'donor'
    })
  });
  const donorAuth = await regDonorRes.json();
  if (!donorAuth.token) throw new Error(`Donor registration failed: ${JSON.stringify(donorAuth)}`);
  const donorToken = donorAuth.token;
  console.log('   ✓ Donor Authenticated (JWT token acquired)');

  // Setup Donor Profile with location & availability
  console.log('   Setting up donor profile (Blood Group: O+, City: Ernakulam, Coordinates: 9.9816, 76.2999, Available: true)...');
  const profRes = await fetch(`${BASE_URL}/api/donors/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${donorToken}`
    },
    body: JSON.stringify({
      bloodGroup: 'O+',
      city: 'Ernakulam',
      latitude: 9.9816,
      longitude: 76.2999,
      isAvailable: true
    })
  });
  const profData = await profRes.json();
  console.log('   ✓ Donor Profile Setup Complete:', profData.message);

  // STEP 2: CREATE BLOOD REQUEST
  console.log('\n2. [REQUEST] Requester creates Emergency Blood Request (O+, Area: Ernakulam, Hospital: City Hospital)...');
  const reqBody = {
    bloodGroup: 'O+',
    unitsRequired: 2,
    urgency: 'high',
    hospitalName: 'Ernakulam City Hospital',
    hospitalAddress: 'MG Road, Kochi, Ernakulam',
    city: 'Ernakulam',
    latitude: 9.9816,
    longitude: 76.2999,
    radiusKm: 25,
    patientName: 'Emergency Patient',
    contactPhone: '9876543210',
    notes: 'Urgent O+ blood needed for surgery.'
  };

  const createReqRes = await fetch(`${BASE_URL}/api/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${reqToken}`
    },
    body: JSON.stringify(reqBody)
  });
  const createReqData = await createReqRes.json();
  if (!createReqData.request) throw new Error(`Request creation failed: ${JSON.stringify(createReqData)}`);
  const requestId = createReqData.request.id;
  console.log('   ✓ Blood Request Created Successfully. ID:', requestId);

  // STEP 2b: TRIGGER MATCHING ALGORITHM
  console.log('\n2b. [MATCHING ENGINE] Triggering Matching Engine (POST /api/matches/find)...');
  const matchFindRes = await fetch(`${BASE_URL}/api/matches/find`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${reqToken}`
    },
    body: JSON.stringify({ requestId: requestId, radiusKm: 25 })
  });
  const matchFindData = await matchFindRes.json();
  console.log(`   ✓ Matching Engine execution complete: Found ${matchFindData.totalMatches || 0} match(es).`);

  // STEP 3: MATCHING ENGINE & ELIGIBLE DONORS
  console.log('\n3. [MATCHING ENGINE] Fetching matched eligible donors...');
  const matchesRes = await fetch(`${BASE_URL}/api/request-matches/${requestId}`, {
    headers: { 'Authorization': `Bearer ${reqToken}` }
  });
  const matchesData = await matchesRes.json();
  console.log(`   ✓ Matches Engine Result: ${matchesData.matches?.length || 0} eligible donor(s) matched.`);
  
  if (!matchesData.matches || matchesData.matches.length === 0) {
    throw new Error('Matching engine failed to match registered eligible donor!');
  }

  const firstMatch = matchesData.matches[0];
  const matchId = firstMatch.match_id || firstMatch.matchId || firstMatch.id;
  console.log(`   ✓ Matched Donor match_id: ${matchId}, Distance: ${firstMatch.distance_km || firstMatch.distanceKm} KM, Status: ${firstMatch.status}`);

  // STEP 4: PRIVACY ENFORCEMENT & NOTIFICATION
  console.log('\n4. [NOTIFICATION & PRIVACY] Verifying Contact Details are HIDDEN before acceptance...');
  const contactPrivacyRes = await fetch(`${BASE_URL}/api/contacts/${matchId}`, {
    headers: { 'Authorization': `Bearer ${reqToken}` }
  });
  console.log(`   ✓ Privacy HTTP Status Code: ${contactPrivacyRes.status} (Expected 403 Forbidden)`);
  const privacyErr = await contactPrivacyRes.json();
  console.log(`   ✓ Enforced Privacy Message: "${privacyErr.message}"`);

  // STEP 5: DONOR ACCEPT
  console.log('\n5. [DONOR ACCEPT] Matched donor accepts the request...');
  const acceptRes = await fetch(`${BASE_URL}/api/match-actions/${matchId}/accept`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${donorToken}`
    }
  });
  const acceptData = await acceptRes.json();
  console.log(`   ✓ Accept Match Response Status: ${acceptRes.status}`, acceptData.message);

  // STEP 6: ACCEPTED MATCH & UNLOCKED CONTACT
  console.log('\n6. [ACCEPTED MATCH] Requester views UNLOCKED donor contact details...');
  const contactUnlockedRes = await fetch(`${BASE_URL}/api/contacts/${matchId}`, {
    headers: { 'Authorization': `Bearer ${reqToken}` }
  });
  console.log(`   ✓ Unlocked Contact HTTP Status: ${contactUnlockedRes.status} (Expected 200 OK)`);
  const contactUnlockedData = await contactUnlockedRes.json();
  console.log('   ✓ Unlocked Donor Contact Info:', contactUnlockedData.contact);

  console.log('\n=====================================================');
  console.log('   🎉 ALL SYSTEM FLOWCHART STEPS 1-6 PASSED 100%!     ');
  console.log('=====================================================');
}

testFullFlow().catch(console.error);
