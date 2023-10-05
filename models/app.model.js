const db=require('../db/connection')

exports.fetchAllTopics=()=>{
    return db.query('SELECT * FROM topics')
        .then(({rows})=>rows)
}

exports.fetchAllArticles=({topic='%',sort_by='created_at',order='desc',limit=10,p=1})=>{
    if (![
        'article_id',
        'title',
        'topic',
        'author',
        'created_at',
        'article_img_url'
        ].includes(sort_by)||
        !['asc','desc'].includes(order)
    ) return Promise.reject({code:400})
    return db.query(`SELECT articles.article_id,title,topic,articles.author,
        articles.created_at,articles.votes,article_img_url FROM articles
        LEFT OUTER JOIN comments ON articles.article_id=comments.article_id
        WHERE topic LIKE $1
        GROUP BY articles.article_id
        ORDER BY ${sort_by} ${order}
        LIMIT $2 OFFSET $3`,[topic,limit,(p-1)*limit])
        .then(({rows})=>rows.length?rows:Promise.reject({code:404}))
}

exports.fetchArticleById=({article_id})=>{
    return db.query(`SELECT articles.article_id,title,topic,articles.author,
        articles.body,articles.created_at,articles.votes,article_img_url,
        COUNT(comment_id) AS comment_count FROM articles
        LEFT OUTER JOIN comments ON comments.article_id=articles.article_id
        WHERE articles.article_id=$1
        GROUP BY articles.article_id`,[article_id])
        .then(({rows})=>rows.length?rows[0]:Promise.reject({code:404}))
}

exports.fetchCommentsByArticle=({article_id},{limit=10,p=1})=>{
    return exports.fetchArticleById({article_id})
        .then(()=>{
            return db.query(`SELECT * FROM comments
                WHERE article_id=$1
                ORDER BY created_at DESC
                LIMIT $2 OFFSET $3`,[article_id,limit,(p-1)*limit])
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
        }).then(({rows})=>rows[0])
}

exports.voteOnArticle=({inc_votes},{article_id})=>{
    return db.query(`SELECT votes FROM articles
        WHERE article_id=$1`,[article_id])
        .then(({rows})=>{
            return rows.length?db.query(`UPDATE articles
                SET votes=$1
                WHERE article_id=$2
                RETURNING *`,[
                    rows[0].votes+inc_votes,
                    article_id
                ]):Promise.reject({code:404})
        }).then(({rows})=>rows[0])
}


exports.removeCommentFromDatabase=({comment_id})=>{
    return db.query(`DELETE FROM comments
        WHERE comment_id=$1
        RETURNING *`,[comment_id])
        .then(({rows})=>rows.length?null:Promise.reject({code:404}))
}

exports.fetchAllUsers=()=>{
    return db.query(`SELECT username,name,avatar_url FROM users`)
        .then(({rows})=>rows)
}

exports.fetchSpecificUser=({username})=>{
    return db.query(`SELECT username,name,avatar_url FROM users
        WHERE username=$1`,[username])
        .then(({rows})=>rows.length? rows[0]:Promise.reject({code:404}))
}

exports.voteOnComment=({inc_votes},{comment_id})=>{
    return db.query(`SELECT * FROM comments
        WHERE comment_id=$1`,[comment_id])
        .then(({rows})=>{
            return rows.length? db.query(`UPDATE comments
                SET votes=$1
                WHERE comment_id=$2
                RETURNING *`,[
                    rows[0].votes+inc_votes,
                    comment_id
                ]):Promise.reject({code:404})
        }).then(({rows})=>rows[0])
}

exports.addArticleToDatabase=({author,body,title,topic,article_img_url='https://as1.ftcdn.net/v2/jpg/02/67/50/12/1000_F_267501245_nNG8treQuYIFhUA5a1i1PtHalmxAXZ4A.jpg'})=>{
    return db.query(`INSERT INTO articles
        (author,body,title,topic,article_img_url)
        VALUES
        ($1,$2,$3,$4,$5)
        RETURNING *`,[
            author,
            body,
            title,
            topic,
            article_img_url
        ]).then(({rows})=>{
            return {...rows[0],comment_count:0}
        })
}

exports.addTopicToDatabase=({slug,description})=>{
    return !slug||!description? Promise.reject({code:400})
        :db.query(`INSERT INTO topics
        (slug,description)
        VALUES
        ($1,$2)
        RETURNING *`,[slug,description])
        .then(({rows})=>rows[0])
}