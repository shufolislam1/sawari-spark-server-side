const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nh40c.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
      const authHeader = req.headers.authorization;
      if(!authHeader){
        return res.status(401).send({message: 'UnAuthorized Access'})
      }
      const token = authHeader.split(' ')
      jwt.verify(token, process.eventNames.ACCESS_TOKEN_SECRET, function(err, decoded){
          if(err){
            return res.status(403).send({message: 'Forbidden Access'})
          }
          req.decoded = decoded;
          next()
      })
}

async function run() {
    try{
        await client.connect()

        const sparkCollection = client.db("sawariSpark").collection("tools")
        const infoCollection = client.db("information").collection("usersInfo")
        const orderCollection = client.db("allOrders").collection("order")
        const reviewCollection = client.db("allReviews").collection("reviews")
        const userCollection = client.db("allUsers").collection("users")

        app.get('/spark', async (req, res) => {
            const query = {}
            const cursor = sparkCollection.find(query);
            const spark = await cursor.toArray();
            res.send(spark)
        })

        // for jwt

        app.put('/user/:email', async (req, res) => {
          const email = req.params.email;
          const user = req.body;
          const filter = {email: email}
          const options = {upsert: true}
          const updateDoc = {
            $set: user,
          };
          const result = await userCollection.updateOne(filter, updateDoc, options);
          const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET)
          res.send({result, token})
        })

        app.get('/user', async (req, res) => {
          const result = await userCollection.find().toArray()
          res.send(result)
        })

        app.get('/spark/:sparkId', async (req, res) => {
          const id = req.params.sparkId;
          const query = {_id: ObjectId(id)}
          const result = await sparkCollection.findOne(query)
          res.send(result)
        })

        app.post('/review', async (req, res) => {
          const newReview = req.body;
          const result = await reviewCollection.insertOne(newReview);
          res.send(result)
        })

        app.get('/review', async (req, res) => {
          const query = {}
          const cursor = reviewCollection.find(query)
          const result = await cursor.toArray();
          res.send(result)
        })

        app.post('/order', async (req, res) => {
          const newOrder = req.body;
          const result = await orderCollection.insertOne(newOrder);
          res.send(result)
        })

        app.get('/order', verifyJWT,  async(req, res) => {
          const email = req.query.email
          // const decodedEmail = req.decoded.email;
          // console.log(decodedEmail);
          if(email){
            const query = {email: email}
            const cursor = orderCollection.find(query)
            const result = await cursor.toArray()
            return res.send(result)
          }
          // else{
          //   return res.status(403).send({message: 'Forbidden Access'})
          // }
        })

        app.post('/info', async (req, res) => {
          const newInfo = req.body;
          const result = await infoCollection.insertOne(newInfo);
          res.send(result)
        })

        app.get('/info', async (req, res) => {
          const email = req.query.email
          const query = {email: email}
          const cursor = infoCollection.find(query)
          const result = await cursor.toArray()
          res.send(result)
        })

        app.put('/info/:email', async (req, res) => {
          const email = req.query.email;
          const updatedInfo = req.body;
          const filter = {email: email}
          const options = {upsert: true}
          const updateDoc = {
            $set: {
              education: updatedInfo.education,
              location: updatedInfo.location,
              phone: updatedInfo.phone
            }
          };
          const result = await infoCollection.updateMany(filter, updateDoc, options)
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