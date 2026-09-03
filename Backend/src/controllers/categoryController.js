const prisma = require("../lib/prisma");

async function getCategoryStats(categoryId) {
  const stats = await prisma.donation.aggregate({
    where: { categoryId, status: "COMPLETED" },
    _count: true,
  });

  return {
    donorCount: stats._count,
  };
}

async function getAllCategories(req, res) {
  try {
    const categories = await prisma.donationCategory.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });

    const categoriesWithStats = await Promise.all(
      categories.map(async (category) => {
        const stats = await getCategoryStats(category.id);
        return { ...category, ...stats };
      }),
    );

    res.json(categoriesWithStats);
  } catch (error) {
    console.error("getAllCategories error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
}

async function getCategoryBySlug(req, res) {
  try {
    const { slug } = req.params;

    const category = await prisma.donationCategory.findUnique({
      where: { slug },
    });

    if (!category || !category.isActive) {
      return res.status(404).json({ error: "Category not found" });
    }

    const stats = await getCategoryStats(category.id);

    res.json({ ...category, ...stats });
  } catch (error) {
    console.error("getCategoryBySlug error:", error);
    res.status(500).json({ error: "Failed to fetch category" });
  }
}

module.exports = {
  getAllCategories,
  getCategoryBySlug,
};
