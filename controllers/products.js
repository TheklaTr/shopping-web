//const products = require('../products.json');
const Product = require('../models/product');
const { notFound, badRequest, sendJson, createdResource } = require('../utils/responseUtils');
/**
 * Send all products as JSON
 *
 * @param {http.ServerResponse} response getAllProducts
 */

const getAllProducts = async (response) => {
    const products = await Product.find({});
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(products));
};

const viewProduct = async (response, prodId) => {
    const existingProduct = await Product.findById(prodId).exec();

    if (!existingProduct) {
        return notFound(response);
    } else {
        return sendJson(response, existingProduct);
    }
};

const updateProduct = async (response, prodId, prodData) => {
    const existingProduct = await Product.findById(prodId).exec();
    if (!existingProduct) {
        return notFound(response);
    }
    const updatePrice = prodData.price;
    const updateName = prodData.name;
    const updateImage = prodData.image;
    const updateDesc = prodData.description;
    if (updatePrice === null && updateName === null && updateDesc === null && updateImage === null) {
        return badRequest(response, 'No data provided');
    }
    if (isNaN(updatePrice) || updatePrice <= 0) {
        return badRequest(response, 'Price must be a valid positive number');
    }
    if (updateName === '') {
        return badRequest(response, 'Name must not be empty');
    }
    try {
        if (updatePrice) {
            existingProduct.price = updatePrice;
        }
        if (updateName) {
            existingProduct.name = updateName;
        }
        if (updateImage) {
            existingProduct.image = updateImage;
        }
        if (updateDesc) {
            existingProduct.description = updateDesc;
        }
        existingProduct.save();
        return sendJson(response, existingProduct);
    } catch (err) {
        return badRequest(response);
    }
};

const deleteProduct = async (response, prodId) => {
    const deleteProduct = await Product.findById(prodId).exec();
    if (deleteProduct === null) {
        return notFound(response);
    } else {
        try {
            const deletedProduct = await deleteProduct.deleteOne({ _id: prodId });
            return sendJson(response, deletedProduct);
        } catch (err) {
            console.log(err);
            return badRequest(response);
        }
    }
};

const createProduct = async (response, prodData) => {
    const newPrice = prodData.price;
    const newName = prodData.name;
    const newImage = prodData.image;
    const newDesc = prodData.description;

    if (newPrice === undefined || newName === undefined) {
        return badRequest(response, 'Missing price, name');
    }
    const newProduct = new Product(prodData);
    newProduct.save();
    return createdResource(response, newProduct);
};

module.exports = {
    getAllProducts,
    createProduct,
    deleteProduct,
    viewProduct,
    updateProduct,
};
