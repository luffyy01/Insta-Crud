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
  const result = await listUsers();
  res.json(result);
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
