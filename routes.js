const responseUtils = require('./utils/responseUtils');
const { acceptsJson, isJson, parseBodyJson } = require('./utils/requestUtils');
const { renderPublic } = require('./utils/render');
const userController = require('./controllers/users.js');
const productController = require('./controllers/products.js');
const orderController = require('./controllers/orders.js');
/*const {
    emailInUse,
    getAllUsers,
    saveNewUser,
    validateUser,
    getUserById,
    updateUserRole,
    deleteUserById,
} = require('./utils/users');*/
const User = require('./models/user');
const Product = require('./models/product');
const Order = require('./models/order');
const { getCurrentUser } = require('./auth/auth');
// 9.1
const products = require('./products.json');

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
    '/api/register': ['POST'],
    '/api/users': ['GET', 'PUT', 'DELETE'],
    // 9.1
    '/api/products': ['GET', 'POST', 'PUT', 'DELETE'],
    '/api/orders': ['GET', 'POST', 'PUT', 'DELETE'],
};

/**
 * Send response to client options request.
 *
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response response
 */
const sendOptions = (filePath, response) => {
    if (filePath in allowedMethods) {
        response.writeHead(204, {
            'Access-Control-Allow-Methods': allowedMethods[filePath].join(','),
            'Access-Control-Allow-Headers': 'Content-Type,Accept',
            'Access-Control-Max-Age': '86400',
            'Access-Control-Expose-Headers': 'Content-Type,Accept',
        });
        return response.end();
    }

    return responseUtils.notFound(response);
};

/**
 * Does the url have an ID component as its last part? (e.g. /api/users/dsf7844e)
 *
 * @param {string} url filePath
 * @param {string} prefix prefix
 * @returns {boolean} regex.test(url)
 */
const matchIdRoute = (url, prefix) => {
    const idPattern = '[0-9a-z]{8,24}';
    const regex = new RegExp(`^(/api)?/${prefix}/${idPattern}$`);
    return regex.test(url);
};

/**
 * Does the URL match /api/users/{id}
 *
 * @param {string} url filePath
 * @returns {boolean} matchIdRoute(url, 'users')
 */
const matchUserId = (url, link) => {
    return matchIdRoute(url, link);
};

