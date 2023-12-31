const request = require('supertest')
const test_data = require('../db/data/test-data/index')
const seed = require('../db/seeds/seed')
const app = require('../app')
const db = require('../db/connection')
const endpointsList = require('../endpoints.json')
beforeEach(() => {
  return seed(test_data)
})

afterAll(() => {
  db.end()
})

describe('GET /api/healthcheck', () => {
  test('returns a 200', () => {
    return request(app)
      .get('/api/healthcheck')
      .expect(200)
  })
})

describe('GET /api/topics', () => {
  // no errors expected as this is a fixed endpoint returning the whole table
  test('returns a 200 and a list of topics with the correct data', () => {
    return request(app)
      .get('/api/topics')
      .expect(200)
      .then(({ body }) => {
        expect(body.topics).toMatchObject(Array(3).fill({
          slug: expect.any(String),
          description: expect.any(String)
        }))
      })
  })
})

describe('GET /api', () => {
  test('returns a list of valid endpoints', () => {
    return request(app)
      .get('/api')
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({ 'Valid endpoints': endpointsList })
      })
  })
})

describe('invalid GET endpoint', () => {
  test('informs the user to GET /api for a list of valid endpoints', () => {
    return request(app)
      .get('/pizza')
      .expect(404)
      .then(({ body }) => {
        expect(body).toEqual({ msg: 'For a list of valid endpoints, try GET /api' })
      })
  })
})

describe('GET /api/articles', () => {
  test('returns an array of all articles in the table (default length 10)', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toMatchObject(Array(10).fill({
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          created_at: expect.any(String),
          article_img_url: expect.any(String),
          comment_count: expect.any(String)
        }))
      })
  })
  test('served articles should have the body removed', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).not.toMatchObject(Array(13).fill({
          body: expect.anything()
        }))
      })
  })
  test('served articles should be sorted with most recent first by default', () => {
    return request(app)
      .get('/api/articles')
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy('created_at', { descending: true })
      })
  })
  test('accepts a topic query to filter by topic', () => {
    return request(app)
      .get('/api/articles?topic=cats')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toMatchObject([{
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: 'cats',
          author: expect.any(String),
          created_at: expect.any(String),
          article_img_url: expect.any(String)
        }])
      })
  })
  test('returns 404 if no articles with the queried topic are found', () => {
    return request(app)
      .get('/api/articles?topic=pizza')
      .expect(404)
  })
  test('resistant to injection attacks on topic', () => {
    return request(app)
      .get('/api/articles?topic=cats;DROP%20table%20IF%20EXISTS%20articles;SELECT%20*%20FROM%20comments%20WHERE%20body=cats')
      .expect(404)
      .then(() => {
        return request(app)
          .get('/api/articles')
          .expect(200)
      })
  })
  test('accepts a sort_by query', () => {
    return request(app)
      .get('/api/articles?sort_by=title')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy('title', { descending: true })
      })
  })
  test('sort_by rejects any values that are not column headers', () => {
    return request(app)
      .get('/api/articles?sort_by=title;DROP%20TABLE%20IF%20EXISTS%20articles;')
      .expect(400)
      .then(() => {
        return request(app)
          .get('/api/articles')
          .expect(200)
      })
  })
  test('accepts an order query (either asc or desc)', () => {
    return request(app)
      .get('/api/articles?sort_by=topic&order=asc')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy('topic')
      })
  })
  test('order rejects any values that are not asc or desc', () => {
    return request(app)
      .get('/api/articles?order=desc;DROP%20TABLE%20IF%20EXISTS%20articles;')
      .expect(400)
      .then(() => {
        return request(app)
          .get('/api/articles')
          .expect(200)
      })
  })
  test('accepts a limit query which alters the page length', () => {
    return request(app)
      .get('/api/articles?limit=5')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toHaveLength(5)
      })
  })
  test('accepts a p query which alters the page length', () => {
    return request(app)
      .get('/api/articles?limit=5&sort_by=article_id&p=2&order=asc')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toMatchObject(
          [...Array(5)].map((obj, i) => { return { article_id: i + 6 } })
        )
      })
  })
  test('p defaults to first page', () => {
    return request(app)
      .get('/api/articles?limit=5&sort_by=article_id&order=asc')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toMatchObject(
          [...Array(5)].map((obj, i) => { return { article_id: i + 1 } })
        )
      })
  })
  test('rejects non number entries for limit and p', () => {
    return request(app)
      .get('/api/articles?limit=garlic')
      .expect(400)
      .then(() => {
        return request(app)
          .get('/api/articles?p=garlic')
          .expect(400)
      })
  })
})

