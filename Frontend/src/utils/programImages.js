const programImages = {
  'food-for-needy': '/images/food-for-needy.jpg',
  'stationery-for-schools': '/images/stationery-for-schools.jpg',
  'orphanage-donations': '/images/orphanage-donations.jpg',
  'winter-essentials': '/images/winter-essentials.jpg',
};

export function getProgramImageUrl(category) {
  return programImages[category.slug] || category.imageUrl || null;
}
