const db=require('../db/connection')

exports.fetchAllTopics=()=>{
    return db.query('SELECT * FROM topics')
        .then(({rows})=>{
            return rows
        })
}

exports.fetchAllArticles=()=>{
    return db.query(`SELECT articles.article_id,title,topic,articles.author,
        articles.created_at,articles.votes,article_img_url FROM articles
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
    return db.query(`SELECT articles.article_id,title,topic,articles.author,
        articles.body,articles.created_at,articles.votes,article_img_url,
        COUNT(comment_id) AS comment_count FROM articles
        LEFT OUTER JOIN comments ON comments.article_id=articles.article_id
        WHERE articles.article_id=$1
        GROUP BY articles.article_id`,[article_id])
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
        }).then(({rows})=>rows)
}

exports.addCommentToDatabase=({username,body},{article_id})=>{
    return exports.fetchArticleById({article_id})
        .then(()=>{
            return db.query(`INSERT INTO comments
                (author,body,article_id)
                VALUES
                ($1,$2,$3)
                RETURNING *`,[
                    username,
                    body,
                    article_id
                ])
        }).then(({rows})=>{
            return rows[0]
        })
}

exports.voteOnArticle=({inc_votes},{article_id})=>{
    return db.query(`SELECT votes FROM articles
        WHERE article_id=$1`,[article_id])
        .then(({rows})=>{
            if (!rows.length) return Promise.reject({code:404})
            return db.query(`UPDATE articles
                SET votes=$1
                WHERE article_id=$2
                RETURNING *`,[
                    rows[0].votes+inc_votes,
                    article_id
                ])
        }).then(({rows})=>{
            return rows[0]
        })
}


exports.removeCommentFromDatabase=({comment_id})=>{
    return db.query(`DELETE FROM comments
        WHERE comment_id=$1
        RETURNING *`,[comment_id])
        .then(({rows})=>{
            if (!rows.length) return Promise.reject({code:404})
        })
}

exports.fetchAllUsers=()=>{
    return db.query(`SELECT username,name,avatar_url FROM users`)
        .then(({rows})=>rows)
}