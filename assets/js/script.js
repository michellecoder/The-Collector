// Change to your public marvel key.
var marvelApiKey = '0283a5777660227fbb1d7d136564ec70'

$('#character-input-form').submit(handleSubmit)

function handleSubmit(event){
    event.preventDefault()

    var characterName = $('#character-input').val()
    var requestUrl = `https://gateway.marvel.com:443/v1/public/characters?name=${characterName}&apikey=${marvelApiKey}`

    fetch(requestUrl)
    .then(function(response){
        // Basic error handling, needs refinement based on return code.
        if (response.status !== 200) {
            console.log('Error, check response for more info')
            console.log(response)
            return 
        }
        return response.json()
    })
    // Placeholder for next step in the chain.
    .then(function(data){
        console.log(data)
        // Triggers if the data recieved from request has no matching entries.
        if (data.data.count === 0) {
            console.log("No entires by that name, check spelling and try again.")
            return
        }
        renderCharBio(data);
        addSearchHistory(data.data.results[0].name);
       
        // getAmazonApi(characterName); // keep this commented out to preserve amazon api calls
        getAmazonTest(); // for testing delete before submitting
        return data
    })
}

// Function 'renderCharBio' -> This function will accept the data object from the fetch request & will pull out and display relevant bio data to the '#character-bio' div.
function renderCharBio(data) {

    // Declare element variable element to append to
    var charBioEl = $('#character-bio');

    // Declare relevant varaibles from object
    var charBioData = data.data.results[0];
    var charName = charBioData.name;
    var charBio = charBioData.description;
    var comicCount = charBioData.comics.available

    // Create template literal to append
    var charBioContent = $(`
        <!-- Hero Section to display character name -->
        <section class="hero is-medium is-danger">
        <div class="hero-body">
        <p class="title">
            ${charName}
        </p>
        <p class="subtitle">
            ${charBio}
        </p>
        </div>
    </section>

    `);

    // Append to page
    charBioEl.html(charBioContent);

};

// Function 'addSearchHistory' receives the character name from 'handleSubmit' function. If name is not a duplicate, it is added to local storage array 'marvelSearchHistory'.
function addSearchHistory(characterName){

    // Declare variables
    var searchArray = [];
    var storedSearches = JSON.parse(localStorage.getItem("marvelSearchHistory"));
    var storeChar = characterName;


    // If local storage is empty, populate with current search character
    if (storedSearches == null) {
        searchArray.push(storeChar);
        localStorage.setItem("marvelSearchHistory", JSON.stringify(searchArray));
    // If local storage is not empty, add current search character to end
    } else {
        searchArray = storedSearches;

        // Check for duplicates
        for (i = 0; i < searchArray.length; i++) {
            if (storeChar === searchArray[i]) {
                return;
            }
        }

        searchArray.push(storeChar);
        localStorage.setItem("marvelSearchHistory", JSON.stringify(searchArray));
    }

	// Render search history
	renderSearchHistory();
}

// Function 'renderSearchHistory' will display all previously stored searched to the page. 
function renderSearchHistory() {

	// Declare element to append to
	var searchHistoryEl = $('#search-history'); 

	// Retrieve stored search history from local storage
	var storedSearch = JSON.parse(localStorage.getItem("marvelSearchHistory"));

	// Reset container
	searchHistoryEl.html('');

	// Loop through search array
	for (i = 0; i < storedSearch.length; i++) {

		// Declare variable
		var displayChar = storedSearch[i];

		// Declare template literal to append
		var searchHistoryContent = $(`
		<button class="button is-danger is-outlined history-button" data-search-value="${displayChar}">${displayChar}</button>
		`);

		// Append to page
		searchHistoryEl.append(searchHistoryContent);
	
	}
}

