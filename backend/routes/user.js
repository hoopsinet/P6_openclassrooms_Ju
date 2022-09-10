const express = require('express');
const router = express.Router();

const user = require('../models/user');

router.post('/', (req, res, next) => {
    delete req.body._id;
    const user = new user({
      ...req.body
    });
    user.save()
      .then(() => res.status(201).json({ message: 'Nouvel utilisateur créé !'}))
      .catch(error => res.status(400).json({ error }));
  });
  
  router.put('/:id', (req, res, next) => {
    user.updateOne({ _id: req.params.id}, { ...req.body, _id: req.params.id})
    .then(() => res.status(200).json({ message: 'Utilisateur modifié !'}))
      .catch(error => res.status(400).json({ error }));
  });
  
  router.delete('/:id', (req, res, next) => {
    user.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Objet utilisateur supprimé !'}))
      .catch(error => res.status(400).json({ error }));
  });
  
  router.get('/:id', (req, res, next) => {
    user.findOne({ _id: req.params.id })
      .then(user => res.status(200).json(user))
      .catch(error => res.status(404).json({ error }));
  });
  
  router.use('/', (req, res, next) => {
    user.find()
      .then(things => res.status(200).json(user))
      .catch(error => res.status(400).json({ error }));
  });

module.exports = router;