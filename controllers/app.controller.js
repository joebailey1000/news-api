const {
    fetchAllTopics,
    fetchAllArticles,
    fetchArticleById
}=require('../models/app.model')

const endpointsList=require('./api-directory/APIOBJECT')

exports.getTopics=(req,res,next)=>{
    return fetchAllTopics()
        .then((topics)=>{
            res.status(200).send({topics})
        })
}

exports.getApi=(req,res,next)=>{
    res.status(200).send({'Valid endpoints':endpointsList})
}

exports.getAllArticles=(req,res,next)=>{
    return fetchAllArticles()
        .then((articles)=>{
            res.status(200).send({articles})
        })
}

exports.getArticleById=(req,res,next)=>{
    return fetchArticleById(req.params)
        .then(article=>{
            res.status(200).send({article})
        }).catch(err=>{
            next(err)
        })
}