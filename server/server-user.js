var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/UserApp');

// create a model for todo
var Todo = mongoose.model('User', {
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    }
});

// create a new todo
var newUser = new Todo({
    email: 'test@email.com'
});

newUser.save().then ( (doc) => {
    console.log('Saved todo', doc);

}, (e) => {
    console.log('Unable to save todo');

});

