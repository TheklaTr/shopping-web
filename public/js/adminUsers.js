/**
 * TODO: 8.3 List all users (use <template id="user-template"> in users.html)
 *       - Each user should be put inside a clone of the template fragment
 *       - Each individual user HTML should look like this
 *         (notice the id attributes and values, replace "{userId}" with the actual user id)
 *
 *         <div class="item-row" id="user-{userId}">
 *           <h3 class="user-name" id="name-{userId}">Admin</h3>
 *           <p class="user-email" id="email-{userId}">admin@email.com</p>
 *           <p class="user-role" id="role-{userId}">admin</p>
 *           <button class="modify-button" id="modify-{userId}">Modify</button>
 *           <button class="delete-button" id="delete-{userId}">Delete</button>
 *         </div>
 *
 *       - Each cloned template fragment should be appended to <div id="users-container">
 *       - Use getJSON() function from utils.js to fetch user data from server
 */
const template = document.getElementById('user-template');
const clonePlace = document.getElementById('users-container');
const modifyTemplate = document.getElementById('form-template');

const getJSONData = getJSON('/api/users').then((data) => {
    console.log('Success!');
    data.forEach((user) => {
        // Clone the template
        let clone = template.content.cloneNode(true);

        // Find the element inside need to be cloned
        let item = clone.querySelector('.item-row');

        // Modify the values
        item.id = 'user-' + user._id;

        item.querySelector('.user-name').id = 'name-' + user._id;
        item.querySelector('.user-name').textContent = user.name;

        item.querySelector('.user-email').id = 'email-' + user._id;
        item.querySelector('.user-email').textContent = user.email;

        item.querySelector('.user-role').id = 'role-' + user._id;
        item.querySelector('.user-role').textContent = user.role;

        item.querySelector('.modify-button').id = 'modify-' + user._id;

        item.querySelector('.delete-button').id = 'delete-' + user._id;

        clonePlace.appendChild(clone);

        // add eventlisteners to buttons
        let url = '/api/users/' + user._id;
        document
            .getElementById('modify-' + user._id)
            .addEventListener('click', function () {
                showModForm(user, url);
            });
        document
            .getElementById('delete-' + user._id)
            .addEventListener('click', function () {
                sendDeleteRequest(user, url);
            });
    });
});

const sendDeleteRequest = (user, url) => {
    deleteResourse(url);
    remModForm();
    // delete user from document
    removeElement('users-container', `user-${user._id}`);
    createNotification(`Deleted user ${user.name}`, 'notifications-container');
};

const showModForm = (user, url) => {
    remModForm();
    let clone = modifyTemplate.content.cloneNode(true);
    let id = event.target.id.split('-')[1];
    clone.querySelector('#id-input').value = user._id;
    clone.querySelector('#name-input').value = user.name;
    clone.querySelector('#email-input').value = user.email;
    let div = document.getElementById('modify-user');
    div.appendChild(clone);

    let butt = document.getElementById('edit-user-form');
    if (butt) {
        butt.addEventListener('submit', function () {
            let role = butt.querySelector('#role-input').value;
            sendUpdateRequest(user, url, role);
        });
    } else {
        console.log('ok');
    }
};

const remModForm = () => {
    removeElement('modify-user', 'edit-user-form');
};

const sendUpdateRequest = (user, url, role) => {
    // update user
    let data = { role: role };
    postOrPutJSON(url, 'PUT', data);
    let change = document.getElementById(`role-${user._id}`);
    change.textContent = role;
    remModForm();
    createNotification(`Updated user ${user.name}`, 'notifications-container');
};

/*
 *
 * TODO: 8.5 Updating/modifying and deleting existing users
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 *       - Use deleteResource() function from utils.js to delete users from server
 *       - Clicking "Delete" button of a user will delete the user and update the listing accordingly
 *       - Clicking "Modify" button of a user will use <template id="form-template"> to
 *         show an editing form populated with the values of the selected user
 *       - The edit form should appear inside <div id="modify-user">
 *       - After successful edit of user the form should be removed and the listing updated accordingly
 *       - You can use removeElement() from utils.js to remove the form.
 *       - Remove edit form from the DOM after successful edit or replace it with a new form when another
 *         user's "Modify" button is clicked. There should never be more than one form visible at any time.
 *         (Notice that the edit form has an id "edit-user-form" which should be unique in the DOM at all times.)
 *       - Also remove the edit form when a user is deleted regardless of which user is deleted.
 *       - Modifying a user successfully should show a notification message "Updated user {User Name}"
 *       - Deleting a user successfully should show a notification message "Deleted user {User Name}"
 *       - Use createNotification() function from utils.js to create notifications
 */
