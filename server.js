//Install express server
const express = require('express');
const path = require('path');

const app = express();

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/viajando-por-mexico'));

app.get('/*', function(req,res) {
    const index = path.join(__dirname + '/dist/viajando-por-mexico/index.html');
    console.log(index);
    res.sendFile(index);
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);