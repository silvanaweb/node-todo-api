var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');


var app = express();
const port = process.env.port || 3000;


app.use(bodyParser.json());


app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });
    todo.save().then ( (doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then( (todos) => {
        res.send({todos});
    }, (e => res.status(400).send(err)))
});

app.get('/todos/:id', (req, res) => {
    let id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    Todo.findById(id).then ( (todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }).catch( (e) => {
        res.status(400).send({id: id});
    });

});

app.delete('/todos/:id', (req, res) => {
    let id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    Todo.findByIdAndRemove(id).then ( (todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }).catch( (e) => {
        res.status(400).send({id: id});
    });

});


app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});

module.exports = { app };