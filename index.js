const express = require('express')
const app = express()
const port = 3001
require('dotenv').config()

console.log(process.env)
const mantis_model = require('./mantis_model')

app.use(express.json())
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', process.env.SUDO_USER === 'mikehale' ? 'http://localhost:3000' : 'https://wildorchid.one');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
    next();
});

//EVENTS---------------------------------------------------------------------------------------------------
app.get('/mantis_api/event', (req,res)=> {
    mantis_model.getEvents()
        .then(response => {
            res.status(200).send(response)
        })
        .catch(error => {
            res.status(500).send(error)
        })
})

app.post('/mantis_api/event', (req, res) => {
    mantis_model.createEvent(req.body)
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})

app.get('/mantis_api/event/:id', (req, res) => {
    mantis_model.getEvent(req.params.id)
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
            console.log("REQUEST",req.params.id)
        })
})

//VENUES---------------------------------------------------------------------------------------------------
app.post('/mantis_api/venue', (req, res) => {
    mantis_model.createVenue(req.body)
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})

app.get('/mantis_api/venue', (req, res) => {
    mantis_model.getVenues()
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})

app.get('/mantis_api/venue/:id', (req, res) => {
    mantis_model.getVenue(req.params.id)
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
            console.log("REQUEST",req.params.id)
        })
})

//KITS---------------------------------------------------------------------------------------------------
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

app.post('/mantis_api/kit', (req, res) => {
    mantis_model.createKit(req.body)
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

//LENSES---------------------------------------------------------------------------------------------------
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
app.post('/mantis_api/lens', (req, res) => {
    mantis_model.createLens(req.body)
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})

//CAMERAS---------------------------------------------------------------------------------------------------
app.get('/mantis_api/camera', (req, res) => {
    mantis_model.getCameras()
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})
app.patch('/mantis_api/camera/swap', (req,res)=>{
    mantis_model.swapCameras(req)
        .then(response =>  {
            res.status(200).send(response)
        })
        .catch(error=>{
            res.status(500).send(error)
        })
})
app.post('/mantis_api/camera', (req, res) => {
    mantis_model.createCamera(req.body)
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})

//CLIENTS---------------------------------------------------------------------------------------------------
app.post('/mantis_api/client', (req,res) => {
    mantis_model.createClient(req.body)
        .then(response => {
            res.status(200).send(response)
        })
        .catch(error => {
            res.status(500).send(error)
        })
})

//CITIES---------------------------------------------------------------------------------------------------
app.get('/mantis_api/cities',(req,res) => {
    mantis_model.getCities()
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error =>{
            res.status(500).send(error)
        })
})

//HISTORY---------------------------------------------------------------------------------------------------
app.post('/mantis_api/history', (req, res) => {
    mantis_model.createGearHistory(req.body)
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})
app.get('/mantis_api/history/kit/:id', (req, res) => {
    mantis_model.getKitHistory(req.params.id)
        .then(response => {
            res.status(200).send(response);
        })
        .catch(error => {
            res.status(500).send(error);
        })
})

//PORT------------------------------------------------------------------------------------------------------
app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})