
var marvelApiKey = '86c032a44e705743b4136c5508731395'
var characterName = 'hulk';


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
        renderCharBio(data)
        return data
    })


// Function 'renderCharBio' -> This function will accept the data object from the fetch request & will pull out and display relevant bio data to the '#character-bio' div.
function renderCharBio(data) {

    // Declare element variable element to append to
    var charBioEl = $('#character-bio');

    // Declare relevant varaibles from object
    var charBioData = data.data.results[0];
    var charName = charBioData.name;
    var charBio = charBioData.description;
    var comicCount = charBioData.comics.available
    console.log(comicCount);

    // Create template literal to append
    var charBioContent = $(`
        <!-- Hero Section to display character name -->
        <section class="hero is-danger">
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
    charBioEl.append(charBioContent);

};