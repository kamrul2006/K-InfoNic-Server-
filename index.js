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

        // ----------------collection------------------
        const NewsCollection = client.db("K-Infonic-DB").collection('All-News')
        const PublisherCollection = client.db("K-Infonic-DB").collection('Publisher')
        const UserCollection = client.db("K-Infonic-DB").collection('Users')
        const ReviewsCollection = client.db("K-Infonic-DB").collection('Reviews')




        // ----------------------------------------------------------------------------------------
        //------all news ---------
        // ----------------------------------------------------------------------------------------

        // ---------------get all news----------------
        app.get("/News", async (req, res) => {
            const result = await NewsCollection.find().toArray();
            res.send(result)
        })

        // ----------------------get news by id -----------------------------
        app.get("/News/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }

            const result = await NewsCollection.findOne(query)
            res.send(result)
        })

        //-----------------update view count of article------------
        app.put("/News/views/:id", async (req, res) => {
            const id = req.params.id;
            const { viewCount } = req.body;

            try {
                const result = await NewsCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { viewCount } }
                );
                res.send(result);
            } catch (err) {
                res.status(500).send({ message: "Error updating views", error: err });
            }
        });

        //----------add article--------
        app.post('/News', async (req, res) => {
            const review = req.body
            const result = await NewsCollection.insertOne(review)
            res.send(result)
        })


        //--------------------------------------------------------------------
        //-------------publisher----------------
        //---------------------------------------------------------------------

        // ---------------get all publishers----------------
        app.get("/publishers", async (req, res) => {
            const result = await PublisherCollection.find().toArray();
            res.send(result)
        })



        // ----------------------------------------------------------------------------------------
        //------Users---------
        // ----------------------------------------------------------------------------------------

        // -----------get all user---------------------------------
        app.get("/Users", async (req, res) => {
            const result = await UserCollection.find().toArray();
            res.send(result)
        })

        //---------------------------------add users-------------------
        app.post('/Users', async (req, res) => {
            const user = req.body
            const query = { email: user.email }
            const exist = await UserCollection.findOne(query)

            if (exist) {
                return res.send({ massage: 'User Already exist', insertedId: null })
            }

            const result = await UserCollection.insertOne(user)
            res.send(result)
        })



        //--------------------------------------------------------------------
        //-------------Reviews----------------
        //---------------------------------------------------------------------

        // ---------------get all Review----------------
        app.get("/reviews", async (req, res) => {
            const result = await ReviewsCollection.find().toArray();
            res.send(result)
        })

        //----------add review--------
        app.post('/reviews', async (req, res) => {
            const review = req.body
            const result = await ReviewsCollection.insertOne(review)
            res.send(result)
        })


    }
    finally {
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('The true news are here')
})

app.listen(port)


