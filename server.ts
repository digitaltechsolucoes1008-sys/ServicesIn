import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("serviconnect.db");
const JWT_SECRET = process.env.JWT_SECRET || "serviconnect-super-secret-key";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    priceType TEXT NOT NULL DEFAULT 'trabalho',
    experienceYears INTEGER NOT NULL DEFAULT 0,
    workingDays TEXT NOT NULL DEFAULT '[]',
    contactInfo TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serviceId INTEGER NOT NULL,
    customerId INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (serviceId) REFERENCES services (id),
    FOREIGN KEY (customerId) REFERENCES users (id)
  );
`);

// Migration: Add columns if they don't exist
const tableInfo = db.prepare("PRAGMA table_info(services)").all() as any[];
const columns = tableInfo.map(c => c.name);
if (!columns.includes("priceType")) {
  db.exec("ALTER TABLE services ADD COLUMN priceType TEXT NOT NULL DEFAULT 'trabalho'");
}
if (!columns.includes("workingDays")) {
  db.exec("ALTER TABLE services ADD COLUMN workingDays TEXT NOT NULL DEFAULT '[]'");
}
if (!columns.includes("experienceYears")) {
  db.exec("ALTER TABLE services ADD COLUMN experienceYears INTEGER NOT NULL DEFAULT 0");
}

async function seedDatabase() {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count > 0) return;

  console.log("Seeding database with test data...");
  const password = await bcrypt.hash("password123", 10);

  const testUsers = [
    { name: "João Silva", email: "joao@example.com", cpf: "11122233344", password },
    { name: "Maria Oliveira", email: "maria@example.com", cpf: "22233344455", password },
    { name: "Carlos Santos", email: "carlos@example.com", cpf: "33344455566", password },
    { name: "Ana Costa", email: "ana@example.com", cpf: "44455566677", password },
    { name: "Pedro Rocha", email: "pedro@example.com", cpf: "55566677788", password },
  ];

  const insertUser = db.prepare("INSERT INTO users (name, email, cpf, password) VALUES (?, ?, ?, ?)");
  const insertService = db.prepare("INSERT INTO services (userId, title, description, category, price, priceType, experienceYears, workingDays, contactInfo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

  testUsers.forEach((u, index) => {
    const result = insertUser.run(u.name, u.email, u.cpf, u.password);
    const userId = result.lastInsertRowid;

    const services = [
      [
        "Pintura Residencial e Comercial",
        "Pintura de paredes, tetos, portas e janelas com acabamento profissional e limpeza pós-obra.",
        "Pintura",
        450.00,
        "trabalho",
        10,
        JSON.stringify(["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]),
        "(11) 98888-7777"
      ],
      [
        "Móveis Planejados e Reparos",
        "Fabricação de móveis sob medida e reparos em armários, gavetas e portas de madeira.",
        "Marcenaria",
        1200.00,
        "trabalho",
        15,
        JSON.stringify(["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]),
        "(11) 97777-6666"
      ],
      [
        "Instalações Elétricas e Manutenção",
        "Instalação de chuveiros, tomadas, luminárias e revisão completa da rede elétrica residencial.",
        "Elétrica",
        150.00,
        "hora",
        8,
        JSON.stringify(["Segunda", "Quarta", "Sexta"]),
        "(11) 96666-5555"
      ],
      [
        "Limpeza Residencial Completa",
        "Serviço de diarista para limpeza geral, organização e passadoria com total confiança.",
        "Limpeza",
        200.00,
        "dia",
        5,
        JSON.stringify(["Terça", "Quinta", "Sábado"]),
        "(11) 95555-4444"
      ],
      [
        "Reformas e Pequenas Construções",
        "Serviços de pedreiro para assentamento de pisos, azulejos, reboco e pequenas reformas em geral.",
        "Construção",
        350.00,
        "dia",
        12,
        JSON.stringify(["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]),
        "(11) 94444-3333"
      ]
    ];

    const s = services[index];
    insertService.run(userId, s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7]);
  });

  console.log("Database seeded successfully.");
}

async function startServer() {
  await seedDatabase();
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Request logging
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // API Routes
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, cpf, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare("INSERT INTO users (name, email, cpf, password) VALUES (?, ?, ?, ?)");
      const result = stmt.run(name, email, cpf, hashedPassword);
      const token = jwt.sign({ id: result.lastInsertRowid, email, name }, JWT_SECRET);
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
      res.json({ user: { id: result.lastInsertRowid, name, email, cpf } });
    } catch (err: any) {
      res.status(400).json({ error: err.message.includes("UNIQUE") ? "Email ou CPF já cadastrado" : "Erro ao registrar usuário" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { identifier, password } = req.body; // identifier can be email or cpf
    try {
      const user: any = db.prepare("SELECT * FROM users WHERE email = ? OR cpf = ?").get(identifier, identifier);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
      res.json({ user: { id: user.id, name: user.name, email: user.email, cpf: user.cpf } });
    } catch (err) {
      res.status(500).json({ error: "Erro interno no servidor" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  app.get("/api/auth/me", authenticate, (req: any, res) => {
    const user: any = db.prepare("SELECT id, name, email, cpf FROM users WHERE id = ?").get(req.user.id);
    res.json({ user });
  });

  // Services Routes
  app.get("/api/services", (req, res) => {
    const services = db.prepare(`
      SELECT s.*, u.name as providerName 
      FROM services s 
      JOIN users u ON s.userId = u.id
    `).all().map((s: any) => ({
      ...s,
      workingDays: JSON.parse(s.workingDays || '[]')
    }));
    res.json(services);
  });

  app.post("/api/services", authenticate, (req: any, res) => {
    const { title, description, category, price, priceType, experienceYears, workingDays, contactInfo } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO services (userId, title, description, category, price, priceType, experienceYears, workingDays, contactInfo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
      const result = stmt.run(req.user.id, title, description, category, price, priceType, experienceYears, JSON.stringify(workingDays), contactInfo);
      res.json({ id: result.lastInsertRowid });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao criar anúncio" });
    }
  });

  app.get("/api/my-services", authenticate, (req: any, res) => {
    const services = db.prepare("SELECT * FROM services WHERE userId = ?").all(req.user.id).map((s: any) => ({
      ...s,
      workingDays: JSON.parse(s.workingDays || '[]')
    }));
    res.json(services);
  });

  app.post("/api/bookings", authenticate, (req: any, res) => {
    const { serviceId } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO bookings (serviceId, customerId) VALUES (?, ?)");
      stmt.run(serviceId, req.user.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Erro ao contratar serviço" });
    }
  });

  app.get("/api/my-bookings", authenticate, (req: any, res) => {
    const bookings = db.prepare(`
      SELECT b.*, s.title as serviceTitle, u.name as providerName, u.email as providerEmail
      FROM bookings b
      JOIN services s ON b.serviceId = s.id
      JOIN users u ON s.userId = u.id
      WHERE b.customerId = ?
    `).all(req.user.id);
    res.json(bookings);
  });

  // 404 for API routes - prevent falling through to Vite/HTML
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
