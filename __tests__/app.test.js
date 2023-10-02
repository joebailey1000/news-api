const request=require ('supertest')
const test_data=require('../db/data/test-data/index')
const seed=require('../db/seeds/seed')
const app=require('../app')
const db=require('../db/connection')
const endpointsList=require('../controllers/api-directory/APIOBJECT')

beforeEach(()=>{
    return seed(test_data)
})

afterAll(()=>{
    db.end()
})

describe('GET /api/healthcheck',()=>{
    test('returns a 200',()=>{
        return request(app)
            .get('/api/healthcheck')
            .expect(200)})
})

describe('GET /api/topics',()=>{
    // no errors expected as this is a fixed endpoint returning the whole table
    test('returns a 200 and a list of topics with the correct data',()=>{
        return request(app)
            .get('/api/topics')
            .expect(200)
            .then(({body})=>{
                expect(body.topics).toMatchObject(Array(3).fill({
                    slug:expect.any(String),
                    description:expect.any(String)
                }))
            })
    })
})

describe('GET /api',()=>{
    test('returns a list of valid endpoints',()=>{
        return request(app)
            .get('/api')
            .expect(200)
            .then(({body})=>{
                expect(body).toEqual({'Valid endpoints':endpointsList})
            })
    })
})

describe('invalid GET endpoint',()=>{
    test('informs the user to GET /api for a list of valid endpoints',()=>{
        return request(app)
            .get('/pizza')
            .expect(404)
            .then(({body})=>{
                expect(body).toEqual({msg:'For a list of valid endpoints, try GET /api'})
            })
    })
})

describe('GET /api/articles',()=>{
    test('returns an array of all articles in the table (including those with no comments)',()=>{
        return request(app)
            .get('/api/articles')
            .expect(200)
            .then(({body})=>{
                expect(body.articles).toMatchObject(Array(13).fill({
                    article_id:expect.any(Number),
                    title: expect.any(String),
                    topic: expect.any(String),
                    author: expect.any(String),
                    created_at: expect.any(String),
                    article_img_url:expect.any(String),
                    comment_count:expect.any(Number)
                }))
            })
    })
    test('served articles should have the body removed',()=>{
        return request(app)
            .get('/api/articles')
            .expect(200)
            .then(({body})=>{
                expect(body.articles).not.toMatchObject(Array(13).fill({
                    body:expect.anything()
                }))
            })
    })
    test('served articles should be sorted with most recent first',()=>{
        return request(app)
            .get('/api/articles')
            .then(({body})=>{
                expect(body.articles).toBeSortedBy('created_at',{descending:true})
            })
    })
    //fixed endpoint so no further errors to be considered
})

describe('GET /api/articles/:article_id',()=>{
    test('returns a 200 and an article object with the matching id',()=>{
        return request(app)
            .get('/api/articles/5')
            .expect(200)
            .then(({body})=>{
                expect(body.article).toMatchObject({
                    article_id:5,
                    title: expect.any(String),
                    topic: expect.any(String),
                    author: expect.any(String),
                    body: expect.any(String),
                    created_at: expect.any(String),
                    votes:expect.any(Number),
                    article_img_url: expect.any(String)
                })
            })
    })
    test('returns a 404 when no article with the given id is found',()=>{
        return request(app)
            .get('/api/articles/1984')
            .expect(404)
            .then(({body})=>{
                expect(body.msg).toBe('Not found.')
            })
    })
    test('returns a 400 when article_id is not a number',()=>{
        return request(app)
            .get('/api/articles/pizza')
            .expect(400)
            .then(({body})=>{
                expect(body.msg).toBe('Bad request.')
            })
    })
})

describe('GET /api/articles/:article_id/comments',()=>{
    test('recovers the comments on a given article',()=>{
        return request(app)
            .get('/api/articles/1/comments')
            .expect(200)
            .then(({body})=>{
                expect(body.comments).toMatchObject(Array(11).fill({
                    comment_id:expect.any(Number),
                    votes:expect.any(Number),
                    created_at:expect.any(String),
                    author:expect.any(String),
                    body:expect.any(String),
                    article_id:expect.any(Number)
                }))
            })
    })
    test('sends a 404 if the article does not exist are found',()=>{
        return request(app)
            .get('/api/articles/1984/comments')
            .expect(404)
            .then(({body})=>{
                expect(body.msg).toBe('Not found.')
            })
    })
    test('sends a 400 if the article_id is not a number',()=>{
        return request(app)
            .get('/api/articles/pizza/comments')
            .expect(400)
            .then(({body})=>{
                expect(body.msg).toBe('Bad request.')
            })
    })
    test('comments should be sorted with most recent first',()=>{
        return request(app)
            .get('/api/articles/1/comments')
            .expect(200)
            .then(({body})=>{
                expect(body.comments).toBeSortedBy('created_at',{descending:true})
            })
    })
})

describe.only('POST /api/articles/:article_id/comments',()=>{
    const comment={
        username:'lurker',
        body:'FOO BAR'
    }
    test('successfully posts a comment to the databse',()=>{
        return request(app)
            .post('/api/articles/2/comments')
            .send(comment)
            .expect(201)
            .then(({body})=>{
                expect(body.comment).toMatchObject({
                    comment_id:expect.any(Number),
                    votes:expect.any(Number),
                    created_at:expect.any(String),
                    author:'lurker',
                    body:'FOO BAR',
                    article_id:2
                })
            })
    })
    test('returns 404 if no such article exists',()=>{
        return request(app)
            .post('/api/articles/1984/comments')
            .send(comment)
            .expect(404)
            .then(({body})=>{
                expect(body.msg).toBe('Not found.')
            })
    })
    test('sends a 400 if the article_id is not a number',()=>{
        return request(app)
            .post('/api/articles/pizza/comments')
            .send(comment)
            .expect(400)
            .then(({body})=>{
                expect(body.msg).toBe('Bad request.')
            })
    })
    test('sends a 400 if either the author or body are missing or empty',()=>{
        return request(app)
            .post('/api/articles/2/comments')
            .send({username:'',comment:''})
            .expect(400)
            .then(({body})=>{
                expect(body.msg).toBe('Bad request.')
            }).then(()=>{
                return request(app)
            .post('/api/articles/2/comments')
            .send({})
            .expect(400)
            })
    })
    test('ignores extra properties sent in the post',()=>{
        return request(app)
            .post('/api/articles/2/comments')
            .send({
                isExtraProperty:true,
                ...comment
            })
            .expect(201)
            .then(({body})=>{
                expect(body.comment).toMatchObject({
                    comment_id:expect.any(Number),
                    votes:expect.any(Number),
                    created_at:expect.any(String),
                    author:'lurker',
                    body:'FOO BAR',
                    article_id:2
                })
            })
    })
    test('returns 400 for an unregistered user',()=>{
        return request(app)
            .post('/api/articles/2/comments')
            .send({
                username:'shaunofthebread',
                body:'FOO BAR'
            }).expect(400)
            .then(({body})=>{
                expect(body.msg).toBe('Bad request.')
            })
    })
})