const handleRequest = async (request, response) => {
    const { url, method, headers } = request;
    const filePath = new URL(url, `http://${headers.host}`).pathname;
    const filePath_ = filePath.split('/');
    if (filePath_.length > 3) {
        filePath_.pop();
    }
    const filePathURI = filePath_.join('/');

    // serve static files from public/ and return immediately
    if (method.toUpperCase() === 'GET' && !filePath.startsWith('/api')) {
        const fileName = filePath === '/' || filePath === '' ? 'index.html' : filePath;
        return renderPublic(fileName, response);
    }

    // Default to 404 Not Found if unknown url
    if (!(filePathURI in allowedMethods)) return responseUtils.notFound(response);

    // See: http://restcookbook.com/HTTP%20Methods/options/
    if (method.toUpperCase() === 'OPTIONS') return sendOptions(filePath, response);

    // Check for allowable methods
    if (!allowedMethods[filePathURI].includes(method.toUpperCase())) {
        return responseUtils.methodNotAllowed(response);
    }

    // the url is /api/users/{id}
    if (matchUserId(filePath, 'users')) {
        // handle authorization headers
        const auth = request.headers['authorization'];
        if (!auth) {
            return responseUtils.basicAuthChallenge(response);
        }
        // Require a correct accept header (require 'application/json' or '*/*')
        if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
        }
        // handle user id and it's existance
        const id = filePath.split('/')[3];
        const user = await User.findById(id).exec();
        if (!user) {
            return responseUtils.notFound(response);
        }
        // handle current user permissions
        const current = await getCurrentUser(request);
        if (current && current['role'] === 'admin') {
            if (method.toUpperCase() === 'GET') {
                return userController.viewUser(response, id, current);
                // update a user
            } else if (method.toUpperCase() === 'PUT') {
                // check if user is allowed with role
                const requestBody = await parseBodyJson(request);
                const role = requestBody['role'];
                if (!role || (role !== 'customer' && role !== 'admin')) {
                    return responseUtils.badRequest(response, 'Role missing or invalid');
                } else {
                    return userController.updateUser(response, id, current, requestBody);
                }
                // delete user
            } else if (method.toUpperCase() === 'DELETE') {
                return userController.deleteUser(response, id, current);
            }
            // handle forbidden and non auth
        } else if (current && current['role'] === 'customer') {
            return responseUtils.forbidden(response);
        } else {
            return responseUtils.basicAuthChallenge(response);
        }
    }

    // the url is /api/products/{id}
    if (matchUserId(filePath, 'products')) {
        // handle authorization headers
        const auth = request.headers['authorization'];
        if (!auth) {
            return responseUtils.basicAuthChallenge(response);
        }
        // Require a correct accept header (require 'application/json' or '*/*')
        if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
        }
        // handle product id and it's existance
        const id = filePath.split('/')[3];
        const prod = await Product.findById(id).exec();
        if (!prod) {
            return responseUtils.notFound(response);
        }
        // handle current user permissions
        const current = await getCurrentUser(request);
        if (current && (current['role'] === 'customer' || current['role'] === 'admin')) {
            if (method.toUpperCase() === 'GET') {
                return productController.viewProduct(response, id);
            }
        }
        if (current && current['role'] === 'customer') {
            if (method.toUpperCase() === 'POST' || method.toUpperCase() === 'DELETE' || method.toUpperCase() === 'PUT') {
                return responseUtils.forbidden(response);
            }
        }
        if (current && current['role'] === 'admin') {
            if (method.toUpperCase() === 'PUT') {
                // check if user is allowed with role
                const requestBody = await parseBodyJson(request);
                return productController.updateProduct(response, id, requestBody);
                // delete user
            } else if (method.toUpperCase() === 'DELETE') {
                return productController.deleteProduct(response, id);
            }
        } else {
            return responseUtils.basicAuthChallenge(response);
        }
    }

    // the url is /api/orders/{id}
    if (matchUserId(filePath, 'orders')) {
        // handle product id and it's existance
        const auth = request.headers['authorization'];
        if (!auth) {
            return responseUtils.basicAuthChallenge(response);
        }
        // Require a correct accept header (require 'application/json' or '*/*')
        if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
        }

        const orderId = filePath.split('/')[3];
        // TODO::::
        const current = await getCurrentUser(request);
        if (!current) {
            return responseUtils.basicAuthChallenge(response);
        }

        const userId = current._id;
        const role = current.role;

        if (method.toUpperCase() === 'GET') {
            return orderController.viewOrder(response, userId, role, orderId);
        }
    }

    // register new user using POST
    if (filePath === '/api/register' && method.toUpperCase() === 'POST') {
        // Require a correct accept header (require 'application/json' or '*/*')
        if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
        }
        // Fail if not a JSON request
        if (!isJson(request)) {
            return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
        }
        const requestBody = await parseBodyJson(request);
        return userController.registerUser(response, requestBody);
    }

    // GET all users
    if (filePath === '/api/users' && method.toUpperCase() === 'GET') {
        // Require a correct accept header (require 'application/json' or '*/*')
        // here check acceptJSON first!? because LOGIC ._.
        if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
        }
        // handle authorization headers
        const auth = request.headers['authorization'];
        if (!auth) {
            return responseUtils.basicAuthChallenge(response);
        }
        // TODO: 8.3 Return all users as JSON
        const current = await getCurrentUser(request);
        if (current && current['role'] === 'admin') {
            return userController.getAllUsers(response);
        } else if (current && current['role'] === 'customer') {
            return responseUtils.forbidden(response);
        } else {
            return responseUtils.basicAuthChallenge(response);
        }

        // TODO: 8.4 Add authentication (only allowed to users with role "admin")
        // throw new Error('Not Implemented');
    }

    // 9.1 GET all products
    if (filePath === '/api/products' && method.toUpperCase() === 'GET') {
        // Require a correct accept header (require 'application/json' or '*/*')
        // here check acceptJSON first!? because LOGIC ._.
        if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
        }
        // handle authorization headers
        const auth = request.headers['authorization'];
        if (!auth) {
            return responseUtils.basicAuthChallenge(response);
        }
        const current = await getCurrentUser(request);
        if (current && (current['role'] === 'admin' || current['role'] === 'customer')) {
            return productController.getAllProducts(response);
        } else {
            return responseUtils.basicAuthChallenge(response);
        }
    }
    // 9.1 POST new product
    if (filePath === '/api/products' && method.toUpperCase() === 'POST') {
        // Require a correct accept header (require 'application/json' or '*/*')
        // here check acceptJSON first!? because LOGIC ._.
        if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
        }
        // Fail if not a JSON request
        if (!isJson(request)) {
            return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
        }
        // handle authorization headers
        const auth = request.headers['authorization'];
        if (!auth) {
            return responseUtils.basicAuthChallenge(response);
        }
        const current = await getCurrentUser(request);
        if (current && current['role'] === 'admin') {
            const requestBody = await parseBodyJson(request);
            return productController.createProduct(response, requestBody);
        } else if (current && current['role'] === 'customer') {
            return responseUtils.forbidden(response);
        } else {
            return responseUtils.basicAuthChallenge(response);
        }
    }
    // get all orders
    if (filePath === '/api/orders' && method.toUpperCase() === 'GET') {
        // Require a correct accept header (require 'application/json' or '*/*')
        // here check acceptJSON first!? because LOGIC ._.
        if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
        }
        // // Fail if not a JSON request
        // if (!isJson(request)) {
        //     return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
        // }
        // handle authorization headers
        const auth = request.headers['authorization'];
        if (!auth) {
            return responseUtils.basicAuthChallenge(response);
        }

        const current = await getCurrentUser(request);
        if (!current) {
            return responseUtils.basicAuthChallenge(response);
        }

        if (current['role'] === 'admin') {
            return orderController.getAllOrders(response);
        }

        const userId = current._id;
        return orderController.getUserOrders(response, userId);
    }
    // POST new order
    if (filePath === '/api/orders' && method.toUpperCase() === 'POST') {
        // Require a correct accept header (require 'application/json' or '*/*')
        // here check acceptJSON first!? because LOGIC ._.
        if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
        }
        // Fail if not a JSON request
        if (!isJson(request)) {
            return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
        }
        // handle authorization headers
        const auth = request.headers['authorization'];
        if (!auth) {
            return responseUtils.basicAuthChallenge(response);
        }
        const requestBody = await parseBodyJson(request);
        const current = await getCurrentUser(request);

        if (!current) {
            return responseUtils.basicAuthChallenge(response);
        }

        if (current['role'] === 'admin') {
            return responseUtils.forbidden(response);
        }

        const userId = current._id;
        return orderController.createOrder(response, userId, requestBody);
    }
};

module.exports = {
    handleRequest,
};
