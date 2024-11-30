export default function transformArticleData(rawArticle) {
  try {
    // Map through tags and categories to get simple arrays
    const tags = Array.isArray(rawArticle.tags) 
      ? rawArticle.tags 
      : (rawArticle.tags?.split(',') || []);

    // Handle categories more defensively
    const categories = rawArticle.categories?.map((catRelation) => {
      return catRelation?.category?.name || '';
    }).filter(Boolean) || [];

    // Calculate average rating with null checks
    const ratings = rawArticle.ArticleRating || [];
    const avgRating = ratings.length > 0
      ? ratings.reduce((total, rating) => total + (rating?.rating || 0), 0) / ratings.length
      : 0;

    // Build the author object with null checks
    const author = {
      name: `${rawArticle.author?.firstName || ''} ${rawArticle.author?.lastName || ''}`.trim() || rawArticle.author?.username || '',
      username: rawArticle.author?.username || '',
      photo_url: rawArticle.author?.photo_url || '',
    };

    // Return the transformed data
    return {
      id: rawArticle.id,
      title: rawArticle.title || '',
      content: rawArticle.content || '',
      views: rawArticle.views || 0,
      isActive: !!rawArticle.isActive,
      createdAt: rawArticle.createdAt || new Date(),
      updatedAt: rawArticle.updatedAt || new Date(),
      authorId: rawArticle.authorId,
      conclusion: rawArticle.conclusion || '',
      poster: rawArticle.poster || '',
      subtitle: rawArticle.subtitle || '',
      tags,
      categories,
      author,
      avgRating,
    };
  } catch (error) {
    console.error('Error transforming article data:', error);
    // Return a minimal valid article object
    return {
      id: rawArticle.id,
      title: rawArticle.title || '',
      content: rawArticle.content || '',
      views: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      authorId: rawArticle.authorId,
      conclusion: '',
      poster: '',
      subtitle: '',
      tags: [],
      categories: [],
      author: { name: '', username: '', photo_url: '' },
      avgRating: 0,
    };
  }
}
