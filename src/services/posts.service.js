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

module.exports = { createPost, listPosts };
