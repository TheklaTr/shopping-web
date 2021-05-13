const template = document.getElementById('product-template');
const clonePlace = document.getElementById('products-container');

let cart = {};

const getJSONData = getJSON('/api/products').then((data) => {
    data.forEach((product) => {
        let clone = template.content.cloneNode(true);
        let item = clone.querySelector('.item-row');

        item.querySelector('.product-name').id = 'name-' + product._id;
        item.querySelector('.product-name').textContent = product.name;

        item.querySelector('.product-description').id =
            'description-' + product._id;
        item.querySelector('.product-description').textContent =
            product.description;

        item.querySelector('.product-price').id = 'price-' + product._id;
        item.querySelector('.product-price').textContent = product.price;

        item.querySelector('button').id = 'add-to-cart-' + product._id;

        clonePlace.appendChild(clone);

        // Add Event Listener to 'Add' button
        let url = '/api/products/' + product._id;
        document
            .getElementById('add-to-cart-' + product._id)
            .addEventListener('click', function () {
                addProductToCart(product, url, 0);
            });
    });
});

const addProductToCart = (product) => {
    // Add to sessionStorage
    var currentValue = sessionStorage.getItem(product._id)
        ? parseInt(sessionStorage.getItem(product._id))
        : 0;
    var number = currentValue + 1;
    sessionStorage.setItem(product._id, number);

    // Add to cart
    cart[product._id] = number;

    // console.log(JSON.parse(sessionStorage.getItem('myCart')));
    createNotification(
        `Added ${product.name} to cart!`,
        'notifications-container'
    );
};
