const db=require('../db/connection')

exports.fetchAllTopics=()=>{
    return db.query('SELECT * FROM topics')
        .then(({rows})=>{
            return rows
        })
}

exports.fetchAllArticles=()=>{
    return db.query(`SELECT articles.article_id,title,topic,articles.author,
        articles.created_at,articles.votes,article_img_url, COUNT(comment_id) AS comment_count FROM articles
        LEFT OUTER JOIN comments ON articles.article_id=comments.article_id
        GROUP BY articles.article_id
        ORDER BY created_at DESC`)
        .then(({rows})=>{
            rows.forEach(row=>{
                row.comment_count=Number(row.comment_count)
            })
            return rows
        })
}

exports.fetchArticleById=({article_id})=>{
    return db.query(`SELECT * FROM articles
        WHERE article_id=$1`,[article_id])
        .then(({rows})=>{
            if (!rows.length) return Promise.reject({code:404})
            return rows[0]
        })
}

exports.fetchCommentsByArticle=({article_id})=>{
    return exports.fetchArticleById({article_id})
        .then(()=>{
            return db.query(`SELECT * FROM comments
                WHERE article_id=$1
                ORDER BY created_at DESC`,[article_id])
        }).then(({rows})=>{
            if (!rows.length) return "There don't seem to be any comments on this article..."
            return rows
        })
}