const sauces = require('../models/sauces');
const fs = require('fs');
const { json } = require('express');

exports.createSauces = (req, res, next) => {
    const saucesObject = JSON.parse(req.body.sauces);
    delete saucesObject._id;
    delete saucesObject._userId;
    const sauces = new sauces({
        ...saucesObject, 
        userId : req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });

    sauces.save()
    .then(() => { res.status(201);json({message : 'Sauce créée !'})})
    .catch(error => { res.status(400).json({error})})
};

exports.getOneSauces = (req, res, next) => {
    sauces.findOne({
        _id: req.params.id
    }).then((sauces) => {
        res.satus(200).json(sauces);
    }
    ).catch(
        (error) => {
            res.status(404).json({error});
        }
    )
}

exports.getAllSauces = (req, res, next) => {
    sauces.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

exports.modifySauces = (req, res, next) => {
    const saucesObject = req.file ? {
        ...JSON.parse(req.body.sauces),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete saucesObject._userId;
    sauces.findOne({_id: req.params.id})
        .then((sauces) => {
            if (sauces.userId != req.auth.userId) {
                res.status(401).json({ message : 'Non autorisé'});
            } else {
                sauces.updateOne({ _id: req.params.id}, { ...saucesObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Objet modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
 };

 exports.deleteSauces = (req, res, next) => {
    sauces.findOne({ _id: req.params.id})
        .then(sauces => {
            if (sauces.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = sauces.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    sauces.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
 };
