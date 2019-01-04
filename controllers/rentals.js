const Rental = require("../models/rental");
const { normalizeErrors } = require("../helpers/mongoose");
const User = require("../models/user");

module.exports.secret = (req, res) => {
  res.json({
    secret: true
  });
};

module.exports.manage = function(req, res) {
  const user = req.userProfile;

  Rental.where({ user })
    .populate("bookings")
    .exec(function(err, foundRentals) {
      if (err) {
        return res.status(422).send({ errors: normalizeErrors(err.errors) });
      }

      return res.json(foundRentals);
    });
};

module.exports.idVerify = (req, res) => {
  const user = req.userProfile;
  Rental.findById(req.params.id)
    .populate("user")
    .then(foundRental => {
      if (foundRental.user.id != user.id) {
        return res.status(422).send({
          errors: [
            { title: "Invalid User!", detail: "You are not rental owner!" }
          ]
        });
      }

      return res.json({ status: "verifyed" });
    })
    .catch(err =>
      res.status(422).send({ errors: normalizeErrors(err.errors) })
    );
};

module.exports.getById = (req, res) => {
  Rental.findById(req.params.id)
    .populate("user", "username avatar -_id")
    .populate("bookings", "startAt endAt -_id")
    .then(rental => res.json(rental))
    .catch(err =>
      res.status(422).send({ errors: normalizeErrors(err.errors) })
    );
};

module.exports.updateById = (req, res) => {
  const rentalData = req.body;
  const user = req.userProfile;

  Rental.findById(req.params.id)
    .populate("user")
    .then(foudRental => {
      if (foudRental.user.id != user.id) {
        return res.status(422).send({
          errors: [
            {
              title: "Invalid User!",
              detail: "You are not rental owner!"
            }
          ]
        });
      }

      foudRental.set(rentalData);
      foudRental
        .save()
        .then(() => res.json(foudRental))
        .catch(err =>
          res.status(422).send({ errors: normalizeErrors(err.errors) })
        );
    })
    .catch(err =>
      res.status(422).send({ errors: normalizeErrors(err.errors) })
    );
};

module.exports.deleteRentalById = function(req, res) {
  const user = req.userProfile;

  Rental.findById(req.params.id)
    .populate("user", "_id")
    .populate({
      path: "bookings",
      select: "startAt",
      match: { startAt: { $gt: new Date() } }
    })
    .exec(function(err, foundRental) {
      if (err) {
        return res.status(422).send({ errors: normalizeErrors(err.errors) });
      }

      if (user._id != foundRental.user.id) {
        return res.status(422).send({
          errors: [
            { title: "Invalid User!", detail: "You are not rental owner!" }
          ]
        });
      }

      if (foundRental.bookings.length > 0) {
        return res.status(422).send({
          errors: [
            {
              title: "Active Bookings!",
              detail: "Cannot delete rental with active bookings!"
            }
          ]
        });
      }

      foundRental.remove(function(err) {
        if (err) {
          return res.status(422).send({ errors: normalizeErrors(err.errors) });
        }

        return res.json({ status: "deleted" });
      });
    });
};

module.exports.createRental = function(req, res) {
  const {
    title,
    city,
    street,
    category,
    image,
    shared,
    bedrooms,
    description,
    dailyRate
  } = req.body;
  const user = req.userProfile;

  const rental = new Rental({
    title,
    city,
    street,
    category,
    image,
    shared,
    bedrooms,
    description,
    dailyRate
  });
  rental.user = user;

  Rental.create(rental, function(err, newRental) {
    if (err) {
      return res.status(422).send({ errors: normalizeErrors(err.errors) });
    }

    User.update(
      { _id: user.id },
      { $push: { rentals: newRental } },
      function() {}
    );

    return res.json(newRental);
  });
};

module.exports.getAllRental = (req, res) => {
  const city = req.query.city;
  const query = city ? { city: city.toLowerCase() } : {};

  Rental.find(query)
    .select("-bookings")
    .exec(function(err, foundRentals) {
      if (err) {
        return res.status(422).send({ errors: normalizeErrors(err.errors) });
      }

      if (city && foundRentals.length === 0) {
        return res.status(422).send({
          errors: [
            {
              title: "No Rentals Found!",
              detail: `There are no rentals for city ${city}`
            }
          ]
        });
      }

      return res.json(foundRentals);
    });
};
