const {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../services/posts.service");

const create = async (req, res) => {
  delete req.body.id;
  const { imageUrl, authorId, caption, location } = req.body;

  if (!imageUrl || !authorId) {
    return res.status(400).json({ error: "imageUrl and authorId are required" });
  }

  try {
    const result = await createPost({
      imageUrl,
      authorId: Number(authorId),
      caption,
      location,
    });
    res.status(201).json(result);
  } catch (err) {
    if (err.code === "P2003" || err.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

const list = async (req, res) => {
  const { page, limit, sortBy, order, location, search, from, to } = req.query;

  if (page !== undefined && !/^[1-9]\d*$/.test(page)) {
    return res.status(400).json({ error: "page and limit must be positive integers" });
  }
  if (limit !== undefined && !/^[1-9]\d*$/.test(limit)) {
    return res.status(400).json({ error: "page and limit must be positive integers" });
  }

  const allowedSortBy = ["createdAt", "updatedAt", "likes"];
  const allowedOrder = ["asc", "desc"];

  const sortByVal = sortBy || "createdAt";
  if (!allowedSortBy.includes(sortByVal)) {
    return res.status(400).json({ error: "sortBy must be one of: createdAt, updatedAt, likes" });
  }

  const orderVal = order || "desc";
  if (!allowedOrder.includes(orderVal)) {
    return res.status(400).json({ error: "order must be asc or desc" });
  }

  if (from !== undefined && isNaN(new Date(from).getTime())) {
    return res.status(400).json({ error: "from and to must be valid dates" });
  }
  if (to !== undefined && isNaN(new Date(to).getTime())) {
    return res.status(400).json({ error: "from and to must be valid dates" });
  }

  const where = {};
  if (location) {
    where.location = { equals: location, mode: "insensitive" };
  }
  if (search) {
    where.caption = { contains: search, mode: "insensitive" };
  }
  if (from || to) {
    where.createdAt = {};
    if (from) {
      where.createdAt.gte = new Date(from);
    }
    if (to) {
      where.createdAt.lt = new Date(to);
    }
  }

  const orderBy =
    sortByVal === "likes"
      ? [{ likes: { _count: orderVal } }, { createdAt: "desc" }]
      : { [sortByVal]: orderVal };

  const pageNum = page ? parseInt(page, 10) : 1;
  let limitNum = limit ? parseInt(limit, 10) : 10;
  if (limitNum > 50) limitNum = 50;

  const skip = (pageNum - 1) * limitNum;
  const { data, total } = await listPosts({
    where,
    skip,
    take: limitNum,
    orderBy,
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
