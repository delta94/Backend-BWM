const Booking = require("../models/booking");
const Rental = require("../models/rental");
const { normalizeErrors } = require("../helpers/mongoose");
const moment = require("moment");
const User = require("../models/user");
const createPayment = require("../services/createPayment");

module.exports.createBooking = (req, res, next) => {
  const {
    startAt,
    endAt,
    totalPrice,
    guests,
    days,
    rental,
    paymentToken
  } = req.body;
  const user = req.userProfile;

  const booking = new Booking({
    startAt,
    endAt,
    totalPrice,
    guests,
    days
  });

  Rental.findById(rental._id)
    .populate("bookings")
    .populate("user")
    .then(async foundRental => {
      if (foundRental.user.id == user._id) {
        return res.status(422).json({
          errors: [
            {
              title: "Invalid User!",
              detail: "Cannot create booking on your Rental"
            }
          ]
        });
      }

      if (
        isValidBooking(booking, foundRental)
        // &&
        // moment(booking.endAt) > moment(booking.startAt)
      ) {
        booking.user = user;
        booking.rental = foundRental;

        foundRental.bookings.push(booking);

        const { payment, err } = await createPayment(
          booking,
          foundRental.user,
          paymentToken
        );

        if (payment) {
          booking.payment = payment;

          booking
            .save()
            .then(() => {
              foundRental.save();
              User.update(
                { _id: user.id },
                { $push: { bookings: booking } }
              ).catch(err => {
                return res
                  .status(422)
                  .send({ errors: normalizeErrors(err.errors) });
              });

              return res.json({
                startAt: booking.startAt,
                endAt: booking.endAt
              });
            })
            .catch(err => {
              return res
                .status(422)
                .send({ errors: normalizeErrors(err.errors) });
            });
        } else {
          return res
            .status(422)
            .send({ errors: [{ title: "Payment Error", detail: err }] });
        }
      } else {
        return res.status(422).send({
          errors: [
            {
              title: "Invalid Booking!",
              detail: "Choosen dates are already taken!"
            }
          ]
        });
      }
    })
    .catch(err => {
      res.status(422).json({
        errors: normalizeErrors(err.errors)
      });
    });
};

exports.getUserBookings = function(req, res) {
  const user = req.userProfile;

  Booking.where({ user })
    .populate("rental")
    .exec(function(err, foundBookings) {
      if (err) {
        return res.status(422).send({ errors: normalizeErrors(err.errors) });
      }

      return res.json(foundBookings);
    });
};

function isValidBooking(proposedBooking, rental) {
  let isValid = true;

  if (rental.bookings && rental.bookings.length > 0) {
    isValid = rental.bookings.every(function(booking) {
      const proposedStart = moment(proposedBooking.startAt);
      const proposedEnd = moment(proposedBooking.endAt);

      const actualStart = moment(booking.startAt);
      const actualEnd = moment(booking.endAt);

      return (
        (actualStart < proposedStart && actualEnd < proposedStart) ||
        (proposedEnd < actualEnd && proposedEnd < actualStart)
      );
    });
  }

  return isValid;
}
