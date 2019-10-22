//Install express server
const express = require('express');
const path = require('path');

const app = express();

console.log('/dist/viajandopormexico/index.html');

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist'));

app.get('/*', function(req,res) {
    const index = path.join('/dist/viajandopormexico/index.html');
    res.sendFile(index);
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);