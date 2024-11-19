const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const port = 5000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: 'yourSecretKey', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());



mongoose.connect('mongodb+srv://abrehamworke78:abrehamworke@clusterbackend.pery6.mongodb.net/cluster?retryWrites=true&w=majority&appName=ClusterBackend')
    .then(() => console.log('MongoDB connected '))
    .catch((err) => console.log('Error connecting to MongoDB:', err));


    
    
const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    father_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Define the Contact schema
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

// Define th
const User = mongoose.model('User', userSchema);
const Contact = mongoose.model('Contact', contactSchema);

// Middleware to check authentication
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next(); 
    }
    res.redirect('/'); 
}

// Route for login
app.get('/', (req, res) => {
    res.render('login'); // Renders the login page
});

// Route for signup
app.get('/signup', (req, res) => {
    res.render('signup'); // Renders the signup page
});

// Handle signup
app.post('/signup', async (req, res) => {
    const { first_name, father_name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    try {
        const newUser = new User({ first_name, father_name, email, password: hashedPassword });
        await newUser.save(); // Save to MongoDB
        res.status(201).send('User created successfully! You can now log in.');
    } catch (error) {
        if (error.code === 11000) {
            // Duplicate key error (email already exists)
            return res.status(400).send('Email already exists.');
        }
        console.error('Error creating user:', error);
        res.status(500).send('Error creating user.');
    }
});

// Handle login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send('Invalid email or password.');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send('Invalid email or password.');
        }

        // If login is successful, store user info in session and redirect to home
        req.session.user = user; // Store user information in session
        res.redirect('/home'); // Redirect to home page
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in.');
    }
});

// Route to serve the home page
app.get('/home', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'hp.html')); // Serve hp.html
});

// Route to handle contact form submissions and save to MongoDB
app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;

    // Save the form data to MongoDB
    try {
        const newContact = new Contact({ name, email, message });
        await newContact.save(); // Save to MongoDB
        console.log(`Name: ${name}, Email: ${email}, Message: ${message}`);
        res.status(200).send('Message received and saved!');
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).send('Error saving message.');
    }
});

// Handle logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error logging out:', err);
            return res.status(500).send('Error logging out.');
        }
        res.redirect('/'); // Redirect to login page
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});








