//set number of rounds of play
var maxrounds = 2;

//define the element containing the urns and the urns themselves
var urns = document.getElementById('urns');
var urnsLinks = urns.getElementsByTagName('a');

//create the marble
var marble = document.createElement('a');
marble.id = 'marble';
marble.href = '#';
marble.innerHTML = 'Next round';
marble.onclick = reset;

//set the round counter - this may need to live in server function
var counter = 1;

//declare variables that will change with each round
var roundData,
    epsilon,
    binary,
    baseodds,
    largeodds;
    
function setVars() {
    //update the round counter
    document.getElementById('counter').innerHTML = 'Round '+ counter + ' of '+ maxrounds;
    //declare the data object that will collect the info for this round
    roundData = {};
    
    //set epsilon, the difference in probabilities between the large and small urns
    epsilon = Math.ceil(Math.random()*3);
    
    // set classes for displaying small urn on left or right of screen
    binary = Math.round(Math.random());
    if (binary === 0) {
        urns.className = "small-right";
        epsilon = -epsilon;
    }
    else {
        urns.className = '';
    }
    
    //set probability that randomly selected marble in small urn is red - 0.1, 0.2, 0.3, 0.4 equally likely
    baseodds = (Math.ceil(Math.random()*4))/10;
    
    //set probability that randomly selected marble in large urn is red
    largeodds = ((baseodds*100)+epsilon)/100;
}

//determine if marble is red or not, based on a given probability. If red, assign css class to marble for display.
function isRed(probability) {
    var marblePull = Math.random();
    if (marblePull < probability) {
        document.getElementById('marble').className = 'red';
    }
    else {
        document.getElementById('marble').className = '';
    }
    if (counter+1 > maxrounds) {
        document.getElementById('marble').className += ' final';
    }
}

//add the marble to the screen
function showMarble() {
    if (counter+1 <= maxrounds) {
        if (!document.getElementById('marble')) {
            urns.parentNode.appendChild(marble);
        }
    }
    else {
        marble.innerHTML = maxrounds + ' rounds completed.';
        marble.onclick = '';
        marble.href= '/end';
        urns.parentNode.appendChild(marble);
    }
    document.getElementById('marble').focus();
}

function reset() {
    urns.parentNode.removeChild(document.getElementById('marble'));
    counter++;
    setVars();
    return false;
}

//create object for logging via node/redis
function logRoundData(urn) {
    roundData.session = counter;
    roundData.isLeft = binary; //0 = small on right, 1 = small on left
    //log which urn was clicked - more as an FYI to double-check suboptimal variable
    if (urn === 'small') {
        roundData.clickedSmall = 1;   
    }
    else {
        roundData.clickedSmall = 0;
    }
    roundData.baseodds = baseodds;
    roundData.epsilon = epsilon;
    //record if marble was red or not
    if (document.getElementById('marble').className === 'red') {
        roundData.isRed = 1;
    }
    else {
        roundData.isRed = 0;
    }
    //check to see if choice made was "suboptimal" (probability of red was higher in urn not selected)
    //positive epsilon means odds were better in large urn, negative means odds better in small urn
    if (epsilon > 0 && urn === 'small' || epsilon < 0 && urn === 'large') {
        roundData.suboptimal = 1;
    }
    else {
        roundData.suboptimal = 0;
    }
    console.log(JSON.stringify(roundData));
}

//set variables
setVars();

//bind onclick function to urns
for (var i=0; i<urnsLinks.length; i++) {
    urnsLinks[i].onclick = function() {
        showMarble();
        switch (this.id) {
            case 'small-urn':
                isRed(baseodds);
                logRoundData('small');
                break;
            case 'large-urn':
                isRed(largeodds);
                logRoundData('large');
                break;
        }
        return false;
    }
}

//bind node/redis functionality to links on click;
$('#urns a').click( function(e) {
    e.preventDefault();
    $.ajax({
            type: 'POST',
            data: JSON.stringify(roundData),
            contentType: 'application/json',
            url: '/endpoint',	
            success: function(data) {
                    console.log('success');
                    console.log(JSON.stringify(data));
            }
    });
});