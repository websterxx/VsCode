const express = require("express");
const app = express();
const morgan = require('morgan');
const bodyParser =  require('body-parser');
const mongoose = require('mongoose');


const shopsRoutes = require('./api/routes/shops');
const authRoutes = require('./api/routes/auth');
const usersRoutes = require('./api/routes/users');
const categoriesRoutes = require('./api/routes/categories');
const productsRoutes = require('./api/routes/products');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === 'OPTIONS'){
        res.header('Access-Controll-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET, POST');
        return res.status(200).json({});
    }
    next();
});

app.use('/shops',shopsRoutes);
app.use('/auth',authRoutes);
app.use('/users',usersRoutes);
app.use('/categories',categoriesRoutes);
app.use('/products',productsRoutes);

mongoose.connect('mongodb+srv://admin:admin@node-rest-shop.yonkdeo.mongodb.net/?retryWrites=true&w=majority');
mongoose.Promise = global.Promise;

app.use((req, res, next)=>{
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next)=>{
    res.status(error.status || 500);
    res.json({
        error: {
            message : error.message
        }
    });
});

module.exports = app;