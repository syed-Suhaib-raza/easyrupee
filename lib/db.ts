import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

export interface UserRow {
  user_id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  created_at: Date;
}

export interface SessionRow {
  SessionID: number;
  UserID: number;
  Created: Date;
  Expires: Date;
}
