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
        // Triggers if the data recieved from request has no matching entries.
        if (data.data.count === 0) {
            console.log("No entries by that name, check spelling and try again.")
        }
        renderCharImage(data);
        renderCharBio(data);
        addSearchHistory(data.data.results[0].name);
        getAmazonApi(characterName);
        return data
    })

    $('#character-input').val('');
}

function renderCharImage(data) {
    // image link is data.data.results[0].thumbnail.path + '.' + data.data.results[0].thumbnail.extension
    
    var charImgEl = $('#character-img');
    var imgInfo = data.data.results[0].thumbnail;
    var imgUrl = imgInfo.path + '.' + imgInfo.extension;

    var charBioContent = $(`
        <!-- Display Character Image -->
        <img class="charImg" src=${imgUrl}>
    `);

    charImgEl.html(charBioContent);
}

// =============================================================================================================
// Autocomplete work starts here:

function autocomplete(inputElement) {
    // Autocomplete funciton takes in one value. An input element wrapped in jquery.
    // currentFocus is a global variable used to help with making the autocomplete keyboard accessible.
    var currentFocus;

    // Function will execute on any input in the supplied element.
    inputElement.on('input', function (event) {
        // Sets two scoped variables for later use then makes sure that any previous autocomplete list is closed.
        var autocompleteList;
        var currentInputValue = this.value;
        closeAllLists();

        // Checks if there is a value in the input field. If not fuction halts.
        if (!currentInputValue) {
            return false
        };

        currentFocus = -1;

        autocompleteList = $(`<div class="autocomplete-items" id="${this.id}-autocomplete-list" ></div>`);
        $(this).parent().append(autocompleteList);

        var autocompleteRequestUrl = `https://gateway.marvel.com:443/v1/public/characters?nameStartsWith=${currentInputValue}&apikey=${marvelApiKey}`

        // Request to Marvel API in order to get valid names starting with currentInputValue
        fetch(autocompleteRequestUrl)
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
            var arr = getValidNames(data)
            createAutocompleteItems(autocompleteList, currentInputValue, arr)
        })
    });

    function createAutocompleteItems(autocompleteList, currentInputValue, arr){
        var autocompleteItem;

        for (var i = 0; i < arr.length; i++) {
            // Extra check in case the api returns entries which do not begin with the correct substring
            if (arr[i].substr(0, currentInputValue.length).toUpperCase() == currentInputValue.toUpperCase()) {
                autocompleteItem = $(
                                    `
                                    <div>
                                        <strong>${arr[i].substr(0, currentInputValue.length)}</strong>${arr[i].substr(currentInputValue.length)}
                                        <input type="hidden" value="${arr[i]}"
                                    </div>
                                    `);
                
                // Click event populates input with clicked text value
                autocompleteItem.click(function (e) {
                    inputElement.val(this.getElementsByTagName("input")[0].value);
                    closeAllLists();
                });

                autocompleteList.append(autocompleteItem);
            }
        }
    }

    function getValidNames(apiData) {
        // Takes a Marvel API repsonse's json data and extracts only the names to an array.
        var resultsArray = apiData.data.results;
        var namesArray = [];
        for (var i = 0; i < resultsArray.length; i++){
            namesArray[i] = resultsArray[i].name
        }
        return namesArray;
    }

    inputElement.keydown(function (event) {
        var autocompleteList = document.getElementById(`${this.id}-autocomplete-list`);

        if (autocompleteList) {
            autocompleteList = autocompleteList.getElementsByTagName("div");
        }

        if (event.keyCode == 40) {
            // Triggers if down key is pressed; moves the focused area down the list.
            currentFocus++;
            addActive(autocompleteList);
        } else if (event.keyCode == 38) { //up
            // Triggers if up key is pressed; moves the focused area up the list.
            currentFocus--;
            addActive(autocompleteList);
        } else if (event.keyCode == 13) {
            // Triggers if enter key is pressed; moves the focused area down the list.
            event.preventDefault();
            if (currentFocus > -1) {
                if (autocompleteList) {
                    autocompleteList[currentFocus].click();}
            }
        }
    });

    function addActive(autocompleteItems) {
        // Helper function to add active class to autocomplete items
        if (!autocompleteItems) {
            return false
        };

        removeActive(autocompleteItems);

        // Handles behavior at beginning and end of list
        if (currentFocus >= autocompleteItems.length) {
            currentFocus = 0
        };
        if (currentFocus < 0) {
            currentFocus = (autocompleteItems.length - 1)
        };

        autocompleteItems[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(autocompleteItems) {
        for (var i = 0; i < autocompleteItems.length; i++) {
            autocompleteItems[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(htmlElement) {
        var autocompleteItems = $(".autocomplete-items");
        for (var i = 0; i < autocompleteItems.length; i++) {
            if (htmlElement != autocompleteItems[i] && htmlElement != inputElement) {
                autocompleteItems[i].remove();
            }
        }
    }

    document.addEventListener("click", function (event) {
        closeAllLists(event.target);
    });
}

autocomplete($("#character-input"))
// Autocomplete work ends here:
// =============================================================================================================

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

    if (storedSearch.length < 1) {

        clearHistoryEl.removeClass("visible-button");
        clearHistoryEl.addClass("hidden-button");

        return;

    } else {

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
        clearHistoryEl.removeClass("hidden-button");
        clearHistoryEl.addClass("visible-button");
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
        renderCharImage(data);
        renderCharBio(data);
        getAmazonApi(clickValue);
        return data
    })
}

// Variable & listener for 'handleHistoryButton'
var historyButtonsEl = $('#search-history');
historyButtonsEl.click(handleHistoryButton);


// ===========================================================================================
// make an api call to the amazon price api 
function getAmazonApi(str){
    str = str.trim();
    var api = "https://amazon-price1.p.rapidapi.com/search?marketplace=US&keywords=Marvel " + str;

    fetch(api, {
        "method": "GET",
        "headers": {
            "x-rapidapi-key": "06a5507a5emsh840791a7a3fd071p1e73d1jsn1809fb7fcf9b",
            "x-rapidapi-host": "amazon-price1.p.rapidapi.com"
        }
    })
    .then(function (response) {
        return response.json(); 
    })
    .then(function (data) {
        renderMerch(data);// pass the json data into the render function
    });
};

// takes json data from getAmazonApi function and renders to the page
function renderMerch(data) {
    
    for (var i=0; i<data.length; i++) {
        var shopUrl = data[i].detailPageURL; // url to amazon store page
        var imageUrl = data[i].imageUrl; // thumbnail of product
        var price = data[i].price; // price of product
        var title = data[i].title; // title/name of product
        var container = $('.item-' + (i+1)); // html element reference
        container.html(''); // clear container before appending more

        // if the title is very long, shortens it
        if (title.length > 35) {
            title = title.slice(0,35) + "...";
        };
        
        // render the title, price and thumbnail into the carousel elements
        container.append(`
            <div class="card is-clipped">
                <div class="card-image is-pulled-right">
                    <a href="${shopUrl}" target="_blank" class="">
                        <img src="${imageUrl}">
                    </a>
                </div>
                <div class="card-content">
                    <div class="content">
                        <p class="has-text-centered">
                            <span class="title is-4 is-capitalized ">
                                <a href="${shopUrl}" class="has-text-black " target="_blank">
                                    ${title}
                                </a>
                            </span>
                            <p class="has-text-centered">
                                ${price}
                            </p>                           
                        </p>
                    </div>
                </div>
            </div>
        `);
    };
};

//==================================================================
// Function 'clearSearchHistory' will empty the local storage array and reset the html to reflect no previous searches.
function clearSearchHistory() {

    // Declare empty array
    var searchArray =[];

    // Store empty array to local storage
    localStorage.setItem("marvelSearchHistory", JSON.stringify(searchArray));

    // Recall 'renderSearchHistory'
    renderSearchHistory();
}

// Listener & variables for 'clearSearchHistory' click event
var clearHistoryEl = $('#clear-history');
clearHistoryEl.click(clearSearchHistory);


// ---------------- On Page Load ----------------------------- //

renderSearchHistory();