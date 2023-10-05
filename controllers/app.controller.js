const {
    fetchAllTopics,
    fetchCommentsByArticle,
    fetchAllArticles,
    fetchArticleById,
    addCommentToDatabase,
    voteOnArticle,
    removeCommentFromDatabase,
    fetchAllUsers,
    fetchSpecificUser,
    voteOnComment,
    addArticleToDatabase,
    addTopicToDatabase,
    removeArticleFromDatabase
}=require('../models/app.model')

const endpointsList=require('../endpoints.json')

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
    return fetchAllArticles(req.query)
        .then((articles)=>{
            res.status(200).send({articles})
        }).catch(next)
}

exports.getArticleById=(req,res,next)=>{
    return fetchArticleById(req.params)
        .then(article=>{
            res.status(200).send({article})
        }).catch(next)
}

exports.getCommentsByArticle=(req,res,next)=>{
    return fetchCommentsByArticle(req.params,req.query)
        .then(comments=>{
            res.status(200).send({comments})
        }).catch(next)
}

exports.postComment=(req,res,next)=>{
    return addCommentToDatabase(req.body,req.params)
        .then(comment=>{
            res.status(201).send({comment})
        }).catch(next)
}

exports.patchArticle=(req,res,next)=>{
    return voteOnArticle(req.body,req.params)
        .then(article=>{
            res.status(200).send({article})
        }).catch(next)
}

exports.deleteComment=(req,res,next)=>{
    return removeCommentFromDatabase(req.params)
        .then(()=>{
            res.sendStatus(204)
        }).catch(next)
}

exports.getAllUsers=(req,res,next)=>{
    return fetchAllUsers()
        .then(users=>{
            res.status(200).send({users})
        })
}

exports.getUserByUsername=(req,res,next)=>{
    return fetchSpecificUser(req.params)
        .then(user=>{
            res.status(200).send({user})
        }).catch(next)
}

exports.patchComment=(req,res,next)=>{
    return voteOnComment(req.body,req.params)
        .then(comment=>{
            res.status(200).send({comment})
        }).catch(next)
}

exports.postArticle=(req,res,next)=>{
    return addArticleToDatabase(req.body)
        .then(posted_article=>{
            res.status(201).send({posted_article})
        }).catch(next)
}

exports.postTopic=(req,res,next)=>{
    return addTopicToDatabase(req.body)
        .then(posted_topic=>{
            res.status(201).send({posted_topic})
        }).catch(next)
}

exports.deleteArticle=(req,res,next)=>{
    return removeArticleFromDatabase(req.params)
        .then(()=>{
            res.sendStatus(204)
        }).catch(next)
}