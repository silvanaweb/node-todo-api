var {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const { User } = require('./../../models/user');

const userOneID = new ObjectID();
const userTwoID = new ObjectID();
const usersMock = [
    {
        _id: userOneID,
        email: 'andy@example.com',
        password: 'userOnePass',
        tokens: [
            {
                access: 'auth',
                token: jwt.sign({_id: userOneID, access: 'auth'}, 'abc123').toString()
            }
        ]
    },
    {
        _id: userTwoID,
        email: 'jack@example.com',
        password: 'userTwoPass',
        tokens: [
            {
                access: 'auth',
                token: jwt.sign({_id: userTwoID, access: 'auth'}, 'abc123').toString()
            }
        ]
    }
];

const todosMock = [
    {
        text: 'First todo',
         _id: new ObjectID(),
         _creator: userOneID
    },
    {
        text: 'Second todo',
        _id: new ObjectID(),
        completed: true,
        completedAt: 333,
        _creator: userTwoID
    }
];


const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todosMock);
    }).then(() => done());
};

const populateUsers = (done) => {
    User.remove({})
    .then(() => {
        var userOne = new User(usersMock[0]).save();
        var userTwo = new User(usersMock[1]).save();
        return Promise.all([userOne, userTwo ]);
    })
    .then(() => done());
};


module.exports = {
    todosMock,
    populateTodos,
    usersMock,
    populateUsers
};