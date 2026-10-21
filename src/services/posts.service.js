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

module.exports = { createPost, listPosts, getPostById };
