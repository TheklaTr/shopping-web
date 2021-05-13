# Group

Member1: Joona Jokivuori, joonaeemil.jokivuori@tuni.fi, H268451
responsible for: 50 % of the assignment tasks

Member2: Hien Tran, hien.t.tran@tuni.fi, H299096
responsible for: 50 % of the assignment tasks

# WebDev1 coursework assignment

A web shop with vanilla HTML, CSS. The webshop includes functionality to have logged in users with the role admin or customer, and non-logged in users. Admins, customers and non-logged in users, have different features that they can use.
A non-logged user can only register a new account.
A customer, can view all or single products, create and get orders for themselves.
Admins can do much more such as edit and delete products and users, get all users, and create new products.

Throughout the assignment, the tasks include using Node.js to create the backend server functionality and vanilla Javascript and HTML to create the frontend. The frontend and backend communicate through an API. The backend communicates to a database to get all the data such as orders, products, and users.

### The project structure

```
.
├── index.js                           --> create server and connect DB - tarting point of the backend application
├── package.json                       --> store all npm packages
├── package-lock.json
├── nodemon.json
├── routes.js                          --> responsible for deciding what should be done based on the request
├── auth                               --> "Authorization" check file
│   └──  auth.js                       --> check user based on the "Authorization" request headers
├── controllers                        --> control the application flow and read and update the database with models
│   ├── orders.js                      --> controller for order
│   ├── products.js                    --> controller for product
│   └── users.js                       --> controller for user
├── models                             --> Models files
│   ├── db.js                          --> connect - disconnect to database
│   ├── order.js                       --> create Order Model
│   ├── product.js                     --> create Product Model
│   └── user.js                        --> create User Model
├── public/                            --> All static files that are accessible from the browser
│   ├── img
│   ├── css/                           --> Styling files
|   │   └── styles.css                 --> styles for the website
│
│   ├── js/
│   │   ├── adminUsers.js              --> List all users from Admin DOM manipulation
│   │   ├── cart.js                    --> List all products and manage products in orders DOM manipulation
│   │   ├── products.js                --> List all products from database DOM manipulation
│   │   ├── register.js                --> Implement user registration (handle form submitting) DOM manipulation
│   │   └── utils.js                   --> Helper functions for different purposes, used by other modules
│   ├── 404.html                       --> Page not found
│   ├── cart.html                      --> List all products and manage products in orders
│   ├── index.html                     --> Front page
│   ├── products.html                  --> List all products from database
│   ├── register.html                  --> Implement user registration (handle form submitting)
│   └── users.html                     --> List all users from Admin
├── setup                              -->
│   ├── create-orders.js               --> create orders from products.json and user.json based on Order model
│   ├── products.json
│   ├── reset-db.js                    --> reset database
│   └── user.json
├── utils                              --> Helper functions for different purposes, used by other modules
│   ├── render.js                      --> render files and get Content-Type
│   ├── requestUtils.js                --> check and parse the request body to JSON
│   └── responseUtils.js               --> HTTP response status codes
└── test                               --> test files
│   ├── auth                           --> test for "Authorization" request headers
│   ├── controllers                    --> test for controllers
│   ├── models                         --> test for models
│   ├── own_test                       --> test for coverage
│   ├── utils/
│   │   ├── responseUtils.test.js      --> test for responseUtils.test.js
│   │   ├── requestUtils.test.js       --> test for requestUtils.js
│   │   └── users.test.js              --> test for users.js
│   ├── routes.test.js                 --> test for routes.js
│   ├── setup.test.js                  --> test for setup.js
└── └── ui.test.js                     --> test for UI


```

## The architecture

The architecture of the webshop utilizes the MVC pattern. The first of these is the model (M). In our webshop we use Mongoose Schema as models to be able to validate and easily get our data into a valid format.
The view (V) part of the webshop is the frontend part of the webshop, here is where we return the actual HTML pages to the user.
In addition to this we have a routes.js file which acts as our API and calls the appropriate controller functions required to do what the user requested.
The final part, controller (C) is the files containing the 'main' backend, here we do the actual work that the user requested.
For example, if the user clicks on a product, the View handles showing the data from the Model to the user, and sending the link that the user using the requested (lets say it is /api/product/ID1 [not a real ID]), then this link gets sent to the routes.js file where the controller function for getting a specific product with the ID: 'ID1' are called, and this controller function utilizes our Model, specifically the Products model, to find a product, if any, with the appropriate ID, and the data gets returned back through all these functions back to the View, which then shows the correct data on the webpage.

The handling of sending the link to the routes.js and the returned data back, is done using the REST style. The original link is known as a request, and the returned data is sent through a response. This allows the client and the server to communicate smoothly.

![Web Pages Navigation](/public/img/wpn.png)
Figure1. Web Pages Navigation

## Tests and documentation

The links to our custom issues on the GitLab are [GitLab Issues](https://course-gitlab.tuni.fi/webdev1-2020-2021/webdev1-group-67/-/issues). The appropriate Mocha test and test files are not in the latest commit, due to the issues not being 'testable' issues, and thus the test files were made so that they fail each time. And failed tests, and even when they were skipped, did not look pleasing to us so we opted to remove the custom test cases from the final version.
However the link to the original test file is [Original test files](https://course-gitlab.tuni.fi/webdev1-2020-2021/webdev1-group-67/-/blob/8c4180108a50aae759512f615579a84208068baa/test/own/issues.test.js)

## Security concerns

TODO: list the security threats represented in the course slides.
Document how your application protects against the threats.
You are also free to add more security threats + protection here, if you will.
Security threats:

1. user input:
2. session hijacking:
3. session fixation
4. session side-jacking
5. injection attacks
6. directory traversal
