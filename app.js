const express=require('express')
const app=express()
const {
    getTopics,
    getAllArticles,
    getArticleById,
    getApi,
    getCommentsByArticle,
    postComment,
    patchArticle,
    deleteComment,
    getAllUsers
}=require('./controllers/app.controller')

app.use(express.json())

app.get('/api/healthcheck',(req,res,next)=>{
    res.sendStatus(200)
})

app.get('/api/topics',getTopics)

app.get('/api',getApi)

app.get('/api/articles',getAllArticles)

app.get('/api/articles/:article_id',getArticleById)

app.get('/api/articles/:article_id/comments',getCommentsByArticle)

app.get('/api/users',getAllUsers)

app.get('*',(req,res)=>{
    res.status(404).send({msg:'For a list of valid endpoints, try GET /api'})
})


app.post('/api/articles/:article_id/comments',postComment)


app.patch('/api/articles/:article_id',patchArticle)


app.delete('/api/comments/:comment_id',deleteComment)


app.use((err,req,res,next)=>{
    console.log(err)
    switch(err.code){
        case 404: res.status(404).send({msg:'Not found.'})
        case '23502':
        case '23503':
        case '22P02': res.status(400).send({msg:'Bad request.'})
        default:res.sendStatus(500)
    }
})

module.exports=app