const express=require('express')
const app=express()
const {
    getTopics,
    getArticleById,
    getApi
}=require('./controllers/app.controller')

app.get('/api/healthcheck',(req,res,next)=>{
    res.sendStatus(200)
})

app.get('/api/topics',getTopics)

app.get('/api',getApi)

app.get('/api/articles/:article_id',getArticleById)

app.get('*',(req,res)=>{
    res.status(404).send({msg:'For a list of valid endpoints, try GET /api'})
})

app.use((err,req,res,next)=>{
    switch(err.code){
        case 404: res.status(404).send({msg:'Not found.'})
        case '22P02': res.status(400).send({msg:'Bad request.'})
        default:res.sendStatus(500)
    }
})

module.exports=app