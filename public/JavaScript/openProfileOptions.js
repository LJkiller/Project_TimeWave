/**
 * Method responsible of toggling the visibility of the account dropdown 
 * by changing its display property.
 */
function toggleDropdown() {
    let dropdown = document.getElementById("account-dropdown");

    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "block";
    }
}

/**
 * Method responsible of closing account dropdown when 
 * clicking outside its area.
 * 
 * @param {Event} event - The click event.
 */
window.onclick = function(event) {
    let dropdown = document.getElementById("account-dropdown");
    let switcher = document.getElementById("account-switcher");

    if (event.target !== dropdown && event.target !== switcher) {
        dropdown.style.display = "none";
    }
};
