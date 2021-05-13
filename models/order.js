const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    // TODO: 9.4 Implement this
    customerId: {
        type: String,
        required: true,
    },

    items: {
        type: [
            {
                product: {
                    name: {
                        type: String,
                        required: true,
                    },
                    price: {
                        type: Number,
                        required: true,
                    },

                    description: {
                        type: String,
                    },
                },
                quantity: {
                    required: true,
                    type: Number,
                    minimum: 1,
                },
            },
        ],
        required: true,
    },
});

orderSchema.set('toJSON', { virtuals: false, versionKey: false });

const Order = new mongoose.model('Order', orderSchema);
module.exports = Order;
