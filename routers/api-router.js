const apiRouter=require('express').Router()
const articlesRouter = require('./articles-router.js')
const {
    getTopics,
    getApi,
    deleteComment,
    getAllUsers
}=require('../controllers/app.controller')

apiRouter.get('/',getApi)

apiRouter.get('/healthcheck',(req,res,next)=>{
    res.sendStatus(200)
})

apiRouter.get('/topics',getTopics)

apiRouter.get('/users',getAllUsers)

apiRouter.delete('/comments/:comment_id',deleteComment)

apiRouter.use('/articles',articlesRouter)

module.exports=apiRouter