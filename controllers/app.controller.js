const {
    fetchAllTopics,
    fetchCommentsByArticle,
    fetchAllArticles,
    fetchArticleById,
    addCommentToDatabase,
    voteOnArticle,
    fetchAllUsers
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

exports.getCommentsByArticle=(req,res,next)=>{
    return fetchCommentsByArticle(req.params)
        .then(comments=>{
            res.status(200).send({comments})
        }).catch(err=>{
            next(err)
        })
}

exports.postComment=(req,res,next)=>{
    return addCommentToDatabase(req.body,req.params)
        .then(comment=>{
            res.status(201).send({comment})
        }).catch(err=>{
            next(err)
        })
}

exports.patchArticle=(req,res,next)=>{
    return voteOnArticle(req.body,req.params)
        .then(article=>{
            res.status(200).send({article})
        }).catch(err=>{
            next(err)
        })
}

exports.getAllUsers=(req,res,next)=>{
    return fetchAllUsers()
        .then(users=>{
            res.status(200).send({users})
        })
}