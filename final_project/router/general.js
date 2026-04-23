const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Task 1 & 10: Get the book list available in the shop using async/await with Promise
public_users.get('/', async function(req, res) {
  try {
    const fetchBooks = new Promise((resolve, reject) => {
      if (books) {
        resolve(books);
      } else {
        reject(new Error("Unable to retrieve books"));
      }
    });
    const allBooks = await fetchBooks;
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Task 2 & 11: Get book details based on ISBN using Promise callbacks
public_users.get('/isbn/:isbn', function(req, res) {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject({ status: 404, message: `ISBN ${isbn} not found` });
    }
  })
    .then(book => res.status(200).json(book))
    .catch(err => res.status(err.status || 500).json({ message: err.message }));
});

// Task 3 & 12: Get book details based on author using async/await with Promise
public_users.get('/author/:author', async function(req, res) {
  try {
    const author = req.params.author;
    const booksByAuthor = await new Promise((resolve, reject) => {
      const bookKeys = Object.keys(books);
      const result = bookKeys
        .filter(key => books[key].author === author)
        .map(key => books[key]);
      if (result.length > 0) {
        resolve(result);
      } else {
        reject({ status: 404, message: "No books found for this author" });
      }
    });
    return res.status(200).json({ books: booksByAuthor });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

// Task 4 & 13: Get all books based on title using async/await with Promise
public_users.get('/title/:title', async function(req, res) {
  try {
    const title = req.params.title;
    const booksByTitle = await new Promise((resolve, reject) => {
      const bookKeys = Object.keys(books);
      const result = bookKeys
        .filter(key => books[key].title === title)
        .map(key => books[key]);
      if (result.length > 0) {
        resolve(result);
      } else {
        reject({ status: 404, message: "No books found with this title" });
      }
    });
    return res.status(200).json({ books: booksByTitle });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

// Task 5: Get book review
public_users.get('/review/:isbn', function(req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    const reviews = book.reviews;
    if (Object.keys(reviews).length > 0) {
      return res.status(200).json(reviews);
    }
    return res.status(200).json({ message: "No reviews found for this book." });
  }
  return res.status(404).json({ message: "Book not found" });
});

// Task 10: Get all books using async/await with Axios
public_users.get('/async/books', async function(req, res) {
  try {
    const response = await axios.get('http://localhost:5000/');
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Task 11: Get book by ISBN using Promise with Axios
public_users.get('/async/isbn/:isbn', function(req, res) {
  const isbn = req.params.isbn;
  axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(response => res.status(200).json(response.data))
    .catch(error => res.status(error.response ? error.response.status : 500)
      .json({ message: error.response ? error.response.data.message : error.message }));
});

// Task 12: Get books by author using async/await with Axios
public_users.get('/async/author/:author', async function(req, res) {
  try {
    const author = req.params.author;
    const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(error.response ? error.response.status : 500)
      .json({ message: error.response ? error.response.data.message : error.message });
  }
});

// Task 13: Get books by title using async/await with Axios
public_users.get('/async/title/:title', async function(req, res) {
  try {
    const title = req.params.title;
    const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(error.response ? error.response.status : 500)
      .json({ message: error.response ? error.response.data.message : error.message });
  }
});

module.exports.general = public_users;
