var express = require('express');
var app = express();

app.set('views', __dirname);
app.engine('html', require('ejs').renderFile);

//var text;
//function setVars() {
    // set classes for displaying small urn on left or right of screen
    /*var start = Math.round(Math.random());
    if (start === 0) {
        text = 'Test fuck shit';
    }
    else {
        text = 'Rainbows!';
    }
}*/

app.get('/', function(req, res) {
    //setVars();
    res.render('test.html');
});

app.listen(3000);
console.log('running');