const express = require('express');
const cors = require('cors');

const cookieParser = require('cookie-parser')
require('dotenv').config()

const port = process.env.PORT || 5000

const app = express();



// -----------middleware-----
app.use(cors(
    {
        origin: ['http://localhost:5173',
            'http://localhost:5173',
            // 'https://S-Bangla2.0.web.app',
            // 'https://S-Bangla2.0.firebaseapp.com'
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
        const BlogCollection = client.db("S-Bangla-2-0-DB").collection('AllBlogs')
        const ShohidCollection = client.db("S-Bangla-2-0-DB").collection('ShohidList')
        const UserCollection = client.db("S-Bangla-2-0-DB").collection('UsersList')
        const ReviewsCollection = client.db("S-Bangla-2-0-DB").collection('ReviewsList')


        // ----------------------------------------------------------------------------------------
        //------all news ---------
        // ----------------------------------------------------------------------------------------

        // ---------------get all Blogs----------------
        app.get("/Blogs", async (req, res) => {
            const result = await BlogCollection.find().toArray();
            res.send(result)
        })

        // ----------------------get news by id -----------------------------
        app.get("/Blogs/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }

            const result = await BlogCollection.findOne(query)
            res.send(result)
        })

        //-----------------update view count of article------------
        app.put("/Blogs/views/:id", async (req, res) => {
            const id = req.params.id;
            const { viewCount } = req.body;

            try {
                const result = await BlogCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { viewCount } }
                );
                res.send(result);
            } catch (err) {
                res.status(500).send({ message: "Error updating views", error: err });
            }
        });

        //----------add article--------
        app.post('/Blogs', async (req, res) => {
            const review = req.body
            const result = await BlogCollection.insertOne(review)
            res.send(result)
        })

        //---------- DELETE Articles by id----------------
        app.delete("/Blogs/:id", async (req, res) => {
            const { id } = req.params;
            try {
                const result = await BlogCollection.deleteOne({ _id: new ObjectId(id) });
                if (result.deletedCount === 1) {
                    res.status(200).json({ message: "Article deleted successfully." });
                } else {
                    res.status(404).json({ message: "Article not found." });
                }
            } catch (err) {
                console.error("Delete Error:", err);
                res.status(500).json({ message: "Server error." });
            }
        });

        // ------------- approve article---------------
        app.patch('/Blogs/approve/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const result = await BlogCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { status: 'approved' } }
                );
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: 'Failed to approve article' });
            }
        });

        // -------------- make article premium--------------
        app.patch('/Blogs/premium/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const result = await BlogCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { type: 'premium', isPremium: true } }
                );
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: 'Failed to make premium' });
            }
        });

        // ----------------- make article general-------------
        app.patch('/Blogs/general/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const result = await BlogCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { type: 'general', isPremium: false } }
                );
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: 'Failed to make general' });
            }
        });


        //--------------------------------------------------------------------
        //-------------publisher----------------
        //---------------------------------------------------------------------

        // ---------------get all publishers----------------
        app.get("/Shohid", async (req, res) => {
            const result = await ShohidCollection.find().toArray();
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

        // --------------------- update isSubscribed------------
        app.patch("/Users/:id", async (req, res) => {
            const userId = req.params.id;
            const { isSubscribed } = req.body;

            try {
                const result = await UserCollection.updateOne(
                    { _id: new ObjectId(userId) },
                    { $set: { isSubscribed: isSubscribed } }
                );

                if (result.modifiedCount > 0) {
                    res.send({ success: true, message: "Subscription updated." });
                } else {
                    res.status(404).send({ success: false, message: "User not found or already updated." });
                }
            } catch (error) {
                res.status(500).send({ success: false, message: "Update failed.", error });
            }
        });

        // ---------------------- remove admin ---------------------
        app.patch("/Users/remove-admin/:id", async (req, res) => {
            const userId = req.params.id;

            // console.log('xxgjh')

            try {
                const result = await UserCollection.updateOne(
                    { _id: new ObjectId(userId) },
                    { $set: { role: "user" } }
                );

                res.json(result);
            } catch (err) {
                res.status(500).json({ message: "Failed to update user role", error: err.message });
            }
        });

        // ---------------------- make admin---------------------
        app.patch("/Users/admin/:id", async (req, res) => {
            const userId = req.params.id;

            // console.log('xxgjh')

            try {
                const result = await UserCollection.updateOne(
                    { _id: new ObjectId(userId) },
                    { $set: { role: "admin" } }
                );

                res.json(result);
            } catch (err) {
                res.status(500).json({ message: "Failed to update user role", error: err.message });
            }
        });

        // //----------------- DELETE a user---------------
        app.delete("/Users/:id", async (req, res) => {
            const userId = req.params.id;

            try {
                const result = await UserCollection.deleteOne({ _id: new ObjectId(userId) });
                res.json(result);
            } catch (err) {
                res.status(500).json({ message: "Failed to delete user", error: err.message });
            }
        });


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

        //---------- DELETE review by id----------------
        app.delete("/Reviews/:id", async (req, res) => {
            const { id } = req.params;
            try {
                const result = await ReviewsCollection.deleteOne({ _id: new ObjectId(id) });
                if (result.deletedCount === 1) {
                    res.status(200).json({ message: "Review deleted successfully." });
                } else {
                    res.status(404).json({ message: "Review not found." });
                }
            } catch (err) {
                console.error("Delete Error:", err);
                res.status(500).json({ message: "Server error." });
            }
        });

    }
    finally {
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Shadin Bangla 2.0 server is running.......')
})

app.listen(port)


