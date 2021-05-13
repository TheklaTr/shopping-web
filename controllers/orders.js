// const users = require('../setup/users.json');
const User = require('../models/user');
const Order = require('../models/order');
const { notFound, badRequest, sendJson, createdResource } = require('../utils/responseUtils');

const getAllOrders = async (response) => {
    const orders = await Order.find({});
    return sendJson(response, orders);
};

const getUserOrders = async (response, userId) => {
    const orders = await Order.find({ customerId: userId }).exec();

    if (!orders) {
        return notFound(response);
    } else {
        return sendJson(response, orders);
    }
};

const viewOrder = async (response, userId, role, orderId) => {
    const order = await Order.findById(orderId).exec();
    const userIdStr = userId.toString();

    if (!order || (role === 'customer' && order.customerId !== userIdStr)) {
        return notFound(response);
    }

    return sendJson(response, order);
};

const createNewOrder = async (orderData, customerId) => {
    orderData.customerId = customerId;
    const newOrder = new Order(orderData);
    return newOrder.save();
};

const createOrder = async (response, userId, orderData) => {
    if (!orderData.items) {
        return badRequest(response, 'Missing items');
    }

    if (!orderData.items.some((v) => v.quantity && v.product && v.product.price && v.product.name && v.product._id)) {
        return badRequest(response, 'Missing');
    }

    const newOrder = await createNewOrder(orderData, userId);

    return createdResource(response, newOrder);
};

module.exports = {
    getAllOrders,
    getUserOrders,
    viewOrder,
    createOrder,
};
