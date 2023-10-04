const articlesRouter=require('express').Router()
const {
    getAllArticles,
    getArticleById,
    getCommentsByArticle,
    patchArticle,
    postComment,
    postArticle
}=require('../controllers/app.controller')

articlesRouter
    .route('/')
    .get(getAllArticles)
    .post(postArticle)

articlesRouter
    .route('/:article_id')
    .get(getArticleById)
    .patch(patchArticle)


articlesRouter
    .route('/:article_id/comments')
    .get(getCommentsByArticle)
    .post(postComment)

module.exports=articlesRouter