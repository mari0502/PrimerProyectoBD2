const neo4j = require('neo4j-driver');

var driver = neo4j.driver(
    'neo4j://localhost:7687',
    neo4j.auth.basic('neo4j', 'password')
);

var session = driver.session();

class Ne4jConsultor {
    constructor(){}

    async insertUser(user){
        const cypher = "CREATE (u:USER {user: $user }) RETURN u";
        const params = { user: user };
        const res = await session.run(cypher, params);
    }
}

module.exports = Ne4jConsultor;