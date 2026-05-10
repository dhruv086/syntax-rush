import mongoose from "mongoose"

const connectDB = async()=>{
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }

    const connectionInstance = await mongoose.connect(uri);
    console.log(`MONGODB CONNECTED : ${connectionInstance.connection.host}`)
  } catch (error) {
    console.log("Error connecting to the database", error);
    throw error;
  }
}

export default connectDB