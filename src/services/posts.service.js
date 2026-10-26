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
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullname: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);
  return { data, total };
};

const getPostById = async (id) => {
  return await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          fullname: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });
};

const getPostLikes = async (postId) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return null;

  return await prisma.user.findMany({
    where: {
      likes: {
        some: {
          postId,
        },
      },
    },
    select: {
      id: true,
      username: true,
      fullname: true,
    },
    orderBy: {
      username: "asc",
    },
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
  getPostLikes,
  updatePost,
  deletePost,
};
