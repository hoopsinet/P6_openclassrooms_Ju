const saucesModels = require('../models/sauces');
const fs = require('fs');
const { json } = require('express');

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
    .then(() => { res.status(201);json({message : 'Sauce créée !'})})
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

exports.modifySauces = (req, res, next) => {
    const saucesObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    saucesModels.updateOne({ _id: req.params.id}, { ...saucesObject, _id: req.params.id})
    .then(() => res.status(200).json({message : 'Objet modifié!'}))
    .catch(error => res.status(401).json({ error }));
};

 exports.deleteSaucesModels = (req, res, next) => {
    saucesModels.findOne({ _id: req.params.id})
        .then(saucesModels => {
            if (saucesModels.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = sauces.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    saucesModels.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
 };

 exports.likeOrDislikeSauce = (req, res, next) => {
    let likeStatus = req.body.like
    saucesModels.findOne({ _id: req.params.id })
        .then(saucesModels => { 
            // Si like = 1 et que l'utilisateur n'a pas encore like, on ajoute +1 like et on sauvegarde.
            if(likeStatus === 1 && !saucesModels.usersLiked.includes(req.body.userId)) {
                saucesModels.usersLiked.push(req.body.userId)
                saucesModels.likes++
                saucesModels.save()
                .then(() => res.status(200).json({ message: 'Un utilisateur like votre sauce!'}))
            }
            // Si il à déjà liké et qu'il rappuie sur le like, ça retire le like.
            if (likeStatus === 0 && saucesModels.usersLiked.includes(req.body.userId)) { 
                saucesModels.usersLiked.pull(req.body.userId)
                saucesModels.likes--
                saucesModels.save()
                .then(() => res.status(200).json({ message: 'lutilisateur dislike votre sauce'}))
                // Si l'utilisateur à dislike une sauce, et qu'il reclique sur dislike ça enléve son dislike.
            } else if (likeStatus === 0 && saucesModels.usersDisliked.includes(req.body.userId)) { 
                saucesModels.usersDisliked.pull(req.body.userId)
                saucesModels.dislikes--
                saucesModels.save()
                .then(() => res.status(200).json({ message: 'lutilisateur ne dislike plus la sauce!'}))
            }
            // Si l'utilisateur n'a jamais dislike et clique dessus, cela fait -1 
            if(likeStatus === -1 && !saucesModels.usersDisliked.includes(req.body.userId)) {
                saucesModels.usersDisliked.push(req.body.userId)
                saucesModels.dislikes++
                saucesModels.save()
                .then(() => res.status(200).json({ message: 'The user dislikes the sauce!'}))

            }
        }) 
        .catch(error => res.status(400).json({ error }));
};