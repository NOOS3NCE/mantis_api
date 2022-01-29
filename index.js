const express = require('express')
const app = express()
const port = 3001
require('dotenv').config()

console.log(process.env)
const mantis_model = require('./mantis_model')

app.use(express.json())
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', process.env.DB_ORIGIN || 'https://wildorchid.one');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
    next();
});

app.get('/mantis_api/kit', (req, res) => {
    mantis_model.getKits()
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})

app.get('/mantis_api/kit/:id', (req, res) => {
    mantis_model.getKit(req.params.id)
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
            console.log("REQUEST",req.params.id)
        })
})
app.get('/mantis_api/lens', (req, res) => {
    mantis_model.getLenses()
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})
app.patch('/mantis_api/lens/swap', (req,res)=>{
    mantis_model.swapLenses(req)
        .then(response =>  {
            res.status(200).send(response)
        })
        .catch(error=>{
            res.status(500).send(error)
        })
})
app.post('/mantis_api/kit', (req, res) => {
    mantis_model.createKit(req.body)
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})
app.post('/mantis_api/lens', (req, res) => {
    mantis_model.createLens(req.body)
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})

app.delete('/mantis_api/kit/:id', (req, res) => {
    mantis_model.deleteKit(req.params.id)
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})

app.get('/mantis_api/cities',(req,res) => {
    mantis_model.getCities()
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error =>{
            res.status(500).send(error)
        })
})
app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})