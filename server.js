const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ---------- BOOK STORAGE ---------- */
const BOOKS_FILE = path.join(__dirname, 'books.json');
let books = [];

if (fs.existsSync(BOOKS_FILE)) {
  books = JSON.parse(fs.readFileSync(BOOKS_FILE));
}

function saveBooks() {
  fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2));
}

/* ---------- UPLOADS FOLDER ---------- */
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

/* ---------- MULTER ---------- */
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

/* ---------- LOGIN ---------- */
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (email === "admin@example.com" && password === "12345") {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

/* ---------- GET BOOKS ---------- */
app.get('/api/books', (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  const filtered = books.filter(b => b.title.toLowerCase().includes(q));
  res.json(filtered);
});

/* ---------- UPLOAD BOOK ---------- */
app.post('/api/upload', upload.single('image'), (req, res) => {
  const { title, author, price, condition } = req.body;

  if (!title || !author || !price || !condition) {
    return res.status(400).json({ success: false });
  }

  const newBook = {
    id: Date.now(),
    title,
    author,
    price,
    condition,
    image: req.file ? `/uploads/${req.file.filename}` : ''
  };

  books.push(newBook);
  saveBooks();
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
