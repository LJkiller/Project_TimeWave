
let urlParams = new URLSearchParams(window.location.search);
let error = urlParams.get('error');

switch (error){
    case 'username_taken':
        alert(`Username is already taken. Please choose a different username.`);
        break;
    case 'username_403':
        alert(`Username cannot contain special characters.`);
        break;
    case 'username_404':
        alert(`Username is not found => user do not exist. Are you sure you've written correct username?`);
        break;
    case 'password_404':
        alert(`Password is incorrect.`);
        break;
    case 'password_500':
        alert(`Trouble logging in, please try again later.`);
        break;
    case 'tides_403':
        alert(`Tide cannot contain special characters.`);
        break;
    case 'tides_409':
        alert(`Tide already exists. Please choose a different tide name.`);
        break;
    default:
        break;
}
history.replaceState({}, document.title, window.location.pathname);