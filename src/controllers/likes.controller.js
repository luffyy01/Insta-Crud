const { addLike, removeLike } = require("../services/likes.service");

const create = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const result = await addLike(Number(req.params.id), Number(userId));
    res.status(201).json(result);
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ error: err.message });
    }
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Already liked" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

const remove = async (req, res) => {
  try {
    await removeLike(Number(req.params.id), Number(req.params.userId));
    res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Like not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { create, remove };
