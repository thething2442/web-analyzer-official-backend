import type { Request, Response as ExpressResponse } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import db from "../dbfunctions/db";
import { users } from "../drizzle/schema";


import { CreateUserDto } from "../dto/userdto";
import { eq } from "drizzle-orm";

// Create a new user
export async function createUser(
  req: Request<{}, {}, CreateUserDto>,
  res: ExpressResponse
) {
  try {
    const dto = plainToInstance(CreateUserDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({
        errors: errors.map(e => ({
          field: e.property,
          messages: Object.values(e.constraints ?? {}),
        })),
      });
    }

    // Check if user exists (use .get() to return single row)
    const existing = await db.select().from(users).where(eq(users.email, dto.email)).get();
    if (existing) return res.status(409).json({ error: "User already exists" });

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Insert
    const row = {
      id: uuidv4(),
      email: dto.email,
      passwordHash,
      createdAt: Math.floor(Date.now() / 1000), // Unix timestamp to match schema
    };

    await db.insert(users).values(row);

    return res.status(201).json({
      success: true,
      user: { id: row.id, email: row.email, createdAt: row.createdAt },
    });
  } catch (err) {
    console.error("Error creating user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// List all users
export async function listUsers(req: Request, res: ExpressResponse) {
  try {
    const all = await db.select().from(users);
    return res.status(200).json(
      all.map(u => ({
        id: u.id,
        email: u.email,
        createdAt: u.createdAt,
      }))
    );
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Get a user by ID
export async function getUserById(
  req: Request<{ id: string }>,
  res: ExpressResponse
) {
  try {
    const { id } = req.params;
    const user = await db.select().from(users).where(eq(users.id, id)).get();
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.status(200).json({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Delete a user by ID
export async function deleteUser(
  req: Request<{ id: string }>,
  res: ExpressResponse
) {
  try {
    const { id } = req.params;
    await db.delete(users).where(eq(users.id, id));
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
