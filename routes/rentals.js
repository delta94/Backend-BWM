var express = require("express");
var router = express.Router();
const Rental = require("../models/rental");

router.get("", (req, res) => {
  Rental.find({}).then(foundRentals => res.json(foundRentals));
});

router.get("/:id", (req, res) => {
  Rental.findById(req.params.id)
    .then(rental => res.json(rental))
    .catch(err =>
      res.status(422).send({
        errors: [
          {
            title: "Rental Error!",
            detail: "Could not find Rental!"
          }
        ]
      })
    );
});

module.exports = router;
