import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        const dbConnectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        console.log("MongoDB Connected!!!!! Connection Instance: ", dbConnectionInstance.connection.host)
    } catch (error) {
        let errorMessage = "Failed!!!"
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.log("Error occurred while connecting to DB: ", errorMessage)
    }
}