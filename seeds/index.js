const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities  = require('./cities');
const {descriptors , places,tags} = require('./seedHelper');

mongoose.connect('mongodb://localhost:27017/yelp-camp1');

console.log(tags.length)
const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open', () => {
  console.log('Database Opened');
});

const sample = arr => arr[Math.floor(Math.random() *  arr.length)]; 

const seedDB = async () => {
  await  Campground.deleteMany({});
  for(let i = 0; i < `${cities.length}`; i++){
    const random1000 = Math.floor(Math.random() * cities.length);
    const price = Math.floor(Math.random() * 200) + 10;
    const tag = Math.floor(Math.random()* tags.length);
    const camp = new Campground({
      author: '62d5c1e0335f52cbeb13dc59',
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      description : `${tags[tag].description}`,
      price,
      geometry: {
        type: "Point",
        coordinates: [
            cities[random1000].longitude,
            cities[random1000].latitude,
        ]
     },
      images: [
        {
          url: 'https://res.cloudinary.com/dcz8fqwkr/image/upload/v1658222000/YelpCamp/kcsg1dctutlfokh5xflf.jpg',
          filename: 'YelpCamp/kcsg1dctutlfokh5xflf',
        },
        {
          url: 'https://res.cloudinary.com/dcz8fqwkr/image/upload/v1658222215/YelpCamp/cmkooklvbul0gnr7grzi.jpg',
          filename: 'YelpCamp/cmkooklvbul0gnr7grzi',
        }
      ],

      
    
  })
  await camp.save();
  
} }

seedDB().then( () => {
  mongoose.connection.close()
});