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
        }
        renderCharBio(data);
        addSearchHistory(data.data.results[0].name);
       
        // getAmazonApi(characterName); // keep this commented out to preserve amazon api calls
        getAmazonTest(); // for testing delete before submitting
        return data
    })
}

// =============================================================================================================
// Autocomplete work starts here:

function autocomplete(inputElement) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inputElement.on('input', function (e) {
        var a, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "-autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);

        var autocompleteRequestUrl = `https://gateway.marvel.com:443/v1/public/characters?nameStartsWith=${val}&apikey=${marvelApiKey}`
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
            var arr =getValidNames(data)
            createAutocompleteItems(a, val, arr)
        })
    });

    function createAutocompleteItems(a, val, arr){
        var b;
        /*for each item in the array...*/
        for (var i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    inputElement.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    }

    function getValidNames(apiData) {
        var resultsArray = apiData.data.results;
        var namesArray = [];
        for (var i = 0; i < resultsArray.length; i++){
            namesArray[i] = resultsArray[i].name
        }
        console.log(namesArray)
        return namesArray;
    }

    /*execute a function presses a key on the keyboard:*/
    inputElement.keydown(function (e) {
        var x = document.getElementById(this.id + "-autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inputElement) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
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


// ---------------- On Page Load ----------------------------- //

renderSearchHistory();