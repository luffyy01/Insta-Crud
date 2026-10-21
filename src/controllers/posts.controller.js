const {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../services/posts.service");

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

const getOne = async (req, res) => {
  const post = await getPostById(Number(req.params.id));

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  res.json(post);
};

const update = async (req, res) => {
  try {
    const updatedPost = await updatePost(Number(req.params.id), {
      caption: req.body.caption,
      location: req.body.location,
    });
    res.json(updatedPost);
  } catch (err) {
    res.status(404).json({ error: "Post not found" });
  }
};

const remove = async (req, res) => {
  try {
    await deletePost(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "Post not found" });
  }
};

module.exports = { create, list, getOne, update, remove };
