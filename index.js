const express = require('express');
const cors = require('cors');

// const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
require('dotenv').config()

// const stripe = require('stripe')(process.env.STRIPE_SECRET)
const port = process.env.PORT || 5000

const app = express();


// -----------middleware-----
app.use(cors(
    {
        origin: ['http://localhost:5173',
            'http://localhost:5173',
            // 'https://k-tech-ltd.web.app',
            // 'https://k-tech-ltd.firebaseapp.com'
        ],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }
))
app.use(express.json())
app.use(cookieParser());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8jqou.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

    }
    finally {
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('The true news are here')
})

app.listen(port)


