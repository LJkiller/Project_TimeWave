/**
 * Method responsible of toggling the visibility of the account dropdown 
 * by changing its display property.
 */
function toggleDropdown() {
    let dropdown = document.getElementById('account-dropdown');

    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
    } else {
        dropdown.style.display = 'block';
    }
}

/**
 * Method responsible of closing account dropdown when 
 * clicking outside its area.
 * 
 * @param {Event} event - The click event.
 */
window.onclick = function(event) {
    let dropdown = document.getElementById('account-dropdown');
    let toggler = document.getElementById('account-toggler');
    let profilePicture = document.getElementById('nav-profile-picture');
    let username = document.getElementById('nav-username');

    if (event.target !== dropdown 
        && event.target !== toggler
        && event.target !== profilePicture 
        && event.target !== username) {
            dropdown.style.display = 'none';
    }
};
