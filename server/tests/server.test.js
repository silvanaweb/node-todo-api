const expect = require('expect');
const request = require('supertest');
var {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const {todosMock, populateTodos, usersMock, populateUsers } = require('./seed/seed');

beforeEach (populateUsers);
beforeEach (populateTodos);

describe('POST /todos', () => {
    it('shoud create a new todo', (done) => {
        var text ='Test for text';

        request(app)
        .post('/todos')
        .set('x-auth', usersMock[0].tokens[0].token)
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
        .set('x-auth', usersMock[0].tokens[0].token)
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
            .set('x-auth', usersMock[0].tokens[0].token)
            .expect(200)
            .expect( ( (res) => {
                expect(res.body.todos.length).toBe(1);
            }))
            .end(done);
    })

});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        let id = todosMock[0]._id.toHexString();
        request(app)
            .get(`/todos/${id}`)
            .set('x-auth', usersMock[0].tokens[0].token)
            .expect(200)
            .expect(( (res) => {
                expect(res.body.todo.text).toBe(todosMock[0].text);
            }))
            .end(done);
    });

    it('shoud not return todo doc of other users', (done) => {
        let id = todosMock[1]._id.toHexString();
        request(app)
            .get(`/todos/${id}`)
            .set('x-auth', usersMock[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it ('should return 404 if todo not found', (done) => {
        let id = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${id}`)
            .set('x-auth', usersMock[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
    it ('should return 404 for non-objiect id', (done) => {
        let id = 123;
        request(app)
            .get(`/todos/${id}`)
            .set('x-auth', usersMock[0].tokens[0].token)
            .expect(404)
            .end(done);
    });


});

describe('DELETE /todos/:id', () => {
    it('shoud remove a todo', (done) => {
        let id = todosMock[1]._id.toHexString();
        request(app)
            .delete(`/todos/${id}`)
            .set('x-auth', usersMock[1].tokens[0].token)
            .expect(200)
            .expect(( (res) => {
                expect(res.body.todo._id).toBe(id);
            }))
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(id).then((todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch((e) => done(e));
            });
    });
    it('shoud NOT remove a todo of someone else', (done) => {
        let id = todosMock[0]._id.toHexString();
        request(app)
            .delete(`/todos/${id}`)
            .set('x-auth', usersMock[1].tokens[0].token)
            .expect(404)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(id).then((todo) => {
                    expect(todo).toExist();
                    done();
                }).catch((e) => done(e));
            });
    });
    it ('should return 404 if todo not found', (done) => {
        let id = new ObjectID().toHexString();
        request(app)
            .delete(`/todos/${id}`)
            .set('x-auth', usersMock[1].tokens[0].token)
            .expect(404)
            .end(done);
    });
    it ('should return 404 for non-objiect id', (done) => {
        let id = 123;
        request(app)
            .delete(`/todos/${id}`)
            .set('x-auth', usersMock[1].tokens[0].token)
            .expect(404)
            .end(done);
    });

});

describe('PATCH /todos/:id', () => {
    it('shoud update todo', (done) => {
        let id = todosMock[0]._id.toHexString();
        let body = {
            text: "New",
            completed: true
        }
        request(app)
            .patch(`/todos/${id}`)
            .set('x-auth', usersMock[0].tokens[0].token)
            .send(body)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(body.text);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end(done);
    });
    it('shoud NOT update todo of other user', (done) => {
        let id = todosMock[0]._id.toHexString();
        let body = {
            text: "New",
            completed: true
        }
        request(app)
            .patch(`/todos/${id}`)
            .set('x-auth', usersMock[1].tokens[0].token)
            .send(body)
            .expect(404)
            .end(done);
    });
    it('shoud clear completeAt when todo is made incomplete', (done) => {
        let id = todosMock[1]._id.toHexString();
        let body = {
            text: "New",
            completed: false
        }
        request(app)
            .patch(`/todos/${id}`)
            .set('x-auth', usersMock[1].tokens[0].token)
            .send(body)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(body.text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toNotExist();
            })
            .end(done);
    });

});