// Function 'handleHistoryButton' will retrieve 'data-search-value' from a clicked history button, recall the API and pass data to 'renderCharBio'
function handleHistoryButton(event) {
    
    // Declare variable
    var clickValue = event.target.getAttribute("data-search-value");

    // Ensure button was clicked
    if (clickValue == 'container') {
        return;
    }

    // Fetch API
    var requestUrl = `https://gateway.marvel.com:443/v1/public/characters?name=${clickValue}&apikey=${marvelApiKey}`

    fetch(requestUrl)
    .then(function(response){
        
        return response.json()
    })

    .then(function(data){
        renderCharBio(data);
        // getAmazonApi(characterName); // keep this commented out to preserve amazon api calls
        getAmazonTest(); // for testing delete before submitting
        return data
    })
}

// Variable & listener for 'handleHistoryButton'
var historyButtonsEl = $('#search-history');
historyButtonsEl.click(handleHistoryButton);


// ===========================================================================================
// make an api call to the amazon price api 
// refrain from using this as much as possible and use the getAmazonTest() function
function getAmazonApi(str){
    str = str.trim();
    var api = "https://amazon-price1.p.rapidapi.com/search?marketplace=US&keywords=" + str;

    fetch(api, {
        "method": "GET",
        "headers": {
            "x-rapidapi-key": "06a5507a5emsh840791a7a3fd071p1e73d1jsn1809fb7fcf9b",
            "x-rapidapi-host": "amazon-price1.p.rapidapi.com"
        }
    })
    .then(function (response) {
        return response.json(); // add error handling
    })
    .then(function (data) {
        renderMerch(data);// pass the json data into the render function
    });
};

// uses the response.json or response2.json file in assets/js
// test search term is "Spider-Man" for response.json and "Hulk" for response2.json use this to test
// delete before submitting
function getAmazonTest() {
    var api = "./assets/js/response2.json";

    fetch(api)
     .then(function (response) {
        return response.json();
     })
     .then(function (data) {
        console.log(data); 
        renderMerch(data)
     });

};

// takes json data from getAmazonApi function and renders to the page
function renderMerch(data) {
    var container = $("#merchandiseArea"); // html element reference
    container.html(''); // clear container before appending more

    for (var i=0; i<data.length; i++) {
        var shopUrl = data[i].detailPageURL; // url to amazon store page
        var imageUrl = data[i].imageUrl; // thumbnail of product
        var price = data[i].price; // price of product
        var title = data[i].title; // title/name of product

        // if the title is very long, shortens it
        if (title.length > 35) {
            title = title.slice(0,35) + "...";
        };
        
        // render the title, price and thumbnail into the element
        container.append(`
            <div class="column is-one-fifth">
                <a href="${shopUrl}" target="_blank">
                    <article class="message is-dark">
                        <div class="message-header">
                            <p>${title}</p>
                        </div>
                        <div class="message-body">
                            <img src="${imageUrl}"><br>
                            <p>${price}</p>
                        </div>
                    </article>
                </a>
            </div>
        `);
    };
};
<<<<<<< HEAD
// ============================================================================
var availableTags = [
    "Spider-Man",
    "Hulk",
    "Iron Man",
  ];

$('#character-input').autocomplete({
    source: availableTags
})

var timeout;

$('#character-input').keypress(handleKeypress)

function handleKeypress() {
    if (timeout) {
        clearTimeout(timeout)
    }

    timeout = setTimeout(getCharacterList, 1000)
}

function getCharacterList() {
    var characterName = $('#character-input').val()
    var requestUrl = `https://gateway.marvel.com:443/v1/public/characters?nameStartsWith=${characterName}&apikey=${marvelApiKey}`

    fetch(requestUrl)
        .then(function(response){
            // Basic error handling, needs refinement based on return code.
            if (response.status !== 200) {
                console.log('Error, check response for more info')
                console.log(response)
                return 
            }
            return response.json()
        })

        .then(function(data){
            availableTags = []
            for (var i = 0; i < data.data.results.length; i++) {
                console.log(data.data.results[i].name)
                availableTags[i] = data.data.results[i].name
            }
            console.log(availableTags)
            return data
        })
}

=======


// ---------------- On Page Load ----------------------------- //

renderSearchHistory();
>>>>>>> ecfa7cf09da82bb72028ca12f61b37180d50a02c
