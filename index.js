const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4'])

const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

const port = process.env.PORT||5000;

app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
  res.send('Hello this is HireLoop server!')
})


const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("hire-loop-db");
    const jobsCollection = database.collection("jobs");
    const companyCollection = database.collection("companies"); 
    const usersCollection = database.collection("user");  // for user collection



    

    // No-2: for get jobs by companyId & status
    app.get('/api/jobs', async(req, res)=>{
      const query = {}
      
      if(req.query.companyId){
        query.companyId = req.query.companyId
      }
      if(req.query.status){
        query.status = req.query.status
      }

      const cursor = jobsCollection.find(query)
      const result = await cursor.toArray()

      res.send(result)
    })

    
    // No-1: for recruiter jobs post
    app.post('/api/jobs', async(req, res)=>{
            const job = req.body

            
            // for add current (Date + time) when mutation
            const neWJob = {
              ...job,
              createdAt: new Date()
            }
            const result = await jobsCollection.insertOne(neWJob)
            console.log('jobs post result', result)

            res.send(result)
    })
    


    // No-4: for company related api

    app.get('/api/my/companies', async(req, res)=>{
      const query = {}  
      if(req.query.recruiterId){
        query.recruiterId = req.query.recruiterId
      }
      const result = await companyCollection.findOne(query)
      res.send(result || {})
    })

    // No-3: for company post api
    app.post('/api/companies', async(req, res)=>{
            const company = req.body

            // for add current (Date + time) when mutation
            const newCompany = {
              ...company,
              createdAt: new Date()
            }

            const result = await companyCollection.insertOne(newCompany)
            console.log('company post result', result)

            // jodi result null hoy tahole empty object pathabo, jate frontend e error na ashe
            res.send(result || {})
    })



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`HireLoop Server  jobs site is listening on port ${port}`)
})