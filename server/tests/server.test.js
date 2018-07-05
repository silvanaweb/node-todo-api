const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todosMock = [
    { text: 'First todo'},
    { text: 'Second todo'}
]

beforeEach ( (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todosMock);
    }).then(() => done());
});

describe('POST /todos', () => {
    it('shoud create a new todo', (done) => {
        var text ='Test for text';

        request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res) => {
            expect(res.body.text).toBe(text);
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            }
            Todo.find({text}).then ((todos) => {
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            }).catch ( (e) => console.log(e));
        })
    });

    it ('should not create todo with invalid data', (done) => {
        request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err, res) => {
            if (err) {
                return done(err);
            }
            Todo.find().then ((todos) => {
                expect(todos.length).toBe(2);
                done();
            }).catch ( (e) => console.log(e));
        })
    });
});

describe('GET /todos', () => {
    it('shoud get all the todos', (done) => {
        request(app)
        .get('/todos')
        .expect(200)
        .expect( ( (res) => {
           expect(res.body.todos.length).toBe(2);
        }))
        .end(done);
    })

});