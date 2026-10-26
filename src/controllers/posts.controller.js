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
  const { page, limit, sortBy, order } = req.query;

  if (page !== undefined && !/^[1-9]\d*$/.test(page)) {
    return res.status(400).json({ error: "page and limit must be positive integers" });
  }
  if (limit !== undefined && !/^[1-9]\d*$/.test(limit)) {
    return res.status(400).json({ error: "page and limit must be positive integers" });
  }

  const allowedSortBy = ["createdAt", "updatedAt"];
  const allowedOrder = ["asc", "desc"];

  const sortByVal = sortBy || "createdAt";
  if (!allowedSortBy.includes(sortByVal)) {
    return res.status(400).json({ error: "sortBy must be one of: createdAt, updatedAt" });
  }

  const orderVal = order || "desc";
  if (!allowedOrder.includes(orderVal)) {
    return res.status(400).json({ error: "order must be asc or desc" });
  }

  const pageNum = page ? parseInt(page, 10) : 1;
  let limitNum = limit ? parseInt(limit, 10) : 10;
  if (limitNum > 50) limitNum = 50;

  const skip = (pageNum - 1) * limitNum;
  const { data, total } = await listPosts({
    skip,
    take: limitNum,
    orderBy: { [sortByVal]: orderVal },
  });
  const totalPages = total === 0 ? 0 : Math.ceil(total / limitNum);

  res.json({
    data,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    },
  });
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
