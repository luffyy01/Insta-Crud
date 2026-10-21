const prisma = require("../db");

const createPost = async (data) => {
  const result = await prisma.post.create({
    data,
  });
  return result;
};

module.exports = { createPost };
