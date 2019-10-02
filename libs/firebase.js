const firebase = require("firebase");
require("firebase/firestore");
require('dotenv').config();

// TODO add firebase config here
// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: process.env.firebaseapiKey,
  authDomain: "tacowalrus.firebaseapp.com",
  databaseURL: "https://tacowalrus.firebaseio.com",
  projectId: "tacowalrus",
  storageBucket: "tacowalrus.appspot.com",
  messagingSenderId: "82106527453",
  appId: "1:82106527453:web:058f263ac3a97604"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// call firebase.initializeApp and pass in your config object

module.exports = {
  db: firebase.firestore()
};
