const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4'])

const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
    const applicationsCollection = database.collection("applications") // for application
    const planCollection = database.collection("plans")
    const subscriptionCollection = database.collection("subscription")



    // No-5: get all users for recruiter dashboard
    app.get('/api/users', async(req, res)=>{
      const cursor = usersCollection.find().skip(5)
      const result = await cursor.toArray()
      res.send(result)
    })


    // No-2: for get jobs by companyId & status
    app.get('/api/jobs', async(req, res)=>{
      const query = {}
      
      if(req.query.companyId){
        query.companyId = req.query.companyId
      }
      if(req.query.status){
        query.status = req.query.status
      }

      const cursor = jobsCollection.find(query).skip(10)
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
            // console.log('jobs post result', result)

            res.send(result)
    })

    // No-7: for get single job details information by jobId
    app.get('/api/jobs/:id', async(req, res)=>{
      const id = req.params.id
      // console.log("id in backend", id)
      const query = { 
        _id: new ObjectId(id)
      }
      const result = await jobsCollection.findOne(query)  
      res.send(result || {})
    })


    
    // application related apis

    // No-9: for get applications   
    app.get('/api/applications', async (req, res) => {
            const query = {};
            if (req.query.applicantId) {
                query.applicantId = req.query.applicantId;
            }
            if (req.query.jobId) {
                query.jobId = req.query.jobId;
            }
            const cursor = applicationsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
    })

    // No-8: for post applications
    app.post('/api/applications', async(req,res) =>{

      const application = req.body;
      const newApplication = {
        ...application,
        createdAt : new Date()
      }
      const result = await applicationsCollection.insertOne(newApplication)
      res.send(result)
    })
    

    // for company api information

    // No-6: get all companies information for created jobs
    app.get('/api/companies', async(req, res)=>{
      const cursor = companyCollection.find().skip(7)
      const result = await cursor.toArray()
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
            // console.log('company post result', result)

            // jodi result null hoy tahole empty object pathabo, jate frontend e error na ashe
            res.send(result || {})
    })


     // plans 
    app.get('/api/plans', async (req, res) => {
            const query = {}
            if (req.query.plan_id) {
                query.plan_id = req.query.plan_id
            }
            const plan = await planCollection.findOne(query);
            res.send(plan)
    })

      
    // subscription 
    app.post('/api/subscriptions', async (req, res) => {
            const data = req.body;
            const subsInfo = {
                ...data,
                createdAt: new Date()
            }

            console.log(data.planId)

            const result = await subscriptionCollection.insertOne(subsInfo);

            // // update the user plan information
            const filter = { email: data.email };
            // update the value of the 'quantity' field to 5
            const updateDocument = {
                $set: {
                    plan: data.planId,
                },
            };

            const updateResult = await usersCollection.updateOne(filter, updateDocument);
            res.send(updateResult)
    })



    //database 
    // const plans = [
    //   {
    //     "plan_id" : "seeker_free",
    //     "name" : "Free",
    //     "maxApplicationsPerMonth" : 3
    //   },
    //   {
    //     "plan_id" : "seeker_pro",
    //     "name" : "Pro",
    //     "maxApplicationsPerMonth" : 30
    //   },
    //   {
    //     "plan_id" : "seeker_premium",
    //     "name" : "Premium",
    //     "maxApplicationsPerMonth" : 100
    //   },
    //   {
    //     "plan_id" : "recruiter_free",
    //     "name" : "Free",
    //     "maxApplicationsPerMonth" : 3
    //   },
    //   {
    //     "plan_id" : "recruiter_growth",
    //     "name" : "Growth",
    //     "maxApplicationsPerMonth" : 3
    //   },
    //   {
    //     "plan_id" : "recruiter_enterprise",
    //     "name" : "Enterprise",
    //     "maxApplicationsPerMonth" : 3
    //   },
     
      

    // ]







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