describe('GET /api/articles/:article_id', () => {
  test('returns a 200 and an article object with the matching id', () => {
    return request(app)
      .get('/api/articles/5')
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: 5,
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String)
        })
      })
  })
  test('returns a 404 when no article with the given id is found', () => {
    return request(app)
      .get('/api/articles/1984')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Not found.')
      })
  })
  test('returns a 400 when article_id is not a number', () => {
    return request(app)
      .get('/api/articles/pizza')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request.')
      })
  })
  test('article object should have a comment count property', () => {
    return request(app)
      .get('/api/articles/1')
      .expect(200)
      .then(({ body }) => {
        expect(body.article.comment_count).toBe('11')
      })
  })
})

describe('GET /api/articles/:article_id/comments', () => {
  test('recovers the comments on a given article (defaults to length 10', () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toMatchObject(Array(10).fill({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          article_id: expect.any(Number)
        }))
      })
  })
  test('sends a 404 if the article does not exist are found', () => {
    return request(app)
      .get('/api/articles/1984/comments')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Not found.')
      })
  })
  test('sends a 400 if the article_id is not a number', () => {
    return request(app)
      .get('/api/articles/pizza/comments')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request.')
      })
  })
  test('comments should be sorted with most recent first', () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toBeSortedBy('created_at', { descending: true })
      })
  })
  test('accepts a limit query adjusting the page length', () => {
    return request(app)
      .get('/api/articles/1/comments?limit=5')
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toHaveLength(5)
      })
  })
  test('accepts a p query which chooses the page', () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body }) => {
        return Promise.all([
          body.comments,
          request(app)
            .get('/api/articles/1/comments?limit=2&p=2')
        ])
      }).then(([allComments, { body }]) => {
        expect(body.comments).toEqual(allComments.slice(2, 4))
      })
  })
  test('page defaults to 1', () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body }) => {
        return Promise.all([
          body.comments,
          request(app)
            .get('/api/articles/1/comments?limit=2')
        ])
      }).then(([allComments, { body }]) => {
        expect(body.comments).toEqual(allComments.slice(0, 2))
      })
  })
  test('rejects non numerical values for p and limit', () => {
    return request(app)
      .get('/api/articles/1/comments?limit=garlic')
      .expect(400)
      .then(() => {
        return request(app)
          .get('/api/articles/1/comments?p=garlic')
          .expect(400)
      })
  })
})

describe('POST /api/articles/:article_id/comments', () => {
  const comment = {
    username: 'lurker',
    body: 'FOO BAR'
  }
  test('successfully posts a comment to the databse', () => {
    return request(app)
      .post('/api/articles/2/comments')
      .send(comment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: 'lurker',
          body: 'FOO BAR',
          article_id: 2
        })
      })
  })
  test('returns 404 if no such article exists', () => {
    return request(app)
      .post('/api/articles/1984/comments')
      .send(comment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Not found.')
      })
  })
  test('sends a 400 if the article_id is not a number', () => {
    return request(app)
      .post('/api/articles/pizza/comments')
      .send(comment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request.')
      })
  })
  test('sends a 400 if either the author or body are missing or empty', () => {
    return request(app)
      .post('/api/articles/2/comments')
      .send({ username: '', comment: '' })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request.')
      }).then(() => {
        return request(app)
          .post('/api/articles/2/comments')
          .send({})
          .expect(400)
      })
  })
  test('ignores extra properties sent in the post', () => {
    return request(app)
      .post('/api/articles/2/comments')
      .send({
        isExtraProperty: true,
        ...comment
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: 'lurker',
          body: 'FOO BAR',
          article_id: 2
        })
      })
  })
  test('returns 400 for an unregistered user', () => {
    return request(app)
      .post('/api/articles/2/comments')
      .send({
        username: 'shaunofthebread',
        body: 'FOO BAR'
      }).expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request.')
      })
  })
})

describe('PATCH /api/articles/:article_id', () => {
  test('changes the votecount on an article by the given increment', () => {
    const voteChange = { inc_votes: -3 }

    return request(app)
      .patch('/api/articles/4')
      .send(voteChange)
      .expect(200)
      .then(({ body }) => {
        expect(body.article.votes).toBe(-3)
      })
  })
  test('sends a 400 if the object is missing an inc_votes property', () => {
    const voteChange = { pizza: -3 }

    return request(app)
      .patch('/api/articles/4')
      .send(voteChange)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request.')
      })
  })
  test('sends a 400 if inc_vote is not a number', () => {
    const voteChange = { inc_votes: 'FOO BAR' }

    return request(app)
      .patch('/api/articles/4')
      .send(voteChange)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request.')
      })
  })
  test('ignores extra properties in vote_count', () => {
    const voteChange = {
      inc_votes: 17,
      site: 'reddit'
    }

    return request(app)
      .patch('/api/articles/4')
      .send(voteChange)
      .expect(200)
  })
  test('throws 404 if article is not found', () => {
    const voteChange = { inc_votes: -3 }

    return request(app)
      .patch('/api/articles/49283')
      .send(voteChange)
      .expect(404)
  })
  test('throws 400 if article_id is not a number', () => {
    const voteChange = { inc_votes: -3 }

    return request(app)
      .patch('/api/articles/pizza')
      .send(voteChange)
      .expect(400)
  })
})

