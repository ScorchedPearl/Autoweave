const express = require('express');
const app = express();
app.get('/', (req, res) => res.json({ number: Math.floor(Math.random() * 1000000) + 1 }));
app.listen(5301, () => console.log('Server running on port 5301'));
