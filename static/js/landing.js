//set to `click-me`
var button = d3.select("#click-me");
//property set to 'input-field'
var inputField = d3.select("#input-field");

function handleClick() {
    console.log("A button was clicked!");
    console.log(d3.event.target);
}
//handler function
button.on("click", handleClick);
button.on("click", function() {
    console.log("Hi, a button was clicked!");
    console.log(d3.event.target);
});

button.on("click", function() {
    d3.select(".giphy-me").html("<img src='https://gph.to/2Krfn0w' alt='giphy'>");
});

inputField.on("change", function() {
    var newText = d3.event.target.value;
    console.log(newText);
});