describe('GET /api/users', () => {
  test('sends a list of all users', () => {
    return request(app)
      .get('/api/users')
      .expect(200)
      .then(({ body }) => {
        expect(body.users).toMatchObject(Array(4).fill({
          username: expect.any(String),
          name: expect.any(String),
          avatar_url: expect.any(String)
        }))
      })
  })
})

describe('GET /api/users/:username', () => {
  test('sends a user matching the given username', () => {
    return request(app)
      .get('/api/users/butter_bridge')
      .expect(200)
      .then(({ body }) => {
        expect(body.user).toEqual({
          username: 'butter_bridge',
          name: 'jonny',
          avatar_url:
            'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg'
        })
      })
  })
  test('returns 404 when no user matches the given name', () => {
    return request(app)
      .get('/api/users/shaunofthebread')
      .expect(404)
  })
})

describe('DELETE /api/comments/:comment_id', () => {
  test('deletes a comment from the database and returns 204', () => {
    return request(app)
      .delete('/api/comments/3')
      .expect(204)
  })
  test('sends 404 when no comment is found', () => {
    return request(app)
      .delete('/api/comments/2001')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Not found.')
      })
  })
  test('sends 400 when comment_id is not a number', () => {
    return request(app)
      .delete('/api/comments/one%20morbillion')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request.')
      })
  })
})

describe('generic error on parametric endpoint', () => {
  test('send 400 when parametric endpoint cannot be parsed due to faulty argument', () => {
    return request(app)
      .get('/api/articles/%')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe(`Could not parse argument containing '%' (incorrect URL formatting).`)
      })
  })
})

describe('PATCH /api/comments/:comment_id', () => {
  test('changes the votecount on a comment by the given increment', () => {
    const voteChange = { inc_votes: -3 }
    return request(app)
      .patch('/api/comments/2')
      .send(voteChange)
      .expect(200)
      .then(({ body }) => {
        expect(body.comment).toEqual({
          comment_id: 2,
          body: 'The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.',
          article_id: 1,
          author: 'butter_bridge',
          votes: 11,
          created_at: '2020-10-31T03:03:00.000Z'
        })
      })
  })
  test('sends a 400 if the object is missing an inc_votes property', () => {
    const voteChange = { pizza: -3 }

    return request(app)
      .patch('/api/comments/2')
      .send(voteChange)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request.')
      })
  })
  test('sends a 400 if inc_vote is not a number', () => {
    const voteChange = { inc_votes: 'FOO BAR' }

    return request(app)
      .patch('/api/comments/2')
      .send(voteChange)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Bad request.')
      })
  })
  test('ignores extra properties in vote_count', () => {
    const voteChange = {
      inc_votes: 17,
      site: 'reddit'
    }

    return request(app)
      .patch('/api/comments/2')
      .send(voteChange)
      .expect(200)
  })
  test('throws 404 if comment is not found', () => {
    const voteChange = { inc_votes: -3 }

    return request(app)
      .patch('/api/comments/100')
      .send(voteChange)
      .expect(404)
  })
  test('throws 400 if comment_id is not a number', () => {
    const voteChange = { inc_votes: -3 }

    return request(app)
      .patch('/api/articles/pizza')
      .send(voteChange)
      .expect(400)
  })
})

describe('POST /api/articles', () => {
  test('posts an article to the database', () => {
    const newArticle = {
      author: 'icellusedkars',
      title: 'new post',
      body: 'this is a new post',
      topic: 'cats',
      article_img_url: 'not finding a url for this :/'
    }

    return request(app)
      .post('/api/articles')
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body.posted_article).toMatchObject({
          article_id: expect.any(Number),
          votes: 0,
          created_at: expect.any(String),
          comment_count: 0,
          ...newArticle
        })
      })
  })
  test('article_img_url defaults if omitted', () => {
    const newArticle = {
      author: 'icellusedkars',
      title: 'new post',
      body: 'this is a new post',
      topic: 'cats',
    }

    return request(app)
      .post('/api/articles')
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body.posted_article.article_img_url).toBe('https://as1.ftcdn.net/v2/jpg/02/67/50/12/1000_F_267501245_nNG8treQuYIFhUA5a1i1PtHalmxAXZ4A.jpg')
      })
  })
  test('sends a 400 if information is missing from the post', () => {
    const newArticle = {
      author: 'icellusedkars',
      title: 'new post',
      body: 'this is a new post',
      article_img_url: 'not finding a url for this :/'
    }

    return request(app)
      .post('/api/articles')
      .send(newArticle)
      .expect(400)
  })
  test('ignores extra properties in the post', () => {
    const newArticle = {
      author: 'icellusedkars',
      title: 'new post',
      body: 'this is a new post',
      topic: 'cats',
      article_img_url: 'not finding a url for this :/',
      is_funny: 'false'
    }

    return request(app)
      .post('/api/articles')
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        delete newArticle.is_funny
        expect(body.posted_article).toMatchObject(newArticle)
      })
  })
  test('returns 400 for unregistered user', () => {
    const newArticle = {
      author: 'shaunofthebread',
      title: 'new post',
      body: 'this is a new post',
      topic: 'cats',
      article_img_url: 'not finding a url for this :/',
    }

    return request(app)
      .post('/api/articles')
      .send(newArticle)
      .expect(400)
  })
  test('returns 400 for nonexistent topic', () => {
    const newArticle = {
      author: 'icellusedkars',
      title: 'new post',
      body: 'this is a new post',
      topic: 'money',
      article_img_url: 'not finding a url for this :/',
    }

    return request(app)
      .post('/api/articles')
      .send(newArticle)
      .expect(400)
  })
})

