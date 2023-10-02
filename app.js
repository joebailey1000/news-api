const express=require('express')
const app=express()
const {
    getTopics,
    getApi
}=require('./controllers/app.controller')

app.get('/api/healthcheck',(req,res,next)=>{
    res.sendStatus(200)
})

app.get('/api/topics',getTopics)

app.get('/api',getApi)

app.get('*',(req,res)=>{
    res.status(404).send({msg:'For a list of valid endpoints, try GET /api'})
})

app.use((err,req,res,next)=>{
    switch(err.code){
        default:res.sendStatus(500)
    }
})

module.exports=app