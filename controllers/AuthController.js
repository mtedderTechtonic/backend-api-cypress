const express = require("express");
const bcryptjs = require("bcryptjs");
const router = express.Router();

const { createJWToken, verifyJWTToken } = require("../libs/auth");
const { db } = require("../libs/firebase");

// :POST '/register’
// This route will allow new users to register. This method should be taking in the data for creating a new entry in the user document and creating a new JWT using the proccedual method in libs/auth.js called createJWToken.
router.post("/register", async function(req, res) {
  const { firstName = "", lastName = "", email, password } = req.body;
  // PASSWORD MUST BE ENCRYPTED USING let hashedPassword = bcryptjs.hashSync(password, 8); BEFORE IT IS STORED IN THE DATABASE
  // encrypts the password before storing in database.
  const hashedPassword = bcryptjs.hashSync(password, 8);
  console.log(
    `Original password: ${password} \nHashed password: ${hashedPassword}`
  );

  // add createJWToken and take in data before posting to db

  // check out the firestore docs to see how to add this user's data to a 'users' collection
  // https://firebase.google.com/docs/firestore/quickstart?authuser=0#add_data

  let user = {
    firstName,
    lastName,
    email,
    password: hashedPassword
  };

  let usersRef = await db
    .collection("users")
    .where("email", "==", user.email)
    .get();
  if (!usersRef.empty) {
    return res.status(500).send({
      auth: false,
      token: null,
      message: "The email provided already exists."
    });
  } else {
    try {
      let addedUser = await db
        .collection("users")
        .add(user)
        console.log(`Added user with ID ${addedUser.id}`);
          user.id = addedUser.id
          db.collection('users').doc(addedUser.id).update({id: user.id})
          return res.status(200).send({
            auth: true,
            message: "registration successful",
            token: createJWToken({ sessionData: user, maxAge: 3600 })
          });
    } catch (err) {
      if (err) {
        console.error(err);
        res.status(500).send({
          auth: false,
          token: null,
          message: "There was a problem registering the user."
        });
      }
    }
  }
  // success return
  // { auth: true, message: "registration successful", token: createJWToken({ sessionData: user, maxAge: 3600 }) };
  // fail return
  // { auth: false, token: null, message: 'There was a problem registering the user.' };
});
// :POST ‘/login’
// This route is pretty self explanatory. We need to log the user in after they’ve registered and logged out.
// We will first find the user's data based on the supplied email and then use bcrypt.compareSync to check that their password is correct.  If so, we'll create a JWT similar to above and return it to the client
router.post("/login", async function(req, res) {
  const { email, password } = req.body;
  const foundPassword = await db
    .collection("users")
    .where("email", "==", email)
    .get();
    if (foundPassword.empty) {
      return res.status(500).send({
        auth: false,
        token: null,
        message: "invalid credentials."
      });
    } else {
  foundPassword.forEach(docs => {
    if (bcryptjs.compareSync(password, docs.data().password)) {
      const {
        firstName,
        lastName,
        email,
        password,
        id
      } = docs.data()
      const user = {
        firstName,
        lastName,
        email,
        password,
        id
      }
      return res.status(200).send({
        auth: true,
        token: createJWToken({ sessionData: user, maxAge: 3600 }),
        message: 'you are logged in'
      });
    } else {
      return res.status(500).send({
        auth: false,
        token: null,
        message: "invalid credentials."
      });
    }
  });
}
  // reference the cloud firestore docs to find the user based on their email
  // https://firebase.google.com/docs/firestore/query-data/queries?authuser=0#execute_a_query

  // we will check their password below
  // if the user isn't found or a server error occurs, send back the appropriate status code with:
  // {auth: false, token: null, message: "invalid credentials"}
  // use the bcrypsjs.compareSync(password, hashedPassword) method to compare the client-supplied password to ours stored in the db which bcrypt hashed for us
  // if the password is correct return
  // { auth: true, token: createJWToken({ sessionData: user, maxAge: 3600 }), name: user.firstName };
  // else return
  // { auth: false, token: null, message: "invalid credentials" }
});

// :GET '/logout’
// this route should simply return: { auth: false, token: null }
router.get("/logout", function(req, res) {
  return res.status(200).send({
    auth: false,
    token: null,
  });
});

module.exports = router;
