/**
 * TODO: 8.3 Register new user
 *       - Handle registration form submission
 *       - Prevent registration when password and passwordConfirmation do not match
 *       - Use createNotification() function from utils.js to show user messages of
 *       - error conditions and successful registration
 *       - Reset the form back to empty after successful registration
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 */

const form = document.getElementById('register-form');
const name = document.getElementById('name');
const email = document.getElementById('email');
const password = document.getElementById('password');
const passwordConfirmation = document.getElementById('passwordConfirmation');
const btnRegister = document.getElementById('btnRegister');

btnRegister.addEventListener('click', function (event) {
    event.preventDefault();

    if (password.textContent !== passwordConfirmation.textContent) {
        createNotification('not matched', 'register-form', true);
    }

    let user = {
        name: name.value,
        password: password.value,
        email: email.value,
    };

    postOrPutJSON('/api/register', 'POST', user).then((response) =>
        form.reset()
    );
});
