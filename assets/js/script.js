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
        return data
    })
}