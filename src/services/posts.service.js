const prisma = require("../db");

const createPost = async (data) => {
  const result = await prisma.post.create({
    data,
  });
  return result;
};

const listPosts = async ({ skip, take, orderBy, where }) => {
  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip,
      take,
      orderBy: orderBy || { createdAt: "desc" },
    }),
    prisma.post.count({ where }),
  ]);
  return { data, total };
};

const getPostById = async (id) => {
  return await prisma.post.findUnique({
    where: { id },
  });
};

const updatePost = async (id, data) => {
  return await prisma.post.update({
    where: { id },
    data,
  });
};

const deletePost = async (id) => {
  return await prisma.post.delete({
    where: { id },
  });
};

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
};
