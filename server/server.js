const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 5555;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./coursehub.db');

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    instructor TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students (id),
    FOREIGN KEY (course_id) REFERENCES courses (id)
  )`);
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (row) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword], function(err) {
          if (err) {
            return res.status(500).json({ message: 'Error creating user' });
          }

          const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET);
          res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: this.lastID, name, email }
          });
        });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!row) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, row.password);

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: row.id, email: row.email }, JWT_SECRET);
      res.json({
        message: 'Login successful',
        token,
        user: { id: row.id, name: row.name, email: row.email }
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Course routes
app.get('/api/courses', (req, res) => {
  db.all('SELECT * FROM courses', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/api/courses', (req, res) => {
  const { title, description, instructor } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  db.run('INSERT INTO courses (title, description, instructor) VALUES (?, ?, ?)',
    [title, description, instructor], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error creating course' });
      }

      res.status(201).json({
        id: this.lastID,
        title,
        description,
        instructor
      });
    });
});

app.put('/api/courses/:id', (req, res) => {
  const { title, description, instructor } = req.body;
  const { id } = req.params;

  db.run('UPDATE courses SET title = ?, description = ?, instructor = ? WHERE id = ?',
    [title, description, instructor, id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error updating course' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Course not found' });
      }

      res.json({ message: 'Course updated successfully' });
    });
});

app.delete('/api/courses/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM courses WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error deleting course' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  });
});

// Student routes
app.get('/api/students', (req, res) => {
  db.all('SELECT * FROM students', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(rows);
  });
});

app.get('/api/students/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM students WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!row) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(row);
  });
});

app.post('/api/students', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  db.run('INSERT INTO students (name, email) VALUES (?, ?)',
    [name, email], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error creating student' });
      }

      res.status(201).json({
        id: this.lastID,
        name,
        email
      });
    });
});

// Enrollment routes
app.get('/api/enrollments', (req, res) => {
  db.all(`
    SELECT e.*, s.name as student_name, c.title as course_title
    FROM enrollments e
    JOIN students s ON e.student_id = s.id
    JOIN courses c ON e.course_id = c.id
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/api/enrollments', (req, res) => {
  const { student_id, course_id } = req.body;

  if (!student_id || !course_id) {
    return res.status(400).json({ message: 'Student ID and Course ID are required' });
  }

  db.run('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)',
    [student_id, course_id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error creating enrollment' });
      }

      res.status(201).json({
        id: this.lastID,
        student_id,
        course_id
      });
    });
});

app.put('/api/enrollments/:id', (req, res) => {
  const { student_id, course_id } = req.body;
  const { id } = req.params;

  db.run('UPDATE enrollments SET student_id = ?, course_id = ? WHERE id = ?',
    [student_id, course_id, id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error updating enrollment' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Enrollment not found' });
      }

      res.json({ message: 'Enrollment updated successfully' });
    });
});

app.delete('/api/enrollments/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM enrollments WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error deleting enrollment' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json({ message: 'Enrollment deleted successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
