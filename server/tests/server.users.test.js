const expect = require('expect');
const request = require('supertest');
var {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {User} = require('./../models/user');

const {usersMock, populateUsers } = require('./seed/seed');

beforeEach (populateUsers);


describe ('GET /users/me', () => {
    it ('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', usersMock[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(usersMock[0]._id.toHexString());
                expect(res.body.email).toBe(usersMock[0].email);
            })
            .end(done);
    });
    it ('should return a 401  if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe ('POST /users', () => {
    it ('should create a user', (done) => {
        var email = 'exmaple@example.com';
        var password = 'qwerty123';
        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body.email).toBe(email);
                expect(res.body._id).toExist();
            })
            .end(((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findOne({email}).then((user) => {
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                }).catch((e) => done(e));
            }));
    });
    it ('should return validation error if request is invalid', (done) => {
        var email = 'example.com';
        var password = 'qwert';
        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });
    it ('should not create a user if email in use', (done) => {
        var email = usersMock[0].email;
        var password = 'qwertwewd3!';
        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });
});

describe ('POST /users/login', () => {
    it ('should login user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: usersMock[1].email,
                password: usersMock[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
            })
            .end(((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findById(usersMock[1]._id).then((user) => {
                    expect(user.tokens[0]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch((e) => done(e));
            }));
    });
    it ('should reject invalid login', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: usersMock[1].email,
                password: 'abc1234'
            })
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
            })
            .end(((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findById(usersMock[1]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            }));
    });
});

describe ('DELETE /users/me/token', () => {
    it ('should delete token', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', usersMock[0].tokens[0].token)
            .expect(200)
            .end(((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findById(usersMock[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            }));
    });
});