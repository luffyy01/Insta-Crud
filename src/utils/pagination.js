const parsePagination = (query) => {
  const { page, limit } = query;

  if (page !== undefined && !/^[1-9]\d*$/.test(page)) {
    return { error: "page and limit must be positive integers" };
  }
  if (limit !== undefined && !/^[1-9]\d*$/.test(limit)) {
    return { error: "page and limit must be positive integers" };
  }

  const pageNum = page ? parseInt(page, 10) : 1;
  let limitNum = limit ? parseInt(limit, 10) : 10;
  if (limitNum > 50) limitNum = 50;

  const skip = (pageNum - 1) * limitNum;

  return { pageNum, limitNum, skip };
};

module.exports = { parsePagination };
