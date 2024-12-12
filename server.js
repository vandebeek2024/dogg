import express from 'express';
import dotenv from "dotenv";
import conn from "./db.js";
import cookieParser from 'cookie-parser';
import methodOverride from "method-override";
import pageRoute from "./routes/pageRoute.js";
import userRoute from "./routes/userRoute.js";
import adminRoute from "./routes/adminRoute.js";
import { checkUser } from "./middlewares/authMiddleware.js";
import { checkAdmin } from "./middlewares/adminMiddleware.js";
import { fileURLToPath } from 'url'; // Import fileURLToPath
import path from "path"; // Import path module

dotenv.config();

// connection to the DB
conn();

const __filename = fileURLToPath(import.meta.url); // Get current module's filename
const __dirname = path.dirname(__filename); // Get current module's directory

const app = express();
const port = process.env.PORT || 3000;

//ejs template engine
app.set('view engine', 'ejs');

//static files middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(methodOverride('_method', {
    methods: ['POST', 'GET'],
}));

//routes
app.use('*', checkUser); 
app.use('*', checkAdmin);
app.use("/", pageRoute);
app.use("/users", userRoute);
app.use("/admin", adminRoute);

// Route to serve the PDF file
app.get('/whitepaper', (req, res) => {
    const images = [
        '/whitepaper/page01.jpg',
        '/whitepaper/page02.jpg',
        '/whitepaper/page03.jpg',
        '/whitepaper/page04.jpg',
        '/whitepaper/page05.jpg',
        '/whitepaper/page06.jpg',
        '/whitepaper/page07.jpg',
        '/whitepaper/page08.jpg',
        '/whitepaper/page09.jpg'   // Add more pages as needed
    ];
    res.render('whitepaper', { images });
});

// 404 error handling middleware
app.use((req, res, next) => {
    res.status(404).render('404.ejs');
});

//server listening
app.listen(port, () => {
    console.log(`App running on port: ${port}`);
});
