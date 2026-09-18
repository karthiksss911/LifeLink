import { query } from "./pool.js";

export async function findUserByEmail(email) {
    const result = await query(
        `SELECT id, full_name, email, phone, role, password_hash, account_status, created_at
     FROM users
     WHERE LOWER(email) = LOWER($1)
     LIMIT 1`,
        [email]
    );

    return result.rows[0] || null;
}

export async function findUserById(id) {
    const result = await query(
        `SELECT id, full_name, email, phone, role, account_status, created_at
     FROM users
     WHERE id = $1
     LIMIT 1`,
        [id]
    );

    return result.rows[0] || null;
}

export async function createUser({
    fullName,
    email,
    phone,
    passwordHash,
    role = "donor",
}) {
    const result = await query(
        `INSERT INTO users
      (full_name, email, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, full_name, email, phone, role, account_status, created_at`,
        [fullName, email, phone, passwordHash, role]
    );

    return result.rows[0];
}