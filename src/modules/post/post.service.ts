import { table } from "node:console";
import { Post, PostStatus, Status } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { PostWhereInput } from "../../../generated/prisma/models";
import { date } from "better-auth/*";
import { auth } from "../../lib/auth";
import { UserRole } from "../../middlewares/auth";

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">,
  userId: string
) => {
  const result = await prisma.post.create({
    data: {
      ...data,
      authorId: userId,
    },
  });
  return result;
};

const getAllPost = async ({
  search,
  tags,
  isFeatured,
  status,
  authorId,
  page,
  limit,
  skip,
  sortBy,
  sortOrder,
}: {
  search: string | undefined;
  tags: string[] | [];
  isFeatured: boolean | undefined;
  status: PostStatus | undefined;
  authorId: string | undefined;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}) => {
  // console.log("get all post");

  const andCondition: PostWhereInput[] = [];
  if (search) {
    andCondition.push({
      OR: [
        {
          title: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: search as string,
          },
        },
      ],
    });
  }

  if (tags.length > 0) {
    andCondition.push({
      tags: {
        hasEvery: tags,
      },
    });
  }
  if (typeof isFeatured === "boolean") {
    andCondition.push({
      isFeatured,
    });
  }

  if (status) {
    andCondition.push({
      status,
    });
  }

  if (authorId) {
    andCondition.push({
      authorId,
    });
  }

  const allPost = await prisma.post.findMany({
    take: limit,
    skip,
    where: {
      AND: andCondition,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      _count: {
        select: { comments: true },
      },
    },
  });

  const total = await prisma.post.count({
    where: {
      AND: andCondition,
    },
  });
  return {
    data: allPost,
    pagination: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getPostById = async (postId: string) => {
  return await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });
    const postData = await tx.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        comments: {
          where: {
            parentId: null,
            status: Status.APPROVED,
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            replies: {
              where: {
                status: Status.APPROVED,
              },
              orderBy: {
                createdAt: "asc",
              },
              include: {
                replies: {
                  where: {
                    status: Status.APPROVED,
                  },
                  orderBy: {
                    createdAt: "asc",
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });
    return postData;
  });
};

const getMyPosts = async (authorId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id: authorId,
      status: "ACTIVE",
    },
    select: {
      id: true,
    },
  });
  const result = await prisma.post.findMany({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  // const total = await prisma.post.aggregate({
  // _count:{
  //   id:true
  // },
  // where:{
  //   authorId
  // }
  // })

  return result;
};

const updateMyPost = async (
  postId: string,
  data: Partial<Post>,
  authorId: string,
  isAdmin: boolean
) => {
  console.log({ postId, data, authorId });

  const postData = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });
  if (!isAdmin && postData.authorId !== authorId) {
    throw new Error("You are not the creator of this post !!!");
  }
  if (!isAdmin) {
    delete data.isFeatured;
  }

  const result = await prisma.post.update({
    where: {
      id: postData.id,
    },
    data,
  });
  return result;
};

const deletePost = async (
  postId: string,
  authorId: string,
  isAdmin: boolean
) => {
  const postData = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });
  if (!isAdmin && postData.authorId !== authorId) {
    throw new Error("You are not the creator of this post !!!");
  }
  return await prisma.post.delete({
    where: {
      id: postId,
    },
  });
};

// statistics

const getStats = async () => {
  return await prisma.$transaction(async (tx) => {
    const [
      totalPosts,
      publishedPost,
      draftPosts,
      archivedPosts,
      totalComments,
      approvedComments,
      rejectComments,
      totalUser,
      userCount,
      adminCount,
      totalViews,
    ] = await Promise.all([
      await tx.post.count(),
      await tx.post.count({
        where: {
          status: PostStatus.PUBLISHED,
        },
      }),
      await tx.post.count({
        where: {
          status: PostStatus.DRAFT,
        },
      }),
      await tx.post.count({
        where: {
          status: PostStatus.ARCHIVED,
        },
      }),
      await tx.comment.count(),
      await tx.comment.count({ where: { status: Status.APPROVED } }),
      await tx.comment.count({ where: { status: Status.REJECT } }),
      await tx.user.count(),
      await tx.user.count({ where: { role: "USER" } }),
      await tx.user.count({ where: { role: "ADMIN" } }),
      await tx.post.aggregate({ _sum: { views: true } }),
    ]);

    return {
      totalPosts,
      publishedPost,
      draftPosts,
      archivedPosts,
      totalComments,
      approvedComments,
      rejectComments,
      totalUser,
      userCount,
      adminCount,
      totalViews: totalViews._sum.views,
    };
  });
};

export const Postservice = {
  createPost,
  getAllPost,
  getPostById,
  getMyPosts,
  updateMyPost,
  deletePost,
  getStats,
};
