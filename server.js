const express = require('express');
const bodyParser = require('body-parser');
const { sendMessage } = require('./bot');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

app.post('/submit', (req, res) => {
  const { opinion, type } = req.body;
  if (opinion) {
    sendMessage(opinion, type);
    res.status(200).send('Message sent to Discord!');
  } else {
    res.status(400).send('No opinion provided.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
