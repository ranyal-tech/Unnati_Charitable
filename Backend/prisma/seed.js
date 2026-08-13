const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Food for Needy People',
    slug: 'food-for-needy',
    description:
      'Help provide nutritious meals to families and individuals who struggle to afford daily food.',
    imageUrl: '/images/food-for-needy.jpg',
    targetAmount: 500000,
  },
  {
    name: 'Stationery for Schools',
    slug: 'stationery-for-schools',
    description:
      'Support students with books, notebooks, pens, and other essential school supplies.',
    imageUrl: '/images/stationery-for-schools.jpg',
    targetAmount: 200000,
  },
  {
    name: 'Orphanage Donations',
    slug: 'orphanage-donations',
    description:
      'Contribute to the care, education, and wellbeing of children in orphanages.',
    imageUrl: '/images/orphanage-donations.jpg',
    targetAmount: 750000,
  },
  {
    name: 'Winter Essentials',
    slug: 'winter-essentials',
    description:
      'Provide blankets, warm clothes, and shelter support to those facing harsh winters.',
    imageUrl: '/images/winter-essentials.jpg',
    targetAmount: 300000,
  },
];

async function main() {
  for (const category of categories) {
    await prisma.donationCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log('Seeded donation categories successfully.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
