const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3001;

const upload = multer({ dest: 'uploads/' });

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Abhi@123',
  database: 'assessment_task'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});


app.use(express.static('public')); // For serving static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    mobile_no VARCHAR(15),
    email_id VARCHAR(255),
    password VARCHAR(255) DEFAULT '123',
    address TEXT,
    pan_no VARCHAR(20),
    aadhar_no VARCHAR(20),
    photo_path VARCHAR(255),
    certificate_path VARCHAR(255),
    uploaded_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive') DEFAULT 'active'
  );
`;

db.query(createTableQuery, (err) => {
  if (err) {
    console.error('Error creating table:', err);
    return;
  }
  console.log('Table created or already exists');
});

// Serve HTML form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/submit', upload.fields([{ name: 'photo' }, { name: 'certificate' }]), (req, res) => {
  const { name, mobile_no, email_id, address, pan_no, aadhar_no } = req.body;

  console.log("req.body>>>>>>>>>>>>>>>>>>>>",req.body);

  if (!req.files || !req.files.photo || !req.files.certificate) {
    console.log("if con>>>>>>>>>>>>>>>>>>>>");
    return res.status(400).send('Photo and certificate files are required');
  }

  const photoPath = req.files.photo[0].path;
  const certificatePath = req.files.certificate[0].path;

  console.log("photoPath>>>>>>>>>>>>>>>>>>>>",photoPath);
  console.log("certificatePath>>>>>>>>>>>>>>>>>>>>",certificatePath);

  const query = `
    INSERT INTO entries (name, mobile_no, email_id, address, pan_no, aadhar_no, photo_path, certificate_path)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  

  db.query(query, [name, mobile_no, email_id, address, pan_no, aadhar_no, photoPath, certificatePath], (err) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).send('Database error');
    }
    console.log('Data inserted successfully');
    res.redirect('/');
  });
});

app.get('/report', (req, res) => {
  db.query('SELECT * FROM entries', (err, results) => {
    if (err) {
      console.error('Error fetching report:', err);
      return res.status(500).send('Error fetching report');
    }
    console.log('Report data fetched:', results);
    res.json(results);
  });
});

app.post('/update-status', (req, res) => {
  const { id, status } = req.body;

  if (!id || !status) {
    return res.status(400).send('ID and status are required');
  }

  db.query('UPDATE entries SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) {
      console.error('Error updating status:', err);
      return res.status(500).send('Error updating status');
    }
    console.log(`Status updated for ID: ${id}`);
    res.send('Status updated');
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
