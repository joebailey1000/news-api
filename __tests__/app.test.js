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