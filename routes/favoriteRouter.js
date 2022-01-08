const express = require("express");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");

const favoriteRouter = express.Router();

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id }) // DONE - did it right YES!!!
      .populate("user")
      .populate("campsites")
      .then((favorite) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorite);
      })
      .catch((err) => next(err));
  })
  .post(
    // DONE - needed help :(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => {
      Favorite.findOne({ user: req.user._id })
        .then((favorite) => {
          console.log(favorite);
          if (favorite) {
            // a favorite exists
            console.log(`favorite array exists ${favorite}`);
            if (favorite.campsites.length > 0) {
              req.body.forEach((newFav) => {
                if (!favorite.campsites.includes(newFav._id)) {
                  favorite.campsites.push(newFav._id);
                }
              });
            } else if (favorite.campsites.length == 0 ) {
              req.body.forEach((newFav) => {
                  favorite.campsites.push(newFav._id);
              });
            }
            favorite
              .save()
              .then((favorite) => {
                res.statusCode = 201;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              })
              .catch((err) => next(err));
          } else {
            // no favorite exists
            Favorite.create({ user: req.user._id })
              .then((favorite) => {
                req.body.forEach((newFav) => {
                  console.log(
                    `favorite is: ${favorite} and newFav is: ${newFav}`
                  );
                  if (!favorite.campsites.includes(newFav._id)) {
                    favorite.campsites.push(newFav._id);
                  }
                });
                favorite
                  .save()
                  .then((favorite) => {
                    res.statusCode = 201;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  })
                  .catch((err) => next(err));
              })
              .catch((err) => next(err));
          }
        })
        .catch((err) => next(err));
    }
  )
  .put(
    // DONE
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res) => {
      res.statusCode = 403;
      res.end("PUT operation not supported on /favorites");
    }
  )
  .delete(
    // DONE - I did it right!!!
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => {
      Favorite.findOneAndDelete({ user: req.user._id })
        .then((response) => {
          res.statusCode = 200;
          if (response) {
            res.setHeader("Content-Type", "application/json");
            res.json(response);
          } else {
            res.setHeader("Content-Type", "text/plain");
            res.end("You do not have any favorites to delete");
          }
        })
        .catch((err) => next(err));
    }
  );

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(
    cors.corsWithOptions, // DONE - I did it right!
    authenticate.verifyUser,
    (req, res) => {
      res.statusCode = 403;
      res.end(
        `GET operation not supported on /favorites/${req.params.campsiteId}`
      );
    }
  )
  .post(
    // Done with class
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => {
      Favorite.findOne({ user: req.user._id })
        .then((favorite) => {
          if (favorite) {
            if (!favorite.campsites.includes(req.params.campsiteId)) {
              favorite.campsites.push(req.params.campsiteId);
              favorite
                .save()
                .then((favorite) => {
                  res.statusCode = 201;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                })
                .catch((err) => next(err));
            } else {
              res.statusCode = 200;
              res.setHeader("Content-Type", "text/plain");
              res.end("That campsite is already a favorite!");
            }
          } else {
            Favorite.create({
              user: req.uer._id,
              campsites: [req.params.campsiteId],
            })
              .then((favorite) => {
                res.statusCode = 201;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              })
              .catch((err) => next(err));
          }
        })
        .catch((err) => next(err));
    }
  )
  .put(
    // Done
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res) => {
      res.statusCode = 403;
      res.end(
        `PUT operation not supported on /favorites/${req.params.campsiteId}`
      );
    }
  )
  .delete(
    // TODO
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => {
      Favorite.findOne({ user: req.user._id })
        .then((favorite) => {
          if (favorite) {
            const index = favorite.campsites.indexOf(req.params.campsiteId);
            if (index >= 0) {
              favorite.campsites.splice(index, 1);
            }
            favorite
              .save()
              .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              })
              .catch((err) => next(err));
          } else {
            // no favorite doc even exists
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/plain");
            res.end("There are no favorites to delete!");
          }
        })
        .catch((err) => next(err));
    }
  );

module.exports = favoriteRouter;