describe('POST /api/topics', () => {
  test('posts a topic to the database', () => {
    const topic = {
      slug: "topic name",
      description: "topic description"
    }

    return request(app)
      .post('/api/topics')
      .send(topic)
      .expect(201)
      .then(({ body }) => {
        expect(body.posted_topic).toEqual(topic)
      })
  })
  test('rejects if topic is missing keys', () => {
    const topic = {
      slug: "topic name"
    }

    return request(app)
      .post('/api/topics')
      .send(topic)
      .expect(400)
  })
  test('ignores extra keys in the posted topic', () => {
    const topic = {
      slug: "topic name",
      description: "topic description",
      extra_key: "extra key"
    }

    return request(app)
      .post('/api/topics')
      .send(topic)
      .expect(201)
      .then(({ body }) => {
        expect(body.posted_topic).toEqual({
          slug: "topic name",
          description: "topic description"
        })
      })
  })
  test('rejects object if either slug or description is empty', () => {
    const topic = {
      slug: "",
      description: ''
    }
    const topic2 = {
      slug: "",
      description: 'topic description'
    }

    return request(app)
      .post('/api/topics')
      .send(topic)
      .expect(400)
      .then(() => {
        return request(app).post('/api/topics')
          .send(topic2)
          .expect(400)
      })
  })
})

describe('DELETE /api/articles/:article_id', () => {
  test('deletes an article from the database', () => {
    return request(app)
      .delete('/api/articles/1')
      .expect(204)
      .then(() => {
        return request(app)
          .get('/api/articles/1')
          .expect(404)
      })
  })
  test('deletes child comments of the removed article', () => {
    return request(app)
      .delete('/api/articles/1')
      .expect(204)
      .then(() => {
        return request(app)
          .get('/api/articles/1/comments')
          .expect(404)
      })
  })
  test('sends 404 if no article is found', () => {
    return request(app)
      .delete('/api/articles/123456')
      .expect(404)
  })
  test('sends 400 if article id is not a number', () => {
    return request(app)
      .delete('/api/articles/garlic')
      .expect(400)
  })
})

describe('GET /api/users/:username/articles', () => {
  test('recovers the articles authored by the given user', () => {
    return request(app)
      .get('/api/users/butter_bridge/articles')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toMatchObject(Array(4).fill({
          title: expect.any(String),
          topic: expect.any(String),
          author: "butter_bridge",
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url:expect.any(String)
        }))
      })
  })
  test('returns 404 when user does not exist',()=>{
    return request(app)
      .get('/api/users/gamer/articles')
      .expect(404)
  })
  test('takes limit and p queries',()=>{
    return request(app)
      .get('/api/users/butter_bridge/articles?limit=2&p=2')
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toMatchObject(Array(2).fill({
          title: expect.any(String),
          topic: expect.any(String),
          author: "butter_bridge",
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url:expect.any(String)
        }))
      })
  })
})

describe('GET /api/users/:username/comments', () => {
  test('recovers the comments authored by the given user', () => {
    return request(app)
      .get('/api/users/butter_bridge/comments')
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toMatchObject(Array(5).fill({
          article_id: expect.any(Number),
          author: "butter_bridge",
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
        }))
      })
  })
  test('returns 404 when user does not exist',()=>{
    return request(app)
      .get('/api/users/gamer/articles')
      .expect(404)
  })
  test('takes limit and p queries',()=>{
    return request(app)
      .get('/api/users/butter_bridge/comments?limit=2&p=2')
      .expect(200)
      .then(({ body }) => {
        console.log(body)
        expect(body.comments).toMatchObject(Array(2).fill({
          author: "butter_bridge",
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_id:expect.any(Number)
        }))
      })
  })
})