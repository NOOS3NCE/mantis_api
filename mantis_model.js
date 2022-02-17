require('dotenv').config()
const Pool = require('pg').Pool

const pool = new Pool({
    user: process.env.SUDO_USER === 'mikehale' ? process.env.DB_USER : 'halemikehale',
    host: process.env.SUDO_USER === 'mikehale' ? process.env.DB_HOST : 'localhost',
    database: process.env.SUDO_USER === 'mikehale' ? process.env.DB_DATABASE : 'halemikehale',
    password: process.env.SUDO_USER === 'mikehale' ? process.env.DB_PASS : 'Heywuzzup123!',
    port: 5432,
});

const getEvents = () => {
    return new Promise( function(resolve, reject) {
        pool.query('SELECT * FROM events', async (error, results) => {
            if(error){
                reject(error)
            }
            resolve(results.rows)
        })
    })
}
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
        pool.query('SELECT lenses.*, kits.kit_display FROM kits RIGHT JOIN lenses ON lenses.kit_id = kits.kit_id GROUP BY lenses.kit_id, lenses.lens_model, lenses.lens_brand, lenses.lens_serial, lenses.lens_display, lenses.lens_id, kits.kit_id, kits.kit_display ORDER BY lenses.lens_display ASC', async (error, results) => {
            if(error){
                reject(error)
            }
            resolve(results.rows)
        })
    })
}
const getCameras = () => {
    return new Promise( function(resolve,reject) {
        pool.query('SELECT cameras.*, kits.kit_display FROM kits RIGHT JOIN cameras ON cameras.kit_id = kits.kit_id GROUP BY cameras.kit_id, cameras.camera_model, cameras.camera_brand, cameras.camera_serial, cameras.camera_name, cameras.camera_display, cameras.camera_id, kits.kit_id, kits.kit_display ORDER BY cameras.camera_display ASC', async (error, results) => {
            if(error){
                reject(error)
            }
            resolve(results.rows)
        })
    })
}
const swapLenses=(body)=>{
    const {lens_id, kit_id} = body.body
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
                if (error) {
                    reject(error)
                }
                pool.query('SELECT * FROM cameras WHERE kit_id = $1', [kit.kit_id], (err, cameras) => {
                    if (error) {
                        reject(error)
                    }
                    pool.query('SELECT * FROM users WHERE user_id = $1', [kit.user_id], (err, users) => {
                        if (error) {
                            reject(error)
                        }
                        const cameraList = cameras.rows
                        const user = users.rows[0]
                        const lensList = lenses.rows
                        kit = results.rows[0]
                        kit.cameras = cameraList
                        kit.lenses = lensList
                        kit.user = user
                        resolve(kit)
                    })
                })
            })
        })
    })

}
const createKit = (body) => {
    return new Promise(function(resolve, reject) {
        const {kit_display, city_id, kit_name, kit_type} = body
        pool.query('INSERT INTO kits (kit_name, kit_display, kit_type, city_id) VALUES ($3,$1,$4,$2)', [kit_display, city_id, kit_name, kit_type] , (error, results) => {
            if (error) {
                reject(error)
            }
            resolve(`A new kit has been added: ${results}`)
        })
    })
}
const createClient = (body) => {
    return new Promise( function(resolve, reject){
        const {client_firstname, client_lastname, client_phone, client_email, client_address1, client_address2, client_city, client_state, client_zip} = body
        pool.query('INSERT INTO clients(client_firstname, client_lastname, client_phone, client_email, client_address1, client_address2, client_city, client_state, client_zip)VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [client_firstname, client_lastname, client_phone, client_email, client_address1, client_address2, client_city, client_state, client_zip], (error, results) => {
            if(error){
                reject(error)
            }
            resolve(`A new client has been added: ${results}`)
        })
    })
}
const createVenue = (body) => {
    return new Promise(function(resolve, reject){
        const {venue_name, venue_address1, venue_address2, venue_city, venue_state, venue_zip, venue_contact, venue_phone, venue_email, venue_created_at} = body
        pool.query('INSERT INTO venues (venue_name, venue_address1, venue_address2, venue_city, venue_state, venue_zip, venue_contact, venue_phone, venue_email, venue_created_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [venue_name, venue_address1, venue_address2, venue_city, venue_state, venue_zip, venue_contact, venue_phone, venue_email, venue_created_at], (error, results) => {
            if(error){
                reject(error)
            }
            resolve(`A new venue has been added: ${results}`)
        })
    })
}
const createLens = (body) => {
    return new Promise(function(resolve, reject){
        const {lens_brand, lens_serial, lens_model, kit_id, lens_purchase_date, lens_img} = body
        pool.query('INSERT INTO lenses (lens_brand, lens_model_id, lens_serial, lens_model, kit_id, lens_purchase_date, lens_created_at, lens_updated_at, lens_img) SELECT $1,(SELECT COALESCE(MAX(lens_model_id) + 1,1)  FROM lenses WHERE lens_model = $3), $2, $3, $4, $5, NOW(), NOW(), $6', [lens_brand, lens_serial, lens_model, kit_id, lens_purchase_date, lens_img], (error, results) => {
            if(error){
                reject(error)
            }
            resolve(`A new lens has been added: ${results}`)
        })
    })
}
const createGearHistory = (body) => {
    return new Promise(function(resolve, reject){
        const {kit_id, lens_id, camera_id, history_message, history_target, history_sender, history_title, history_created_at, history_updated_at} = body
        pool.query('INSERT INTO gear_history (kit_id, lens_id, camera_id, history_message, history_target, history_sender, history_title, history_created_at, history_updated_at) SELECT $1, $2, $3, $4, $5, $6, $7, NOW(), NOW(),', [kit_id, lens_id, camera_id, history_message, history_target, history_sender, history_title, history_created_at, history_updated_at], (error, results) => {
            if(error){
                reject(error)
            }
            resolve(`A new lens has been added: ${results}`)
        })
    })
}
const createCamera = (body) => {
    return new Promise(function(resolve, reject){
        const {camera_brand, camera_name, camera_serial, camera_model, camera_display, kit_name} = body
        console.log("LENS BODY:", body)
        pool.query('INSERT INTO cameras (camera_brand, camera_name, camera_serial, camera_model, camera_display, kit_id) SELECT $1, $2, $3, $4, $5, kits.kit_id FROM kits WHERE kits.kit_name = $6', [camera_brand, camera_name, camera_serial, camera_model, camera_display, kit_name], (error, results) => {
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
    swapLenses,
    getEvents,
    createClient,
    createVenue,
    createCamera,
    getCameras,
    createGearHistory
}