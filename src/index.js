const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
require("dotenv/config");

const app = express();

app.use(express.json());

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.post("/users", async (req, res) => {
  try {
    delete req.body.id;
    if (!req.body.username || !req.body.email || !req.body.fullname) {
      return res
        .status(400)
        .json({ error: "username, email and fullname are required" });
    }

    const { username, email, fullname, bio } = req.body;
    const result = await prisma.user.create({
      data: { username, email, fullname, bio },
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(409).json({ error: "username or email already taken" });
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
