
let urlParams = new URLSearchParams(window.location.search);
let error = urlParams.get('error');

if (error === 'username_taken') {
    alert(`Username is already taken. Please choose a different username.`);
    history.replaceState({}, document.title, window.location.pathname);
} else if (error === 'username_404'){
    alert(`
        Username is not found => user do not exist. 
        Are you sure you've written correct username?`);
    history.replaceState({}, document.title, window.location.pathname);
} else if (error === 'password_404'){
    alert(`Password is incorrect.`);
    history.replaceState({}, document.title, window.location.pathname);
}