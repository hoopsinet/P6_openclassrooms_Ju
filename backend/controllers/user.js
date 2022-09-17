const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const userModels = require("../models/user");

exports.signup = (req, res, next) => {

if (req.body.password === "") {
    return res.status(400).json({ error: 'message erreur'})
}

  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new userModels({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "compte créé" }))
        .catch((error) =>
          res
            .status(400)
            .json({ error, message: "Adresse email déjà utilisée." })
        );
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error });
    });
};

exports.login = (req, res, next) => {
  userModels
    .findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ error: "adresse email non compatible !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "mauvais mot de passe !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

