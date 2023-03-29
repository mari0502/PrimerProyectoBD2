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

    async addCreateRelation(name, user){
        const cypher = "MATCH (a:USER),(b:DATASET) WHERE a.user = $user AND b.name = $name CREATE (a)-[r:CREATES]->(b) RETURN type(r)"
        const params = { user: user,
                         name: name };
        const res = await session.run(cypher, params);
    }

    async insertDataSet(name, user){
        const cypher = "CREATE (n:DATASET {name: $name}) RETURN n";
        const params = { name: name };
        const res = await session.run(cypher, params);
        const res2 = await this.addCreateRelation(name, user);

    }
}

module.exports = Ne4jConsultor;