
let urlParams = new URLSearchParams(window.location.search);
let error = urlParams.get('error');

switch (error){
    case 'username_400':
        alert(`Username cannot contain spaces.`);
        break;
    case 'username_403':
        alert(`Username cannot contain special characters.`);
        break;
    case 'username_404':
        alert(`Username is not found => user do not exist. Are you sure you've written correct username?`);
        break;
    case 'username_409':
        alert(`Username is already taken. Please choose a different username.`);
    case 'username_413':
        alert(`Username is too long! (Max 20 characters)`);
        break;
    case 'password_404':
        alert(`Password is incorrect.`);
        break;
    case 'password_500':
        alert(`Trouble logging in, please try again later.`);
        break;
    case 'tides_400':
        alert(`Tide cannot contain spaces.`);
        break;
    case 'tides_403':
        alert(`Tide cannot contain special characters.`);
        break;
    case 'tides_409':
        alert(`Tide already exists. Please choose a different tide name.`);
        break;
    case 'tides_413':
        alert(`Tide is too long! (Max 12 characters)`);
        break;
    default:
        break;
}
history.replaceState({}, document.title, window.location.pathname);