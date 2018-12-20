const Rental = require("../models/rental");
const User = require("../models/user");

class FakeDb {
  constructor() {
    this.rentals = [
      {
        title: "Central Apartment",
        city: "san francisco",
        street: "Main street",
        category: "apartment",
        image: "http://via.placeholder.com/350x250",
        bedrooms: 3,
        description: "Very nice apartment",
        dailyRate: 34,
        shared: false
      },
      {
        title: "Central Apartment 2",
        city: "Hanoi",
        street: "Thai Ha",
        category: "apartment",
        image: "http://via.placeholder.com/350x250",
        bedrooms: 3,
        description: "Very nice apartment",
        dailyRate: 34,
        shared: false
      }
    ];

    this.users = [
      {
        username: "Test User",
        email: "test@gmail.com",
        password: "123456"
      }
    ];
  }

  async cleanDb() {
    await User.remove({});
    await Rental.remove({});
  }

  pushRentalsToDb() {
    const user = new User(this.users[0]);

    this.rentals.forEach(rental => {
      const newRental = new Rental(rental);

      newRental.user = user;
      user.rentals.push(newRental);

      newRental
        .save()
        .then(res => console.log(res))
        .catch(err => console.log(err));
    });

    user.save();
  }

  async seeDB() {
    await this.cleanDb();
    this.pushRentalsToDb();
  }
}

module.exports = FakeDb;
