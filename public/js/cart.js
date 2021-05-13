const template = document.getElementById('cart-item-template');
const clonePlace = document.getElementById('cart-container');

const cart = {};

const getJSONData = getJSON('/api/products').then((data) => {
    // for each product
    data.forEach((product) => {
        // get the product IDs and amounts from sessionStorage
        let cartItems = getAllProductsFromCart();
        Object.keys(cartItems).forEach(cartItem => {
            if (product._id === cartItem) {
                console.log(cartItems[cartItem]);
                let clone = template.content.cloneNode(true);
                let item = clone.querySelector('.item-row');
                item.id = 'cart-' + product._id;

                item.querySelector('.product-name').id = 'name-' + product._id;
                item.querySelector('.product-name').textContent = product.name;

                item.querySelector('.product-price').id =
                    'price-' + product._id;
                item.querySelector('.product-price').textContent =
                    product.price;

                item.querySelector('.product-amount').id =
                    'amount-' + product._id;

                item.querySelector('.product-amount').textContent =
                    ' ' + parseInt(cartItems[cartItem]) + 'x';

                item.children[3].id = 'plus-' + product._id;

                item.children[4].id = 'minus-' + product._id;

                clonePlace.appendChild(clone);

                // Add Event Listener to 'Plus' button
                document
                    .getElementById('plus-' + product._id)
                    .addEventListener('click', function () {
                        getProductCountFromCart(product, item);
                    });

                // Add Event Listener to 'Minus' button
                document
                    .getElementById('minus-' + product._id)
                    .addEventListener('click', function () {
                        decreaseProductCount(product, item);
                    });
            }
        });
    });
});

document
    .getElementById('place-order-button')
    .addEventListener('click', function () {
        clearCart();
    });

const decreaseProductCount = (product, item) => {
    // Get the value number by counting button click
    var currentValue = sessionStorage.getItem(product._id)
        ? parseInt(sessionStorage.getItem(product._id))
        : 0;
    number = currentValue - 1;

    // Remove cart item when value is 0
    if (number < 1) {
        removeElement('cart-container', `cart-${product._id}`);
    }

    sessionStorage.setItem(product._id, number);

    item.querySelector('.product-amount').textContent = ' ' + number + 'x';
};

const getProductCountFromCart = (product, item) => {
    // Get the value number by counting button click
    var currentValue = sessionStorage.getItem(product._id)
        ? parseInt(sessionStorage.getItem(product._id))
        : 0;
    var number = currentValue + 1;
    sessionStorage.setItem(product._id, number);
    item.querySelector('.product-amount').textContent = ' ' + number + 'x';
};

const getAllProductsFromCart = () => {
    Object.keys(sessionStorage).forEach((i) => {
        cart[i] = sessionStorage.getItem(i);
    });
    return cart;
};

const clearCart = () => {
    sessionStorage.clear();
    // Remove all items in shopping cart
    clonePlace.querySelectorAll('.item-row').forEach((row) => row.remove());
    createNotification(
        `Successfully created an order!`,
        'notifications-container'
    );
};
