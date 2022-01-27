const express = require('express')
const app = express()
const port = 3001

const mantis_model = require('./mantis_model')

app.use(express.json())
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://45.63.64.58:3000');
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
app.patch('/lens/swap', (req,res)=>{
    mantis_model.swapLenses(req)
        .then(response =>  {
            res.status(200).send(response)
        })
        .catch(error=>{
            res.status(500).send(error)
        })
})
app.post('/kit', (req, res) => {
    mantis_model.createKit(req.body)
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})
app.post('/lens', (req, res) => {
    mantis_model.createLens(req.body)
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})

app.delete('/kit/:id', (req, res) => {
    mantis_model.deleteKit(req.params.id)
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})

app.get('/cities',(req,res) => {
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