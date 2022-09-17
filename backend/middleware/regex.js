const user = require('../models/user');

const regex = /^[a-z0-9.-]+@[a-z0-9.-]{2,}[.][a-z]{2,4}$/;

module.exports = (req, res, next) => {
    if(req.body.email.match(regex)) {
        next()
    } else {
        return res.status(400).json({ message : 'le format email saisi est invalide' });
    }
}