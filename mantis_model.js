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
        pool.query('SELECT * FROM events LEFT JOIN venues v ON v.venue_id = events.venue_id', async (error, results) => {
            if(error){
                reject(error)
            }
            resolve(results.rows)
        })
    })
}

const getEvent = (id) => {
    return new Promise( function(resolve, reject) {
        let event
        pool.query('SELECT * FROM events WHERE event_id = $1',[id], async (error, results) => {
            if(error){
                reject(error)
            }
            event = results.rows[0]
            pool.query('SELECT * FROM clients WHERE client_id = $1', [event.primary_client_id],(err, primaryClient) => {
                if (error) {
                    reject(error)
                }
                pool.query('SELECT * FROM clients WHERE client_id = $1', [event.secondary_client_id], (err, secondaryClient) => {
                    if (error) {
                        reject(error)
                    }
                    pool.query('SELECT * FROM venues WHERE venue_id = $1', [event.venue_id], (err, venueInfo) => {
                        if (error) {
                            reject(error)
                        }
                        const venue = venueInfo
                        const primaryContact = primaryClient.rows[0]
                        const secondaryContact = secondaryClient.rows[0]
                        event = results.rows[0]
                        event.venue = venue
                        event.primary_contact = primaryContact
                        event.secondary_contact = secondaryContact
                        resolve(event)
                    })
                })
            })
        })
    })
}

