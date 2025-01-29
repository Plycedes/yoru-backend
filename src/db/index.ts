import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
    try {
        const dbUrl: string = process.env.MONGODB_URL || "";
        const dbName: string = process.env.DB_NAME || "default";

        const connectionInstance = await mongoose.connect(`${dbUrl}/${dbName}`);
        console.log(`MongoDB connected! DB_HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection failed!!:", error);
        process.exit(1);
    }
};

export default connectDB;
