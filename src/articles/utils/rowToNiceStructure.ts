export default function transformArticleData(rawArticle) {
  // Parse the content JSON string to actual JSON

  // Map through tags and categories to get simple arrays
  const tags = Array.isArray(rawArticle.tags) 
    ? rawArticle.tags 
    : (rawArticle.tags?.split(',') || []);
  const categories =
    rawArticle.categories?.map((catRelation) => catRelation.category.name) ||
    [];

  // Calculate average rating
  const avgRating =
    rawArticle.ArticleRating?.reduce(
      (total, rating) => total + rating.rating,
      0,
    ) / rawArticle.ArticleRating.length || 0;

  // Build the author object
  const author = {
    name: `${rawArticle.author.firstName || ''} ${rawArticle.author.lastName || ''}`.trim(),
    username: rawArticle.author.username,
    photo_url: rawArticle.author.photo_url,
  };

  // Return the transformed data
  return {
    id: rawArticle.id,
    title: rawArticle.title,
    content: rawArticle.content,
    views: rawArticle.views,
    isActive: rawArticle.isActive,
    createdAt: rawArticle.createdAt,
    updatedAt: rawArticle.updatedAt,
    authorId: rawArticle.authorId,
    conclusion: rawArticle.conclusion,
    poster: rawArticle.poster,
    subtitle: rawArticle.subtitle,
    tags: tags,
    categories: categories,
    author: author,
    avgRating: avgRating,
  };
}
