const prisma = require("../db");

const createUser = async (data) => {
  const result = await prisma.user.create({
    data,
  });
  return result;
};

const listUsers = async ({ skip, take, orderBy }) => {
  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      skip,
      take,
      orderBy: orderBy || { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);
  return { data, total };
};

const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
  });
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

module.exports = { createUser, listUsers, getUserById, updateUser, deleteUser };
