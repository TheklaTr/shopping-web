const chai = require('chai');
const expect = chai.expect;
const { createResponse } = require('node-mocks-http');
const { viewProduct,
    updateProduct,
    deleteProduct} = require('../../controllers/products');
const Product = require('../../models/product');

// Get products (create copies for test isolation)
const originalProducts = require('../../setup/products.json').map(product => ({ ...product }));

describe('Coverage tests', () => {
  let products;

  beforeEach(async () => {
    // reset database
    await Product.deleteMany({});
    await Product.create(originalProducts);
    const foundProducts = await Product.find({});
    products = foundProducts.map(product => JSON.parse(JSON.stringify(product)));
    randomProd = products[0]._id;
  });

  describe('viewProduct()', () => {
    it('should respond with notFound', async () => {
      const unknownID = '41224d776a326fb40f000001';
      const response = createResponse();
      await viewProduct(response,unknownID);
      expect(response.statusCode).to.equal(404);
    });
  });

  describe('updateProduct()', () => {
    it('should respond with notFound', async () => {
      const unknownID = '41224d776a326fb40f000001';
      const response = createResponse();
      await updateProduct(response,unknownID);
      expect(response.statusCode).to.equal(404);
    });
    it('should respond with badRequest with bad Data', async () => {
        const response = createResponse();
        const badData = {price: null, name: null, description: null, image: null};
        const prodID = randomProd;
        await updateProduct(response,prodID,badData);
        expect(response.statusCode).to.equal(400); 
      });
    it('should respond with badRequest with empty name', async () => {
        const response = createResponse();
        const badData = {price: 20, name: ''};
        const prodID = randomProd;
        await updateProduct(response,prodID,badData);
        expect(response.statusCode).to.equal(400); 
    });
  });
  describe('deleteProduct()', () => {
    it('should respond with notFound', async () => {
      const unknownID = '41224d776a326fb40f000001';
      const response = createResponse();
      await deleteProduct(response,unknownID);
      expect(response.statusCode).to.equal(404);
    });
  });
});
