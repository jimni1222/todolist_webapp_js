process.env.NODE_ENV = 'test'

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('./server')

chai.use(chaiHttp)

describe('Server API Route test', () => {
    it('/api/list => Get Todo list API Route', (done) => {
        chai.request(server)
            .get('/api/list')
            .end((err, res) => {
                expect(res.status).toBe(200)
                expect(res.body).toHaveProperty('length')
                expect(res.body.length).toBe(0)
                expect(res.body.error).toBe(undefined)
                done()
            })
    })

    it('/api/add => add todo (without references information)', (done) => {
        chai.request(server)
            .post('/api/add')
            .send({ todo: "test1", references: [] })
            .end((err, res) => {
                expect(res.status).toBe(200)
                expect(res.body).toBe(1)
                expect(res.body.error).toBe(undefined)
                done()
            })
    })

    it('/api/add => add todo (with references inforamtion)', (done) => {
        chai.request(server)
            .post('/api/add')
            .send({ todo: "test2", references: [1] })
            .end((err, res) => {
                expect(res.status).toBe(200)
                expect(res.body).toBe(2)
                expect(res.body.error).toBe(undefined)
                done()
            })
    })

    it('/api/list => Get Todo list API Route', (done) => {
        chai.request(server)
            .get('/api/list')
            .end((err, res) => {
                expect(res.status).toBe(200)
                expect(res.body).toHaveProperty('length')
                expect(res.body.length).toBe(2)
                expect(res.body[1].references[0]).toBe(1)
                expect(res.body.error).toBe(undefined)
                done()
            })
    })

    it('/api/finish/:id => impossible change todo status to finished', (done) => {
        chai.request(server)
            .get('/api/finish/1')
            .end((err, res) => {
                expect(res.status).toBe(400)
                expect(res.body.error).not.toBe(undefined)
                done()
            })
    })

    it('/api/finish/:id => possible change todo status to finished', (done) => {
        chai.request(server)
            .get('/api/finish/2')
            .end((err, res) => {
                expect(res.status).toBe(200)
                expect(res.body).toBe(true)
                expect(res.body.error).toBe(undefined)
                done()
            })
    })

    it('/api/delete => delete todo', (done) => {
        chai.request(server)
            .delete('/api/delete')
            .send({ id: 1 })
            .end((err, res) => {
                expect(res.status).toBe(400)
                expect(res.body.error).not.toBe(undefined)
                done()
            })
    })

    it('/api/delete => delete todo', (done) => {
        chai.request(server)
            .delete('/api/delete')
            .send({ id: 2 })
            .end((err, res) => {
                expect(res.status).toBe(200)
                expect(res.body).toBe(true)
                expect(res.body.error).toBe(undefined)
                done()
            })
    })

    it('/api/edit => If todo is not exist in db, reject edit todo', (done) => {
        chai.request(server)
            .post('/api/edit')
            .send({ id: 2, references: [2, 3, 4] })
            .end((err, res) => {
                expect(res.status).toBe(400)
                expect(res.body.error).not.toBe(undefined)
                done()
            })
    })

    it('/api/edit => If reference is invalid, reject edit todo', (done) => {
        chai.request(server)
            .post('/api/edit')
            .send({ id: 1, references: [2] })
            .end((err, res) => {
                expect(res.status).toBe(400)
                expect(res.body.error).not.toBe(undefined)
                done()
            })
    })

    it('/api/edit => If reference is valid, edit todo', (done) => {
        chai.request(server)
            .post('/api/edit')
            .send({ id: 1, todo: "edit toto", references: [] })
            .end((err, res) => {
                expect(res.status).toBe(200)
                expect(typeof (res.body)).toBe("number")
                expect(res.body.error).toBe(undefined)
                done()
            })
    })
})