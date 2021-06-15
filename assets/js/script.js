// The 'apiKey' can be changed to whatever API key we want to use for this project. Just need to update the variable name in the 'getCharBio' function. The variable 'characterName' can be deleted - just need to update the 'characterName' variable in the 'getCharBio' function to whatever the search function passes.
var apiKey = '86c032a44e705743b4136c5508731395'
var characterName = 'hulk';

// Function 'getCharData' -> This function will take the character name from the searchbar, call the character API in order to return results for that character. Results are passed as an object to the 'renderCharBio' function. This function requires a variable 'apiKey' in order to authenticate and a variable 'characterName' in order to call a character.
function getCharBio() {

    // Declare variable for request URL
    var getCharApi = 'https://gateway.marvel.com:443/v1/public/characters?name=' + characterName + '&apikey=' + apiKey;

    // Fetch request URL
    fetch(getCharApi)

        .then(function(response) {
            return response.json();
        })

        .then(function(data) {
            var charBioData = data.data.results[0];
            console.log(charBioData);
            renderCharBio(charBioData);
        })

};

// Function 'renderCharBio' -> This function will receive the rusults object from 'getCharData' it will pull out and display relevant bio data to the '#character-bio' div.
function renderCharBio(obj) {

    // Declare element variable element to append to
    var charBioEl = $('#character-bio');

    // Declare relevant varaibles from object
    var charName = obj.name;
    var charBio = obj.description;

    // Create template literal to append
    var charBioContent = $(`
    <h2>
    ${charName}
    </h2>
    <p>
    ${charBio}
    </p>
    `);

    // Append to page
    charBioEl.append(charBioContent);

};


// Run for testing purposes - may want to delete.
getCharBio();




