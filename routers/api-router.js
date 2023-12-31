const apiRouter=require('express').Router()
const articlesRouter = require('./articles-router.js')
const {
    getTopics,
    getApi,
    deleteComment,
    getAllUsers,
    getUserByUsername,
    patchComment,
    postTopic,
    getArticlesByUsername,
    getCommentsByUsername
}=require('../controllers/app.controller')

apiRouter.get('/',getApi)

apiRouter.get('/healthcheck',(req,res,next)=>{
    res.sendStatus(200)
})

apiRouter.route('/topics')
    .get(getTopics)
    .post(postTopic)

apiRouter.get('/users',getAllUsers)

apiRouter.get('/users/:username',getUserByUsername)

apiRouter.get('/users/:username/articles',getArticlesByUsername)

apiRouter.get('/users/:username/comments',getCommentsByUsername)

apiRouter
    .route('/comments/:comment_id')
    .delete(deleteComment)
    .patch(patchComment)

apiRouter.use('/articles',articlesRouter)



module.exports=apiRouter