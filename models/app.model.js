const db=require('../db/connection')

exports.fetchAllTopics=()=>{
    return db.query('SELECT * FROM topics')
        .then(({rows})=>{
            return rows
        })
}

exports.fetchAllArticles=()=>{
    return db.query(`SELECT articles.article_id,title,topic,article.author,body,
        created_at,votes,article_img_url, COUNT(comment_id) as comment_count FROM articles
        LEFT OUTER JOIN comments ON articles.article_id=comments.article_id
        GROUP BY articles.article_id`)
        .then(({rows})=>{
            console.log(rows)
        })
}