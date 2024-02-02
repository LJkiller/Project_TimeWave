
const dropdown = document.getElementById('account-dropdown');
const toggler = document.getElementById('account-toggler');
const profilePicture = document.getElementById('nav-profile-picture');
const username = document.getElementById('nav-username');

/**
 * Method responsible for toggling the visibility of the account dropdown 
 * by changing its display property.
 */
function toggleDropdown() {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

/**
 * Method responsible for closing the account dropdown when 
 * clicking outside its area.
 * 
 * @param {Event} event - The click event.
 */
window.onclick = function(event) {
    // Check if the clicked target is not inside the dropdown or related elements
    if (![dropdown, toggler, profilePicture, username].includes(event.target)) {
        dropdown.style.display = 'none';
    }
};
