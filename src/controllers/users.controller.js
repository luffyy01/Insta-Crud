const {
  createUser,
  listUsers,
  getUserById,
  getUserPosts,
  getUserLikedPosts,
  updateUser,
  deleteUser,
} = require("../services/users.service");
const { parsePagination } = require("../utils/pagination");

const create = async (req, res) => {
  try {
    delete req.body.id;
    if (!req.body.username || !req.body.email || !req.body.fullname) {
      return res
        .status(400)
        .json({ error: "username, email and fullname are required" });
    }

    const { username, email, fullname, bio } = req.body;
    const result = await createUser({ username, email, fullname, bio });
    res.status(201).json(result);
  } catch (err) {
    res.status(409).json({ error: "username or email already taken" });
  }
};

const list = async (req, res) => {
  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  const { sortBy, order, isPrivate, search, hasPosts } = req.query;

  const allowedSortBy = ["createdAt", "username", "fullname"];
  const allowedOrder = ["asc", "desc"];

  const sortByVal = sortBy || "createdAt";
  if (!allowedSortBy.includes(sortByVal)) {
    return res.status(400).json({ error: "sortBy must be one of: createdAt, username, fullname" });
  }

  const orderVal = order || "desc";
  if (!allowedOrder.includes(orderVal)) {
    return res.status(400).json({ error: "order must be asc or desc" });
  }

  const where = {};
  if (isPrivate !== undefined) {
    if (isPrivate !== "true" && isPrivate !== "false") {
      return res.status(400).json({ error: "isPrivate must be true or false" });
    }
    where.isPrivate = isPrivate === "true";
  }

  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { fullname: { contains: search, mode: "insensitive" } },
    ];
  }

  if (hasPosts !== undefined) {
    if (hasPosts !== "true" && hasPosts !== "false") {
      return res.status(400).json({ error: "hasPosts must be true or false" });
    }
    where.posts = hasPosts === "true" ? { some: {} } : { none: {} };
  }

  const { pageNum, limitNum, skip } = pagination;
  const { data, total } = await listUsers({
    where,
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
  const user = await getUserById(Number(req.params.id));

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
};

const getPosts = async (req, res) => {
  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  const { pageNum, limitNum, skip } = pagination;
  const result = await getUserPosts(Number(req.params.id), {
    skip,
    take: limitNum,
  });

  if (!result) {
    return res.status(404).json({ error: "User not found" });
  }

  const { data, total } = result;
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

const getLikedPosts = async (req, res) => {
  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  const { pageNum, limitNum, skip } = pagination;
  const result = await getUserLikedPosts(Number(req.params.id), {
    skip,
    take: limitNum,
  });

  if (!result) {
    return res.status(404).json({ error: "User not found" });
  }

  const { data, total } = result;
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

const update = async (req, res) => {
  try {
    const updatedUser = await updateUser(Number(req.params.id), {
      fullname: req.body.fullname,
      bio: req.body.bio,
      isPrivate: req.body.isPrivate,
    });
    res.json(updatedUser);
  } catch (err) {
    res.status(404).json({ error: "User not found" });
  }
};

const remove = async (req, res) => {
  try {
    await deleteUser(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "User not found" });
  }
};

module.exports = {
  create,
  list,
  getOne,
  getPosts,
  getLikedPosts,
  update,
  remove,
};
