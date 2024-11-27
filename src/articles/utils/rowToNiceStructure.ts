export default function transformArticleData(rawArticle) {
  // Parse the content JSON string to actual JSON

  // Map through tags and categories to get simple arrays
  const tags =
    rawArticle.ArticleTag?.map((tagRelation) => tagRelation.tag.name) || [];
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
    ...rawArticle,
    tags: tags,
    categories: categories,
    author: author,
    avgRating: avgRating,
  };
}
