const articlesRouter=require('express').Router()
const {
    getAllArticles,
    getArticleById,
    getCommentsByArticle,
    patchArticle,
    postComment
}=require('../controllers/app.controller')

articlesRouter.get('/',getAllArticles)

articlesRouter
    .route('/:article_id')
    .get(getArticleById)
    .patch(patchArticle)


articlesRouter
    .route('/:article_id/comments')
    .get(getCommentsByArticle)
    .post(postComment)

module.exports=articlesRouter