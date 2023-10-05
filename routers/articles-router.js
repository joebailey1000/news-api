const articlesRouter=require('express').Router()
const {
    getAllArticles,
    getArticleById,
    getCommentsByArticle,
    patchArticle,
    postComment,
    postArticle,
    deleteArticle
}=require('../controllers/app.controller')

articlesRouter
    .route('/')
    .get(getAllArticles)
    .post(postArticle)

articlesRouter
    .route('/:article_id')
    .get(getArticleById)
    .patch(patchArticle)
    .delete(deleteArticle)


articlesRouter
    .route('/:article_id/comments')
    .get(getCommentsByArticle)
    .post(postComment)

module.exports=articlesRouter