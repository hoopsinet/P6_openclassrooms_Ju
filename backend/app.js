const express = require('express');

const mongoose = require('mongoose');

//importation du router
const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

//connexion BDD
mongoose.connect('mongodb+srv://hoops:Jac132406@cluster0.orklzuu.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();



//header settings
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(express.json());

app.use('/api/sauces', saucesRoutes);
app.use('/api/user', userRoutes);

module.exports = app;