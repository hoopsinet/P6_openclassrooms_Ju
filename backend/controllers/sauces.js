const saucesModels = require('../models/sauces');
const fs = require('fs');
const { json } = require('express');

// créer notre sauce dans un formulaire
exports.createSauces = (req, res, next) => {
    const saucesObject = JSON.parse(req.body.sauce);
    delete saucesObject._id;
    delete saucesObject._userId;
    const sauces = new saucesModels({
        ...saucesObject, 
        userId : req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });

    sauces.save()
    .then(() => { res.status(201).json({message : 'Sauce créée !'})})
    .catch(error => { res.status(400).json({error})})
};

exports.getOneSauces = (req, res, next) => {
    saucesModels.findOne({
        _id: req.params.id
    }).then((sauces) => {
        res.status(200).json(sauces);
    }
    ).catch(
        (error) => {
            res.status(404).json({error});
        }
    )
}

exports.getAllSauces = (req, res, next) => {
    saucesModels.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};
// Modifier le nom/l'image etc.. de la sauce
exports.modifySauces = (req, res, next) => {
    const saucesObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    saucesModels.updateOne({ _id: req.params.id}, { ...saucesObject, _id: req.params.id})
    .then(() => res.status(200).json({message : 'Objet modifié!'}))
    .catch(error => res.status(401).json({ error }));
};
// Pour supprimer définitivement une sauce 
 exports.deleteSaucesModels = (req, res, next) => {
    saucesModels.findOne({ _id: req.params.id})
        .then(saucesModels => {
            if (saucesModels.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = saucesModels.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    saucesModels.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            console.log(error)
            res.status(500).json({ error });
        });
 };

 exports.likeOrDislikeSauce = (req, res, next) => {
    let likeStatus = req.body.like
    let userId = req.body.userId
    console.log(likeStatus)
    saucesModels.findOne({ _id: req.params.id })
        .then(saucesModels => { 
            if (likeStatus === 1) {
                if (!saucesModels.usersLiked.includes(userId)) {
                    if (!saucesModels.usersDisliked.includes(userId)) {
                        saucesModels.usersLiked.push(userId)
                        saucesModels.likes++
                        saucesModels.save()
                            .then(() => res.status(200).json({ message: 'Un utilisateur like votre sauce!' }))
                    } else {
                        res.status(401).json({ message: 'vous avez déjà un dislike' });
                    }
                } else {
                    res.status(401).json({ message: 'vous avez déjà liké cette sauce' });
                }
            } else if (likeStatus === 0) {
                if (saucesModels.usersDisliked.includes(userId)) {
                    saucesModels.usersDisliked.pull(req.body.userId)
                    saucesModels.dislikes--
                    saucesModels.save()
                        .then(() => res.status(200).json({ message: 'lutilisateur ne dislike plus la sauce!' }))
                } else if (saucesModels.usersLiked.includes(userId)) {
                    saucesModels.usersLiked.pull(req.body.userId)
                    saucesModels.likes--
                    saucesModels.save()
                        .then(() => res.status(200).json({ message: 'lutilisateur ne like votre sauce' }))
                } else {
                    res.status(401).json({ message: 'Erreur' });
                }
            } else if (likeStatus === -1) {
                if (!saucesModels.usersDisliked.includes(userId)) {
                    if (!saucesModels.usersLiked.includes(userId)) {
                        saucesModels.usersDisliked.push(userId)
                        saucesModels.dislikes++
                        saucesModels.save()
                            .then(() => res.status(200).json({ message: 'lutilisateur  dislike  la sauce!' }))
                    } else {
                        res.status(401).json({ message: 'vous avez déjà un like' });
                    }
                } else {
                    res.status(401).json({ message: 'vous avez déjà disliké cette sauce' });
                }
            }
        }) 
        .catch(error => res.status(400).json({ error }));
};