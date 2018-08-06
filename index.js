const express = require('express');
const server  = express();
const PORT    = 8000;
const bcrypt  = require('bcryptjs');
const db      = require('./data/dbConfig');
let isValid   = null;

server.use(express.json());
const authenticate = async (req, res, next) => {
  const credentials = req.body;
  const foundUser = await db('users').where('username', credentials.username).first();
  const userHash = foundUser.password;
  isValid = bcrypt.compareSync(credentials.password, userHash);
  next();
};

server.get('/', (req, res) => {
   res.status(200).send('HellO!');
 });

 server.get('/api/users', (req, res) => {
   if (isValid) {
       const users = db('users').then(response => {
         res.status(200).json(response);
       }).catch(err => {
         res.status(500).json(`${err}`);
       });
 } else {
   res.status(401).json({status:`401 Denied`, message: "You are not logged in"});
 }
 })

 server.post('/api/register', async (req, res) => {
   const user = req.body;
   const hash = bcrypt.hashSync(user.password, 14);
   user.password = hash;

   try {
     if (user.username && user.password) {
       const ids = await db.insert(user).into('users');
       const id = ids[0];
       res.status(201).json(await db('users').where('id', id).first());
     } else {
       throw Error;
     }
   } catch (err) {
     return console.log(`${err}`);
   }
 })

 server.post('/api/login', authenticate, async (req, res) => {
   if (isValid) {
     res.status(200).json('Logged In')
   } else {
     res.status(401).json({status:401, message: 'You shall not pass!'})
   }
 });

 server.get('/api/users', (req, res) => {

 })

server.listen(PORT, () => console.log(`App is listening on ${PORT}`))