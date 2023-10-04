const apiRouter=require('express').Router()
const articlesRouter = require('./articles-router.js')
const {
    getTopics,
    getApi,
    deleteComment,
    getAllUsers,
    getUserByUsername,
    patchComment
}=require('../controllers/app.controller')

apiRouter.get('/',getApi)

apiRouter.get('/healthcheck',(req,res,next)=>{
    res.sendStatus(200)
})

apiRouter.get('/topics',getTopics)

apiRouter.get('/users',getAllUsers)

apiRouter.get('/users/:username',getUserByUsername)

apiRouter
    .route('/comments/:comment_id')
    .delete(deleteComment)
    .patch(patchComment)

apiRouter.use('/articles',articlesRouter)

module.exports=apiRouter