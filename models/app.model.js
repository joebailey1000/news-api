const db=require('../db/connection')

exports.fetchAllTopics=()=>{
    return db.query('SELECT * FROM topics')
        .then(({rows})=>{
            return rows
        })
}

exports.fetchAllArticles=()=>{
    return db.query(`SELECT articles.article_id,title,topic,articles.author,articles.body,
        articles.created_at,articles.votes,article_img_url, COUNT(comment_id) AS comment_count FROM articles
        LEFT OUTER JOIN comments ON articles.article_id=comments.article_id
        GROUP BY articles.article_id
        ORDER BY created_at DESC`)
        .then(({rows})=>{
            rows.forEach(row=>{
                delete row.body
                row.comment_count=Number(row.comment_count)
            })
            return rows
        })
}