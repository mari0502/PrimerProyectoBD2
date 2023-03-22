const redis = require('redis');
class RedisConsultant{
    constructor(){}

    async insertUser(user, foto, nombre, apellido1, apellido2){
        const client = redis.createClient();
        client.connect();
        var info = {
            foto: foto,
            nombre: nombre, 
            apellido1: apellido1, 
            apellido2: apellido2
        };
        var strinfo = JSON.stringify(info);
        await client.set(user, strinfo, async (err, reply) => {
            if (err) throw err;
        });
    }

}

module.exports = RedisConsultant;