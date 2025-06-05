export interface Category {
  id: string;
  name: string;
  slug: string;
}

export const categories: Category[] = [
  {
    id: 'gaming',
    name: 'Gaming',
    slug: 'gaming'
  },
  {
    id: 'smartwatches',
    name: 'Montres connectées',
    slug: 'montres-connectees'
  },
  {
    id: 'headphones',
    name: 'Écouteurs & Casques',
    slug: 'ecouteurs-casques'
  },
  {
    id: 'accessories',
    name: 'Accessoires',
    slug: 'accessoires'
  }
];

// Helper function to get category by slug
export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find(category => category.slug === slug);
}; 