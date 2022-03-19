const {MongoClient}=require("mongodb");

const MONGODB_URL=process.env.MONGODB_URL;
const MONGODB_NAME=process.env.MONGODB_NAME;

const client=new MongoClient(MONGODB_URL);

module.exports={
    // All Collections
    db:null,
    //Specific Collections
    users:null,
    async connect(){
        // Connnecting to database
        await client.connect();
        console.log("Connected to Mongo:",MONGODB_URL);

        // Selecting the database
        this.db=client.db(MONGODB_NAME);
        console.log("Selected Database:",MONGODB_NAME);

        //Selecting Specific Collection
        this.users=this.db.collection("users");
    }
}