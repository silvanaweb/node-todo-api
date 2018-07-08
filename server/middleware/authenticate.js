var { User } = require('../models/user');

var authenticate = (req, res, next) => {
    let token = req.header('x-auth');
    User.findByToken(token)
        .then ( (user) => {
            if (!user) {
                // it behaves like the one in catch, so let's send it there
                return Promise.reject();
            }

            req.user = user;
            req.token = token;
            next();
        })
        .catch(((e) => {
            res.status(401).send();
        }));
}

module.exports = {
    authenticate
};