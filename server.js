const express = require('express');

const bcrypt = require('bcrypt');

const bodyParser = require('body-parser');

const cors = require('cors');


const app = express();

var db = require('knex')({
    client: 'pg',
    version: '7.2',
    connection: {
        host : '127.0.0.1',
        user : 'postgres',
        password : 'root',
        database : 'db'
    }
});

app.use(bodyParser.json());

app.use(cors());

const database = {
    users: [
        {
            id: '123',
            name: 'Jhon',
            email : 'jhon@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Sally',
            email : 'sally@gmail.com',
            password: 'bananas',
            entries: 0,
            joined: new Date()
        }
    ]
}


app.get('/',(req,res)=>{
   res.send(database.users);
});

app.post('/signin',(req,res)=>{
    bcrypt.compare("apples", "$2b$10$bgNGkp0rD.TvjibHJ8nCe.XC0UqzbvFWCdVShdYmxaZ25.5jiV4Gy", function(err, res) {
        console.log("First guess",res);
    });
    bcrypt.compare("something wrong", "$2b$10$bgNGkp0rD.TvjibHJ8nCe.XC0UqzbvFWCdVShdYmxaZ25.5jiV4Gy", function(err, res) {
        console.log("Second guess",res);
    });
    if(req.body.email==database.users[0].email&&
    req.body.password==database.users[0].password){
        res.json(database.users[0])
    }
    else{
        res.status(400).json('error logging in');
    }
});

app.post('/register',(req,res)=>{
    const {name,email,password} = req.body;
    //bcrypt.hash(password,10, (err,hash)=>{
    //    console.log(hash);
    //});
    db('users').returning('*')
        .insert({
        email: email,
        name: name,
        joined: new Date()
    }).then(user=>{
        res.json(user[0])
    }).catch(err=>res.status(400).json('unable to register'));
});

app.get('/profile/:id',(req,res) =>{
   const {id} = req.params;//It happnens because I get the variables from the url

    db.select('*').from('users').where({
        id:id
    }).then(users=>{
        if(users.length>0){
            return res.json(users[0])
        }
        else{
            return res.status(400).json('not found')
        }
    }).catch(err => res.status(400).json('Error getting user'));
});

app.put('/image',(req,res)=>{
    const {id} = req.body;
    db.select('*').from('users').where({
        id:id
    }).increment('entries',1).returning('entries')
        .then(entries=> console.log(entries))
        .catch(err=>console.log(err))
});

app.listen(3000, () => {
    console.log('It is working on port 3000');
});
