const getKit = (id) => {
    return new Promise(function(resolve, reject) {
        let kit
        pool.query('SELECT * FROM kits WHERE id = $1', [id],async (error, results) => {
            if(error){
                reject(error)
            }
            kit = results.rows[0]
            pool.query('SELECT * FROM lenses WHERE kit_id = $1', [kit.id],(err, lenses) => {
                if(error){
                    reject(error)
                }
                pool.query('SELECT * FROM users WHERE id = $1', [kit.user_id],(err, users) => {
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