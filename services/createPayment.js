const User = require("../models/user");
const config = require("../config");

const stripe = require("stripe")(config.STRIPE_SK);
const Payment = require("../models/payment");
const CUSTOMER_SHARE = 0.8;

async function createPayment(booking, toUser, token) {
  const { user } = booking;

  const customer = await stripe.customers.create({
    source: token.id,
    email: user.email
  });

  if (customer) {
    User.update(
      { _id: user.id },
      { $set: { stripeCustomerId: customer.id } },
      () => {}
    );

    const payment = new Payment({
      fromUser: user,
      toUser,
      fromStripeCustomerId: customer.id,
      booking,
      tokenId: token.id,
      amount: booking.totalPrice * 100 * CUSTOMER_SHARE
    });

    try {
      const savedPayment = await payment.save();
      return { payment: savedPayment };
    } catch (err) {
      return { err: err.message };
    }
  } else {
    return { err: "Cannot process Payment!" };
  }
}

module.exports = createPayment;
