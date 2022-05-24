const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nh40c.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        await client.connect()

        const sparkCollection = client.db("sawariSpark").collection("tools")
        const infoCollection = client.db("information").collection("usersInfo")

        app.get('/spark', async (req, res) => {
            const query = {}
            const cursor = sparkCollection.find(query);
            const spark = await cursor.toArray();
            res.send(spark)
        })

        app.get('/spark/:sparkId', async (req, res) => {
          const id = req.params.sparkId;
          const query = {_id: ObjectId(id)}
          const result = await sparkCollection.findOne(query)
          res.send(result)
        })

        app.post('/spark' , async (req, res) => {
          const newSpark = req.body;
          const result = await sparkCollection.insertOne(newSpark);
          res.send(result)
        })

        app.post('/info', async (req, res) => {
          const newInfo = req.body;
          const result = await infoCollection.insertOne(newInfo);
          res.send(result)
        })

    }
    finally{

    }
}

run().catch(console.dir)


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})