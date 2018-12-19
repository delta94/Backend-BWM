const Rental = require("../models/rental");

class FakeDb {
  constructor() {
    this.rentals = [
      {
        title: "Central Apartment",
        city: "New York",
        street: "Times Square",
        category: "apartment",
        image: "http://via.placeholder.com/350x250",
        bedrooms: 3,
        description: "Very nice apartment",
        dailyRate: 34,
        shared: false
      },
      {
        title: "Central Apartment 2",
        city: "New York 3",
        street: "Times Square 4",
        category: "apartment",
        image: "http://via.placeholder.com/350x250",
        bedrooms: 3,
        description: "Very nice apartment",
        dailyRate: 34,
        shared: false
      }
    ];
  }

  //   async cleanDb() {
  //     await Rental.remove({});
  //   }

  pushRentalsToDb() {
    this.rentals.forEach(rental => {
      const newRental = new Rental(rental);
      newRental
        .save()
        .then(res => console.log(res))
        .catch(err => console.log(err));
    });
  }

  seeDB() {
    // this.cleanDb();
    this.pushRentalsToDb();
  }
}

module.exports = FakeDb;
