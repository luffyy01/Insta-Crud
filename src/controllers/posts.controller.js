const { createPost, listPosts } = require("../services/posts.service");

const create = async (req, res) => {
  delete req.body.id;
  if (!req.body.imageUrl) {
    return res.status(400).json({ error: "imageUrl is required" });
  }

  const { imageUrl, caption, location } = req.body;
  const result = await createPost({ imageUrl, caption, location });
  res.status(201).json(result);
};

const list = async (req, res) => {
  const result = await listPosts();
  res.json(result);
};

module.exports = { create, list };