const getKits= () => {
    return new Promise(function(resolve, reject) {
        pool.query('select * from kits_fully order by kits_fully.kit_display', async (error, results) => {
            if (error) {
                reject(error)
            }
            resolve(results.rows);
        })
    })
}
const getClients= () => {
    return new Promise(function(resolve, reject) {
        pool.query('select * from clients', async (error, results) => {
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
const getLens = (id) => {
    return new Promise( function(resolve,reject) {
        pool.query('SELECT lenses.*, kits.kit_display FROM kits RIGHT JOIN lenses ON lenses.kit_id = kits.kit_id WHERE lenses.lens_id = $1', [id], async (error, results) => {
            if(error){
                reject(error)
            }
            resolve(results.rows[0])
        })
    })
}
const getCameras = () => {
    return new Promise( function(resolve,reject) {
        pool.query('SELECT cameras.*, kits.kit_display FROM kits RIGHT JOIN cameras ON cameras.kit_id = kits.kit_id GROUP BY cameras.kit_id, cameras.camera_model, cameras.camera_brand, cameras.camera_serial, cameras.camera_img, cameras.camera_display, cameras.camera_id, kits.kit_id, kits.kit_display ORDER BY cameras.camera_display ASC', async (error, results) => {
            if(error){
                reject(error)
            }
            resolve(results.rows)
        })
    })
}
const getCamera = (id) => {
    return new Promise( function(resolve,reject) {
        pool.query('SELECT cameras.*, kits.kit_display FROM kits RIGHT JOIN cameras ON cameras.kit_id = kits.kit_id WHERE cameras.camera_id = $1',[id], async (error, results) => {
            if(error){
                reject(error)
            }
            resolve(results.rows[0])
        })
    })
}
const getUsers = () => {
    return new Promise( function(resolve,reject) {
        pool.query('select * from users u left join cities c on u.city_id = c.city_id', async (error, results) => {
            if(error){
                reject(error)
            }
            resolve(results.rows)
        })
    })
}
const getUser = (id) => {
    return new Promise( function(resolve,reject) {
        pool.query('SELECT * FROM users WHERE user_id = $1', [id], async (error, results) => {
            if(error){
                reject(error)
            }
            resolve(results.rows)
            console.log("USER RESULT:", results.rows)
        })
    })
}
const createUser = (body) => {
    return new Promise( function(resolve, reject){
        const {user_firstname, user_lastname, user_email, user_google_id, user_img} = body
        pool.query('INSERT INTO users(user_firstname, user_lastname, user_email, user_google_id, user_img) SELECT $1, $2, $3, $4, $5', [user_firstname, user_lastname, user_email, user_google_id, user_img],async (error, results) => {
            if(error){
                reject(error)
            }
            resolve(`A new user has been added: ${results}`)
        })
    })
}
const updateUserKit = (body) => {
    console.log("USER UPDATE", body)
    return new Promise( function(resolve, reject){
        const {user_id, kit_id} = body
        pool.query('UPDATE users SET kit_id = $2 WHERE user_id = $1', [user_id, kit_id], async(error, results) => {
            if(error){
                console.log("UPDATE USER ERROR", error)
                reject(error)
            }
            resolve(`User has been updated ${results}`)
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
const swapCameras=(body)=>{
    const {camera_id, kit_id} = body.body
    return new Promise(function(resolve,reject){
        pool.query('UPDATE cameras SET kit_id = $2 WHERE camera_id = $1', [camera_id,kit_id],async(error,results)=>{
            if(error){
                reject(error)
            }
            resolve(`Camera has been moved to new kit:${results} `)
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
        const {kit_display, city_id, kit_type, kit_case_style} = body
        pool.query('INSERT INTO kits (kit_display, kit_type, city_id, kit_case_style) VALUES ($1,$3,$2,$4) RETURNING *', [kit_display, city_id, kit_type, kit_case_style] ,async (error, results) => {
            if (error) {
                reject(error)
            }
            resolve(results.rows)
        })
    })
}
const createClient = (body) => {
    return new Promise( function(resolve, reject){
        const {client_firstname, client_lastname, client_phone, client_email, client_address1, client_address2, client_city, client_state, client_zip} = body
        pool.query('INSERT INTO clients(client_firstname, client_lastname, client_phone, client_email, client_address1, client_address2, client_city, client_state, client_zip)VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [client_firstname, client_lastname, client_phone, client_email, client_address1, client_address2, client_city, client_state, client_zip],async (error, results) => {
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
        pool.query('INSERT INTO venues (venue_name, venue_address1, venue_address2, venue_city, venue_state, venue_zip, venue_contact, venue_phone, venue_email, venue_created_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [venue_name, venue_address1, venue_address2, venue_city, venue_state, venue_zip, venue_contact, venue_phone, venue_email, venue_created_at],async (error, results) => {
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
        pool.query('INSERT INTO lenses (lens_brand, lens_model_id, lens_serial, lens_model, kit_id, lens_purchase_date, lens_created_at, lens_updated_at, lens_img) SELECT $1,(SELECT COALESCE(MAX(lens_model_id) + 1,1)  FROM lenses WHERE lens_model = $3), $2, $3, $4, $5, NOW(), NOW(), $6 RETURNING *', [lens_brand, lens_serial, lens_model, kit_id, lens_purchase_date, lens_img],async (error, results) => {
            if(error){
                reject(error)
            }
            resolve(results)
        })
    })
}
const createGearHistory = (body) => {
    return new Promise(function(resolve, reject){
        const {kit_id, lens_id, history_message, history_target, history_sender, history_title, camera_id} = body
        pool.query('INSERT INTO gear_history (kit_id, lens_id, history_message, history_target, history_sender, history_title, history_created_at, history_updated_at, camera_id) SELECT $1, $2, $3, $4, $5, $6, NOW(), NOW(), $7 RETURNING *', [kit_id, lens_id, history_message, history_target, history_sender, history_title, camera_id],async (error, results) => {
            if(error){
                reject(error)
            }
            resolve(results)
        })
    })
}
const getKitHistory = (id) => {
    return new Promise( function(resolve,reject) {
        pool.query('SELECT * FROM gear_history WHERE kit_id = $1 ORDER BY history_updated_at DESC', [id], async (error, results) => {
            if(error){
                reject(error)
            }
            resolve(results.rows)
        })
    })
}
const createCamera = (body) => {
    return new Promise(function(resolve, reject){
        const {camera_brand, camera_serial, camera_model, kit_id, camera_img} = body
        pool.query('INSERT INTO cameras (camera_brand, camera_serial, camera_model, camera_img, kit_id, camera_created_at, camera_updated_at) SELECT $1, $2, $3, $5, $4, NOW(), NOW() RETURNING *', [camera_brand,camera_serial, camera_model, kit_id, camera_img],async (error, results) => {
            if(error){
                reject(error)
            }
            resolve(results)
        })
    })
}
const loadOutKit = (body) => {
    const {user_id, kit_id} = body
    return new Promise(function(resolve, reject){
        pool.query(`UPDATE kits SET user_id = $1, kit_status = 'Loaded Out' WHERE kit_id = $2`, [user_id, kit_id], async(error, results) => {
            if (error) {
                reject(error)
            }
            resolve(`Kit loaded out: ${results}`)
        })
    })
}
const loadInKit = (body) => {
    const {kit_id} = body
    return new Promise(function(resolve, reject){
        pool.query(`UPDATE kits SET user_id = null, kit_status = 'In Office' WHERE kit_id = $1`, [kit_id], async(error, results) => {
            if (error) {
                reject(error)
            }
            resolve(`Kit Loaded in: ${results}`)
        })
    })
}
const deleteKit = (id) => {
    return new Promise(function(resolve, reject) {
        pool.query('DELETE FROM kits WHERE kit_id = $1', [id],async (error, results) => {
            if (error) {
                reject(error)
            }
            resolve(`Merchant deleted with ID: ${id}`)
        })
    })
}
const getCities = () => {
    return new Promise(function(resolve, reject){
        pool.query('SELECT * FROM cities', async (error,results)=>{
            if(error){
                reject(error)
            }
            resolve(results.rows)
        })
    })
}
const fakeImgurUpload = () => {
    return new Promise( function(resolve, reject) {
        {
            if(true){
            resolve({
                    data: {
                        link: 'https://i.imgur.com/z4v3Jd2.gif'
                    }
            })
        }}
    })
}

module.exports = {
    getKits,
    getKit,
    createKit,
    deleteKit,
    getCities,
    loadOutKit,
    loadInKit,
    createLens,
    getLenses,
    getLens,
    swapLenses,
    getEvents,
    createClient,
    createVenue,
    createCamera,
    getCameras,
    getCamera,
    createGearHistory,
    getKitHistory,
    swapCameras,
    fakeImgurUpload,
    getUsers,
    getUser,
    createUser,
    updateUserKit,
    getEvent,
    getClients,
}