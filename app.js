const express=require('express')
const app=express()
const {
    getTopics
}=require('./controllers/app.controller')

app.get('/api/healthcheck',(req,res,next)=>{
    res.sendStatus(200)
})

app.get('/api/topics',getTopics)

app.use((req,res,err,next)=>{
    switch(err.code){
        default:res.sendStatus(500)
    }
})

module.exports=app