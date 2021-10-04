const Sauce = require("../models/Sauce");
const fs = require("fs");

//Affichage de toute les sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

// Création d'une sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);

  const sauce = new Sauce({
    ...sauceObject,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => {
      res.status(201).json({
        message: "Sauce créee avec succès",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

//Chercher une sauce en particulier via l'id
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};


exports.modifySauce = (req, res, next) => {
  const user = req.userId;

  if (req.file) {
    Sauce.findOne({ _id: req.params.id }).then((sauce) => {
      console.log(user);
      console.log(sauce.userId);
      console.log(req.userId);
      if (user != sauce.userId) {
        res.status(403).json({ message: "unauthorized request" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          const SauceObject = {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get("host")}/images/${
              req.file.filename
            }`,
          };
          Sauce.updateOne(
            { _id: req.params.id },
            { ...SauceObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
            .catch((error) => res.status(400).json({ error }));
        });
      }
    });
  } else {
    Sauce.findOne({ _id: req.params.id }).then((sauce) => {
      console.log(user);
      console.log(sauce.userId);
      console.log(req.userId);
      if (user != sauce.userId) {
        res.status(403).json({ message: "unauthorized request" });
      } else {
        const SauceObject = { ...req.body };
        Sauce.updateOne(
          { _id: req.params.id },
          { ...SauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
          .catch((error) => res.status(400).json({ error }));
      }
    });
  }
};

exports.deleteSauce = (req, res, next) => {
  const user = req.userId;

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      console.log(user);
      console.log(sauce.userId);
      console.log(req.userId);
      if (user  != sauce.userId) {
        res.status(403).json({ message: "unauthorized request" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
            .catch((error) => res.status(400).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  const user = req.userId;
  const likeValue = req.body.like;

  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      switch (likeValue) {
        case 1: //like
          if (sauce.usersLiked.includes(user)) {
            throw "Sauce déjà likée";
          } else {
            Sauce.updateOne(
              { _id: req.params.id },
              { $push: { usersLiked: user }, $inc: { likes: +1 } }
            ).then(() => res.status(201).json({ message: "Sauce likée !" }));
          }
          break;

        case -1: //dislike
          if (sauce.usersDisliked.includes(user)) {
            throw "Sauce déjà dislikée!";
          } else {
            Sauce.updateOne(
              { _id: req.params.id },
              { $push: { usersDisliked: user }, $inc: { dislikes: +1 } }
            ).then(() => res.status(201).json({ message: "Sauce dislikée !" }));
          }
          break;

        case 0: //suppression du like ou du dislike
          if (sauce.usersLiked.includes(user)) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $pull: { usersLiked: user },
                $inc: { likes: -1 },
              }
            )
              .then(() =>
                res.status(200).json({ message: "La sauce n'est plus likée" })
              )
              .catch((error) => res.status(500).json({ error }));
          }
          if (sauce.usersDisliked.includes(user)) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $pull: { usersDisliked: user },
                $inc: { dislikes: -1 },
              }
            )
              .then(() =>
                res
                  .status(200)
                  .json({ message: "La sauce n'est plus dislikée" })
              )
              .catch((error) => res.status(500).json({ error }));
          }
          break;
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
