import express from 'express';
import 'dotenv/config';
import connectDB from './src/config/mongodb.js';
import { initSocket } from './src/socket/index.js';
import cors from 'cors';
import { errorHandler } from './src/middlewares/errorHandler.js';
import userRouter from './src/routes/userRoute.js';
import postRouter from './src/routes/postRoute.js';
import commentRouter from './src/routes/commentRoute.js';
import friendRouter from './src/routes/friendRoute.js';
import messageRouter from './src/routes/messageRoute.js';
import morgan from 'morgan';
import http from 'http';
import {initLogger} from './src/utils/logger.js';
initLogger();
const app = express();
connectDB();

app.use(
  cors({
    origin: [
      "https://blog-application-lovat.vercel.app", // prod frontend
      "http://localhost:5173",                     // local dev
      "http://localhost:8080",
      "http://13.232.200.157",                        // EC2 backend origin (IMPORTANT)
      "http://myfrontendd.s3-website.ap-south-1.amazonaws.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); 

app.use('/api/user', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use("/api/friends", friendRouter);
app.use("/api/messages", messageRouter);

app.get('/', (req, res) => {
    res.send('Blog Server is running!');
});

app.use(errorHandler);

const server = http.createServer(app);
const io = initSocket(server);
app.set("io", io);

server.listen(process.env.PORT, "0.0.0.0" ,  () => {
  console.log(`🚀 Server running on port:${process.env.PORT}`);
});
