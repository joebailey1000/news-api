const express=require('express')
const app=express()
const apiRouter=require('./routers/api-router.js')

app.use(express.json())

app.use('/api',apiRouter)

app.get('*',(req,res)=>{
    res.status(404).send({msg:'For a list of valid endpoints, try GET /api'})
})

app.use((err,req,res,next)=>{
    switch(err.code){
        case 404: res.status(404).send({msg:'Not found.'})
        case 400:
        case '23502':
        case '23503':
        case '22P02': res.status(400).send({msg:'Bad request.'})
        default:res.sendStatus(500)
    }
})

module.exports=app