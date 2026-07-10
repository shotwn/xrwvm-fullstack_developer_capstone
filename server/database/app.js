/*jshint esversion: 8 */
const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');

const Reviews = require('./review');
const Dealerships = require('./dealership');

const app = express();
const port = 3030;

app.use(cors());
app.use(express.urlencoded({ extended: false }));

const reviewsData = JSON.parse(
  fs.readFileSync('reviews.json', 'utf8')
);

const dealershipsData = JSON.parse(
  fs.readFileSync('dealerships.json', 'utf8')
);


// Express route to home
app.get('/', async (req, res) => {
  res.send('Welcome to the Mongoose API');
});


// Express route to fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      error: 'Error fetching reviews',
    });
  }
});


// Express route to fetch reviews by a particular dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({
      dealership: req.params.id,
    });

    res.json(documents);
  } catch (error) {
    console.error('Error fetching dealer reviews:', error);
    res.status(500).json({
      error: 'Error fetching dealer reviews',
    });
  }
});


// Express route to fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
  try {
    const documents = await Dealerships.find();
    res.json(documents);
  } catch (error) {
    console.error('Error fetching dealerships:', error);
    res.status(500).json({
      error: 'Error fetching dealerships',
    });
  }
});


// Express route to fetch dealerships by a particular state
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const documents = await Dealerships.find({
      state: req.params.state,
    });

    res.json(documents);
  } catch (error) {
    console.error('Error fetching dealerships by state:', error);
    res.status(500).json({
      error: 'Error fetching dealerships by state',
    });
  }
});


// Express route to fetch a dealer by a particular ID
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const document = await Dealerships.findOne({
      id: req.params.id,
    });

    if (!document) {
      return res.status(404).json({
        error: 'Dealership not found',
      });
    }

    res.json(document);
  } catch (error) {
    console.error('Error fetching dealership:', error);
    res.status(500).json({
      error: 'Error fetching dealership',
    });
  }
});


// Express route to insert a review
app.post(
  '/insert_review',
  express.raw({ type: '*/*' }),
  async (req, res) => {
    try {
      const data = JSON.parse(req.body.toString());

      const latestReview = await Reviews.findOne()
        .sort({ id: -1 })
        .select('id');

      const newId = latestReview ? latestReview.id + 1 : 1;

      const review = new Reviews({
        id: newId,
        name: data.name,
        dealership: data.dealership,
        review: data.review,
        purchase: data.purchase,
        purchase_date: data.purchase_date,
        car_make: data.car_make,
        car_model: data.car_model,
        car_year: data.car_year,
      });

      const savedReview = await review.save();
      res.status(201).json(savedReview);
    } catch (error) {
      console.error('Error inserting review:', error);
      res.status(500).json({
        error: 'Error inserting review',
      });
    }
  }
);


// Seed the database with the JSON files
async function seedDatabase() {
  await Reviews.deleteMany({});
  await Reviews.insertMany(reviewsData.reviews);

  await Dealerships.deleteMany({});
  await Dealerships.insertMany(
    dealershipsData.dealerships
  );

  console.log('Database seeded successfully');
}


// Connect to MongoDB, seed the database, and start Express
async function startServer() {
  try {
    await mongoose.connect(
      'mongodb://mongo_db:27017/',
      {
        dbName: 'dealershipsDB',
      }
    );

    console.log('Connected to MongoDB');

    await seedDatabase();

    app.listen(port, () => {
      console.log(
        `Server is running on http://localhost:${port}`
      );
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();