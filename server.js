require('dotenv').config();
const express = require('express');

const bcrypt = require('bcrypt');

const bodyParser = require('body-parser');

const cors = require('cors');

const app = express();

var db = require('knex')({
    client: 'pg',
    version: '7.2',
    connection: {
        host : process.env.NODE_HOST,
        user : process.env.NODE_USER,
        password : process.env.NODE_PASSWORD,
        database : process.env.NODE_DATABASE,
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
    db.select('email','hash').from('login')
        .where('email','=',req.body.email)
        .then(data => {
            const isVailid = bcrypt.compareSync(req.body.password,data[0].hash)
            if(isVailid){
                return db.select('*').from('users')
                    .where('email','=',req.body.email)
                    .then(user=>{
                        res.json(user[0]);
                    })
                    .catch(err => res.status(400).json('unable to get user'))
            }
            else{
                return res.status(400).json('wrong credentials')
            }
        })
        .catch(err=>res.status(400).json('wrong credentials'))
});

app.post('/register',(req,res)=>{
    const {name,email,password} = req.body;
    const hash = bcrypt.hashSync(password,10);
    db.transaction(trx => {
       trx.insert({
           hash:hash,
           email:email
       }).into('login')
           .returning('email')
           .then(loginEmail=>{
               return trx('users').returning('*')
                   .insert({
                       email:loginEmail[0],
                       name:name,
                       joined: new Date()
                   })
                   .then(user=>{
                       res.json(user[0])
                       })
           })
    });
    db('users').returning('*')
        .insert({
            email: email,
            name: name,
            joined: new Date()
        }).then(user=>{res.json(user[0])

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
console.log(process.env.NODE_HOST);