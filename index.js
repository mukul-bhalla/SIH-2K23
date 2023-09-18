if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const Feed = require('./models/feed');
const User = require('./models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session')
const nodemailer = require('nodemailer');
const multer = require('multer');
const { storage } = require('./cloudinary')
const upload = multer({ storage });
// const { cloudinary } = require('./cloudinary/')
//chating
const http = require('http').createServer(app);
const io = require('socket.io')(http);


app.use(express.static('public'));


io.on('connection', (socket) => {
    console.log('A user connected');


    socket.on('chat message', (data) => {
        console.log('Message:', data);

        io.emit('chat message', { username: socket.username, message: data.message });
    });


    socket.on('set username', (username) => {
        console.log('Username set:', username);

        socket.username = username;
    });


    socket.on('disconnect', () => {
        console.log('disconnected');
    });
});

app.get('/chat', (req, res) => {
    res.sendfile('./public/chat.html')
});

// After your existing code
// const http = require('http');
// const server = http.createServer(app);
// const io = require('socket.io')(server);

// io.on('connection', (socket) => {
//     console.log('A user connected');

//     // Handle chat messages
//     socket.on('chat message', (message) => {
//         // Broadcast the message to all connected users (you can modify this logic for private messages)
//         io.emit('chat message', message);
//     });

//     // Handle user disconnect
//     socket.on('disconnect', () => {
//         console.log('A user disconnected');
//     });
// });

// // Modify your Express route for handling chat messages
// app.post('/chat', requireLogin, (req, res) => {
//     const { message } = req.body;

//     // Broadcast the message to all connected users (you can modify this logic for private messages)
//     io.emit('chat message', message);

//     res.redirect('/feed');
// });



// Continue with your existing code
const dbUrl = process.env.DB_URL
mongoose.connect(dbUrl)
    .then(() => {
        console.log("MongoDB Connected!");
    })
    .catch((error) => {
        console.error("MongoDB Connection Error:", error);
    });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'notagoodsecret', resave: false, saveUninitialized: true }));


const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        res.redirect('/login');
    }
    else {
        next();
    }
}






app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register');
})


//To add post to feed
app.get('/addpost', requireLogin, async (req, res) => {
    const user = await User.findById(req.session.user_id);
    if (user.role === "Client") {
        res.render('addpost')
    }
    else {
        res.redirect('/login')
    }

})

app.post('/addpost', requireLogin, async (req, res) => {

    const { posttext } = req.body;
    const id = req.session.user_id;
    if (!id) {
        res.redirect('/login');
    }
    else {
        const foundUser = await User.findById(id);
        const username = foundUser.name;
        console.log(username);
        const newpost = Feed({
            name: username,
            post: posttext
        });


        newpost.save();
        res.redirect('/feed')
    }
    // console.log(req.session.user_id)

    // await Feed.insertOne({post:posttext});
    // res.red
})



//nodemailer

function generateOTP() {
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 4; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

var tempotp = generateOTP();


// yha se start hai mail box


app.post('/register', upload.single('image'), async (req, res) => {

    // console.log(req.body, req.file);
    // res.send('It worked')


    const newuser = req.body;
    // console.log(req.files)
    const user = new User(newuser);
    user.image = { url: req.file.path, filename: req.file.filename };
    // console.log(newuser)
    await user.save();
    req.session.user_id = user._id
    res.redirect('/feed');




    // const otp = req.body.otp;

    // if (tempotp === otp) {
    // }
    // else { }

    // const transporter = nodemailer.createTransport({
    //     service: "gmail",
    //     auth: {
    //         user: 'ra0001j@gmail.com',
    //         pass: 'lztneumdqnfhiwaf'
    //     }
    // });

    // var mailOptions = {
    //     from: 'ra0001j@gmail.com',
    //     to: username,
    //     subject: 'thanks for registration',
    //     text: 'Welcome to our website ' + tempotp
    // };



    // transporter.sendMail(mailOptions, function (error, info) {
    //     if (error) {
    //         console.log(error);
    //     } else {
    //         console.log('Email sent: ' + info.response);
    //     }
    // });

    // res.send(hashed);
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const foundUser = await User.findAndValidate(email, password);
    if (foundUser) {
        req.session.user_id = foundUser._id
        res.redirect('/feed');

    }
    else {
        res.send('Try again')
    }
})

app.post('/logout', (req, res) => {
    // req.session.user_id = null;
    req.session.destroy();
    res.redirect('/login');
})

app.get('/feed', async (req, res) => {
    try {
        const allPosts = await Feed.find({});
        allPosts.reverse();

        const user = await User.findById(req.session.user_id);
        if (req.session.user_id && user.role === "Client") {
            res.render("feed", { allPosts });
        }
        else {
            res.render('feed2', { allPosts })
        }
    }

    catch (error) {
        console.error(error);
        res.status(500).send("Error occurred while fetching data.");
    }
});

// Start the server
http.listen(3000, () => {
    console.log("Server is running on port 3000");
});
