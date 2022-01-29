const {request} = require("express");
const Pool = require('pg').Pool
const pool = new Pool({
    user:process.env.HOME === '/Users/mikehale' ? process.env.DB_USER : 'halemikehale',
    host:process.env.HOME === '/Users/mikehale' ?  process.env.DB_HOST : 'wildorchid.one',
    database: process.env.HOME === '/Users/mikehale' ? process.env.DB_DATABASE : 'halemikehale',
    password:process.env.HOME === '/Users/mikehale' ?  process.env.DB_PASS : 'Heywuzzup123!',
    port: 5432,
});

const getKits= () => {
    return new Promise(function(resolve, reject) {
        pool.query('SELECT kits.*, cities.city_code, users.user_firstname, users.user_lastname FROM kits LEFT JOIN cities ON kits.city_id = cities.city_id LEFT JOIN users ON kits.user_id = users.user_id GROUP BY kits.kit_id, cities.city_id, users.user_id ORDER BY kits.kit_display ASC', async (error, results) => {
            if (error) {
                reject(error)
            }
            resolve(results.rows);
        })
    })
}
const getLenses = () => {
    return new Promise( function(resolve,reject) {
        pool.query('SELECT lenses.*, kits.kit_display FROM kits RIGHT JOIN lenses ON lenses.kit_id = kits.kit_id GROUP BY lenses.kit_id, lenses.lens_model, lenses.lens_brand, lenses.lens_serial, lenses.lens_name, lenses.lens_display, lenses.lens_id, kits.kit_id, kits.kit_display ORDER BY lenses.lens_display ASC', async (error, results) => {
            console.log("Lenses", results.rows)
            if(error){
                reject(error)
            }
            resolve(results.rows)
        })
    })
}
const swapLenses=(body)=>{
    const {lens_id, kit_id} = body.body
    console.log("BODY:",body.body)
    console.log("LENS ID: ", lens_id)
    console.log("KIT ID: ", kit_id)
    return new Promise(function(resolve,reject){
        pool.query('UPDATE lenses SET kit_id = $2 WHERE lens_id = $1', [lens_id,kit_id],async(error,results)=>{
            if(error){
                reject(error)
            }
            resolve(`Lens has been moved to new kit:${results} `)
        })
    })
}
const getKit = (id) => {
    return new Promise(function(resolve, reject) {
        let kit
        pool.query('SELECT kits.*, cities.city_code FROM kits JOIN cities ON kits.city_id = cities.city_id WHERE kit_id = $1', [id],async (error, results) => {
            if(error){
                reject(error)
            }
            kit = results.rows[0]
            pool.query('SELECT * FROM lenses WHERE kit_id = $1', [kit.kit_id],(err, lenses) => {
                if(error){
                    reject(error)
                }
                pool.query('SELECT * FROM users WHERE user_id = $1', [kit.user_id],(err, users) => {
                    if(error){
                        reject(error)
                    }
                    const user = users.rows[0]
                    const lensList = lenses.rows
                    kit = results.rows[0]
                    kit.lenses = lensList
                    kit.user = user
                    resolve(kit)
                })
            })
        })
    })

}
const createKit = (body) => {

    return new Promise(function(resolve, reject) {
        const {kit_display, city_id, kit_name, kit_type, camera, lenses} = body
        console.log("KIT BODY: ", body)
        pool.query('INSERT INTO kits (kit_name, kit_display, kit_type, city_id) VALUES ($3,$1,$4,$2)', [kit_display, city_id, kit_name, kit_type] , (error, results) => {
            if (error) {
                reject(error)
            }
            resolve(`A new kit has been added: ${results}`)
        })
    })
}
const createLens = (body) => {
    return new Promise(function(resolve, reject){
        const {lens_brand, lens_name, lens_serial, lens_model, lens_display, kit_name} = body
        console.log("LENS BODY:", body)
        pool.query('INSERT INTO lenses (lens_brand, lens_name, lens_serial, lens_model, lens_display, kit_id) SELECT $1, $2, $3, $4, $5, kits.kit_id FROM kits WHERE kits.kit_name = $6', [lens_brand, lens_name, lens_serial, lens_model, lens_display, kit_name], (error, results) => {
            if(error){
                reject(error)
            }
            resolve(`A new lens has been added: ${results}`)
        })
    })
}
const loadOutKit = (id) => {
    return new Promise(function(resolve, reject){
        pool.query('UPDATE kit_loadedOut FROM kits WHERE id = $1', [id])
    })
}
const deleteKit = (id) => {
    return new Promise(function(resolve, reject) {
        pool.query('DELETE FROM kits WHERE kit_id = $1', [id], (error, results) => {
            if (error) {
                reject(error)
            }
            resolve(`Merchant deleted with ID: ${id}`)
        })
    })
}
const getCities = () => {
    return new Promise(function(resolve, reject){
        pool.query('SELECT * FROM cities', (error,results)=>{
            if(error){
                reject(error)
            }
            resolve(results.rows)
        })
    })
}

module.exports = {
    getKits,
    getKit,
    createKit,
    deleteKit,
    getCities,
    loadOutKit,
    createLens,
    getLenses,
    swapLenses
}