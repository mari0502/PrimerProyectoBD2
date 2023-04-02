const redis = require('ioredis');

var notificacion = {
    mensaje: '',
    fecha: new Date()
};

const client = redis.createClient();
class RedisConsultant {
    constructor() { }

    sendNotification(user, userfollowing) {
        notificacion.mensaje = user + " ha subido un nuevo dataset.";
        client.hset(`notificaciones:${userfollowing}`, Date.now(), JSON.stringify(notificacion), (error, respuesta) => {
            if (error) {
                console.error('Error al guardar notificación:', error);
            } else {
                console.log('Notificación guardada exitosamente');
            }
        });
    }

    getUserNotifications(user){
        return new Promise(function (resolve, reject) {
            client.hgetall(`notificaciones:${user}`, (error, notificaciones) => {
                if (error) {
                  console.error('Error al recuperar notificaciones:', error);
                } else {
                  resolve(notificaciones);
                }
              });
          });
    }
}

module.exports = RedisConsultant;