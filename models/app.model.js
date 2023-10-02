const db=require('../db/connection')

exports.fetchAllTopics=()=>{
    return db.query('SELECT * FROM topics')
        .then(({rows})=>{
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