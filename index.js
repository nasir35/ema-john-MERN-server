const express = require('express');
const {MongoClient} = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 7000;

// middle ware 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.atq4j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        console.log('MongoDB connected!');
        const database = client.db('online_Shop');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('orders');

        app.get('/products', async (req, res) => {
            const page=req.query.page;
            const size = parseInt(req.query.size);
            const cursor = productCollection.find({});
            const count = await cursor.count();
            let products;
            if(page){
                products = await cursor.skip(page*size).limit(size).toArray()
            }
            else{
                products = await cursor.toArray();
            }
            res.send({count, products});
        });

        // post api 
        app.post('/products/byKeys', async (req, res) => {
            const keys = req.body;
            const query = {key: {$in : keys}}
            const products = await productCollection.find(query).toArray();
            res.send(products);
        })

        // add orders api 
        app.post('/order', async (req, res) => {
            const result = await orderCollection.insertOne(req.body);
            console.log('order inserted with id', result.insertedId);
            res.json(result);
        })
        
    }
    finally{
        // await client.close()
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('welcome!');
})
app.listen(port, () => {
    console.log('ema john server is running at port : ', port);
})