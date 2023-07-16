const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const User = require('./models/User_schema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const secret = 'adafadasgsfgsgsfgsdfa';
const cookieParser = require('cookie-parser');

const salt = bcrypt.genSaltSync(10);
app.use(cors({credentials:true, origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());

mongoose.connect('mongodb+srv://manjukiranhc7:Manjukiran@cluster0.56lwvzb.mongodb.net/?retryWrites=true&w=majority')

app.post('/register', async (req,res) => {
    const{username,password} = req.body;
    try{
        const userDoc = await User.create({
            username, 
            password:bcrypt.hashSync(password,salt)})
        res.json(userDoc);
    } catch(e) {
        res.status(400).json(e);
    }    
});
app.post('/login', async(req,res) => {
    console.log(req.body)
    const{username,password} = req.body;
    const userDoc = await User.findOne({username});
    const passOk = await bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
        jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
            if (err) throw err;
            res.cookie('token', token).json({
                id:userDoc._id,
                username,
            });
        });
    } else {
        res.status(403).json('Invalid username and password entered')
    }
});

app.get('/profile', (req,res) => {
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, (err,info) => {
        if(err) throw err;
        res.json(info);
    })  
});

app.post('/logout', async(req,res) => {
    res.cookie('token','').json('ok');
})

app.listen(4000);
