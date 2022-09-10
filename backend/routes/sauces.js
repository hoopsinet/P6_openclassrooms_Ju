const express = require('express');
const router = express.Router();

const sauces = require('../models/sauces');

router.post('/', (req, res, next) => {
    delete req.body._id;
    const sauces = new sauces({
      ...req.body
    });
    sauces.save()
      .then(() => res.status(201).json({ message: 'Objet créé !'}))
      .catch(error => res.status(400).json({ error }));
  });
  
  router.put('/:id', (req, res, next) => {
    sauces.updateOne({ _id: req.params.id}, { ...req.body, _id: req.params.id})
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
      .catch(error => res.status(400).json({ error }));
  });
  
  router.delete('/:id', (req, res, next) => {
    sauces.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
      .catch(error => res.status(400).json({ error }));
  });
  
  router.get('/:id', (req, res, next) => {
    sauces.findOne({ _id: req.params.id })
      .then(sauces => res.status(200).json(sauces))
      .catch(error => res.status(404).json({ error }));
  });
  
  router.use('/', (req, res, next) => {
    sauces.find()
      .then(things => res.status(200).json(sauces))
      .catch(error => res.status(400).json({ error }));
  });

  
  module.exports = router;