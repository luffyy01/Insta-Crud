const prisma = require("../db");

const createUser = async (data) => {
  const result = await prisma.user.create({
    data,
  });
  return result;
};

const listUsers = async ({ skip, take, orderBy, where }) => {
  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: orderBy || { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);
  return { data, total };
};

const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          posts: true,
          likes: true,
        },
      },
    },
  });
};

const getUserPosts = async (userId, { skip, take }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where: { authorId: userId },
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
    }),
    prisma.post.count({ where: { authorId: userId } }),
  ]);

  return { data, total };
};

const updateUser = async (id, data) => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};

const deleteUser = async (id) => {
  return await prisma.user.delete({
    where: {
      id,
    },
  });
};

module.exports = {
  createUser,
  listUsers,
  getUserById,
  getUserPosts,
  updateUser,
  deleteUser,
};
