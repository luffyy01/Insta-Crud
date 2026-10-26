const {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../services/users.service");

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
  const { page, limit, sortBy, order, isPrivate, search } = req.query;

  if (page !== undefined && !/^[1-9]\d*$/.test(page)) {
    return res.status(400).json({ error: "page and limit must be positive integers" });
  }
  if (limit !== undefined && !/^[1-9]\d*$/.test(limit)) {
    return res.status(400).json({ error: "page and limit must be positive integers" });
  }

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

  const pageNum = page ? parseInt(page, 10) : 1;
  let limitNum = limit ? parseInt(limit, 10) : 10;
  if (limitNum > 50) limitNum = 50;

  const skip = (pageNum - 1) * limitNum;
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

module.exports = { create, list, getOne, update, remove };
