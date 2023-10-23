const express=require('express')
const app=express()
const apiRouter=require('./routers/api-router.js')
const cors=require('cors')

app.use(cors())

app.use(express.json())

app.use('/api',apiRouter)

app.get('*',(req,res)=>{
    res.status(404).send({msg:'For a list of valid endpoints, try GET /api'})
})

app.use((err,req,res,next)=>{
    console.log(err)
    if (err.status===400)res.status(400).send({msg:`Could not parse argument containing '%' (incorrect URL formatting).`})
    switch(err.code){
        case 404: res.status(404).send({msg:'Not found.'})
        case 400:
        case '23502':
        case '23503':
        case '22P02':
        case '08P01': res.status(400).send({msg:'Bad request.'})
        default:res.sendStatus(500)
    }
})

module.exports=app