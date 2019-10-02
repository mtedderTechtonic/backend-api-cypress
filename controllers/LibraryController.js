const { verifyJWT_MW } = require("../middlewares");
const express = require("express");
const router = express.Router();
const firebase = require("firebase");
const { db } = require("../libs/firebase");

router.all("*", verifyJWT_MW);

//library endpoints
router.post("/", async (req, res) => {
  try {
    let data = req.body.books;
    let batch = db.batch();
    await data.forEach(book => {
      let docRef = db.collection("books").doc();
      book.userId = req.user.id;
      book.timeStamp = Date.now();
      book.bookId = docRef.id;
      batch.set(docRef, book);
    });
    batch.commit();
    res.status(200).send("Added books to DB");
  } catch (err) {
    res.status(500).send("There was an error processing your request", err);
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let bookRef = db.collection("books").doc(id);
    await bookRef.update(req.body);
    res.status(200).send("Book Updated!");
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/random", async (req, res) => {
  try {
    const booksArr = [];
    let bookRef = await db.collection("books").get();
    bookRef.forEach(book => {
      booksArr.push(book.data());
    });
    let randomBook = booksArr[Math.floor(Math.random() * booksArr.length)];
    return res.status(200).send(randomBook);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get("/searchBy/", async (req, res) => {
  const { author, title } = req.query;
  const bookToDisplay = [];
  if (author === "" || title === "") {
    return res
      .status(500)
      .send("You must provide an author AND title to search for a book");
  } else {
    try {
      let bookRef = await db.collection("books");
      let query = await bookRef
        .where("userId", "==", req.user.id)
        .where("author", "==", author)
        .where("title", "==", title)
        .get();
      if (query.empty) {
        console.log("here");
        return res.status(500).send("Book not found!");
      } else {
        query.forEach(book => {
            bookToDisplay.push(book.data())
        });
        return res.status(200).send(bookToDisplay);
      }
    } catch {
      return res.status(500).send("There was an error processing your request");
    }
  }
});

router.get("/totalCount", async (req, res) => {
  try {
    let colRef = await db.collection("books").get();
    res.status(200).send({ length: colRef.size });
  } catch {
    res.sendStatus(500).send("There was an error processing your request");
  }
});

router.get("/:numResults/", async (req, res) => {
  const booksToDisplay = [];
  const num = +req.params.numResults;
  try {
    let booksRef = await db.collection("books");
    let numBooks = await booksRef.limit(num).get();
    numBooks.forEach(book => {
      booksToDisplay.push(book.data());
    });
    return res.status(200).send(booksToDisplay);
  } catch {
    return res.status(500).send("There was an error processing your request");
  }
});

router.delete("/deleteBy/", async (req, res) => {
  const { author, title } = req.query;
  if (author === "" || title === "") {
    return res
      .status(500)
      .send("You must provide an author AND title to delete a book");
  } else {
    try {
      let bookRef = await db.collection("books");
      let query = await bookRef
        .where("userId", "==", req.user.id)
        .where("author", "==", author)
        .where("title", "==", title)
        .get();
      if (query.empty) {
        console.log("here");
        return res.status(500).send("Book not found!");
      } else {
        query.forEach(book => {
          bookRef.doc(book.id).delete();
        });
        return res.status(200).send(`Book was deleted!`);
      }
    } catch {
      return res.status(500).send("There was an error processing your request");
    }
  }
});

router.delete("/deleteById/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let bookRef = await db.collection("books").doc(id);
    let getDoc = await bookRef.get();
    if (!getDoc.exists) {
      return res.status(500).send("There was an error processing your request");
    } else {
      await bookRef.delete();
      res.status(200).send(`Book with ID ${id} deleted!`);
    }
  } catch (err) {
    res.status(500).send("There was an error processing your request", err);
  }
});

module.exports = router;
