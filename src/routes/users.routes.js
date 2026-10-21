const express = require("express");
const router = express.Router();
const prisma = require("../db");

router.post("/", async (req, res) => {
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

router.get("/", async (req, res) => {
  const result = await prisma.user.findMany();
  res.json(result);
});

router.get("/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

router.patch("/:id", async (req, res) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: {
        fullname: req.body.fullname,
        bio: req.body.bio,
        isPrivate: req.body.isPrivate,
      },
    });
    res.json(updatedUser);
  } catch (err) {
    res.status(404).json({ error: "User not found" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.user.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "User not found" });
  }
});

module.exports = router;
