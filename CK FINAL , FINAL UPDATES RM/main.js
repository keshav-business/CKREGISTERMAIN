const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  }
});
const upload = multer({ storage: storage });

const credentials = require('#json daalo');
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: 'https://www.googleapis.com/auth/spreadsheets',
});
const sheets = google.sheets({ version: 'v4', auth });

const spreadsheetId = '#spreadid';
const range = 'Sheet1';

async function appendData(data) {
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [data],
      },
    });
    console.log('Append successful:', response.data);
  } catch (err) {
    console.error('Append error:', err);
  }
}

app.post('/register', upload.single('payment-screenshot'), (req, res) => {
  const formType = req.body['form-type'];
  const data = [
    req.body.username,
    req.body.email,
    req.body.phonenumber,
    formType === 'general' ? '' : req.body['upi-id'],
    formType === 'general' ? '' : req.body['transaction-id'],
    req.file ? req.file.path : ''
  ]; 
  console.log('Data received from form:', data); // Log the data array

  appendData(data);

  res.send('Form submitted successfully!');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
