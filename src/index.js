import "dotenv/config";
import connectDB from "./db/index.js";
import { app } from "./app.js";

connectDB()
.then(() => {
    const port = process.env.PORT || 6000;
    app.on("error", (error) => {
        console.log("ERROR: ", error);
    });
    app.listen(port);
    console.log(`Server is running at port : ${port}`);
})
.catch((err) => {
    console.log("MONGO DB connection failed!", err);
});
