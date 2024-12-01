export default function transformArticleData(rawArticle) {
  try {
    if (!rawArticle) {
      console.error('transformArticleData received null/undefined article');
      throw new Error('Article data is null or undefined');
    }

    console.log('Transforming article:', { id: rawArticle.id, title: rawArticle.title });

    // Safely handle tags
    let tags = [];
    try {
      tags = Array.isArray(rawArticle.tags) 
        ? rawArticle.tags 
        : (rawArticle.tags?.split(',').filter(Boolean) || []);
    } catch (e) {
      console.error('Error processing tags:', e);
    }

    // Safely handle categories
    let categories = [];
    try {
      categories = rawArticle.categories?.map((catRelation) => {
        if (!catRelation || !catRelation.category) return '';
        return catRelation.category.name || '';
      }).filter(Boolean) || [];
    } catch (e) {
      console.error('Error processing categories:', e);
    }

    // Safely calculate average rating
    let avgRating = 0;
    try {
      const ratings = Array.isArray(rawArticle.ArticleRating) ? rawArticle.ArticleRating : [];
      avgRating = ratings.length > 0
        ? ratings.reduce((total, rating) => total + (rating?.rating || 0), 0) / ratings.length
        : 0;
    } catch (e) {
      console.error('Error calculating average rating:', e);
    }

    // Safely build author object
    const author = {
      name: '',
      username: '',
      photo_url: '',
    };
    try {
      if (rawArticle.author) {
        author.name = `${rawArticle.author.firstName || ''} ${rawArticle.author.lastName || ''}`.trim() || rawArticle.author.username || '';
        author.username = rawArticle.author.username || '';
        author.photo_url = rawArticle.author.photo_url || '';
      }
    } catch (e) {
      console.error('Error processing author data:', e);
    }

    // Return the transformed data with safe fallbacks
    const transformedArticle = {
      id: rawArticle.id || 0,
      title: rawArticle.title || '',
      content: rawArticle.content || '',
      views: typeof rawArticle.views === 'number' ? rawArticle.views : 0,
      isActive: Boolean(rawArticle.isActive),
      status: rawArticle.status || '',
      createdAt: rawArticle.createdAt instanceof Date ? rawArticle.createdAt : new Date(),
      updatedAt: rawArticle.updatedAt instanceof Date ? rawArticle.updatedAt : new Date(),
      authorId: rawArticle.authorId || 0,
      conclusion: rawArticle.conclusion || '',
      poster: rawArticle.poster || '',
      subtitle: rawArticle.subtitle || '',
      tags,
      categories,
      author,
      avgRating,
    };

    console.log('Successfully transformed article:', { 
      id: transformedArticle.id,
      status: transformedArticle.status,
      tagsCount: transformedArticle.tags.length,
      categoriesCount: transformedArticle.categories.length
    });
    
    return transformedArticle;
  } catch (error) {
    console.error('Error transforming article data:', error);
    console.error('Raw article data:', JSON.stringify({
      id: rawArticle?.id,
      title: rawArticle?.title,
      status: rawArticle?.status
    }, null, 2));
    
    // Return a minimal valid article object with the original ID if possible
    return {
      id: rawArticle?.id || 0,
      title: rawArticle?.title || '',
      content: rawArticle?.content || '',
      views: 0,
      isActive: true,
      status: rawArticle?.status || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      authorId: rawArticle?.authorId || 0,
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
