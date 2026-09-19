import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import {
    createUser,
    findUserByEmail,
} from "../db/userQueries.js";

const registerSchema = z.object({
    fullName: z.string().min(2).max(100),
    email: z.string().email().max(150),
    phone: z.string().min(10).max(15),
    password: z.string().min(8).max(100),
    role: z.enum(["donor", "requester"]).default("donor"),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

function createToken(user) {
    return jwt.sign(
        {
            id: user.id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
}

export async function register(req, res) {
    try {
        const data = registerSchema.parse(req.body);

        const existingUser = await findUserByEmail(data.email);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists",
            });
        }

        const passwordHash = await bcrypt.hash(data.password, 12);

        const user = await createUser({
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            passwordHash,
            role: data.role,
        });

        const token = createToken(user);

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            token,
            user,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: "Invalid registration data",
                errors: error.flatten().fieldErrors,
            });
        }

        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Unable to create account",
        });
    }
}

export async function login(req, res) {
    try {
        const data = loginSchema.parse(req.body);

        const user = await findUserByEmail(data.email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        if (user.account_status !== "active") {
            return res.status(403).json({
                success: false,
                message: "This account is not active",
            });
        }

        const passwordValid = await bcrypt.compare(
            data.password,
            user.password_hash
        );

        if (!passwordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const token = createToken(user);

        return res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                account_status: user.account_status,
                created_at: user.created_at,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: "Invalid login data",
                errors: error.flatten().fieldErrors,
            });
        }

        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to login",
        });
    }
}