const prisma = require("../db");

const createPost = async (data) => {
  const result = await prisma.post.create({
    data,
  });
  return result;
};

const listPosts = async () => {
  return await prisma.post.findMany();
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

module.exports = { createPost, listPosts, getPostById, updatePost };
