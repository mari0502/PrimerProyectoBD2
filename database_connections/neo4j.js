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

    async addFollowRelation(followuser, userfollowing){
        const cypher = "MATCH (a:USER),(b:USER) WHERE a.user = $followuser AND b.user = $userfollowing CREATE (b)-[r:FOLLOWS]->(a) RETURN type(r)";
        const params = { followuser: followuser,
                         userfollowing: userfollowing };
        const res = await session.run(cypher, params);
    }

    async getIfUserFollowed(user, userfollowing){
        return new Promise(async function (resolve, reject) {
            const cypher = "MATCH (a:USER),(b:USER) WHERE a.user = $user AND b.user = $userfollowing OPTIONAL MATCH (a)-[r:FOLLOWS]->(b) RETURN r";
            const params = { user: user,
                             userfollowing: userfollowing };
            const res = await session.run(cypher, params);
            if(res.records.length > 0 && res.records[0]._fields[0]){
                resolve(true);
            }
            else{
                resolve(false);
            }
        });
    }

    async getUsersFollowingMe(user){
        return new Promise(async function (resolve, reject) {
            const cypher = "MATCH (followers:USER)-[:FOLLOWS]->(following:USER {user: $user}) RETURN followers";
            const params = { user: user};
            var users = [];
            const res = await session.run(cypher, params);
            res.records.forEach(record => {
                users.push(record.get("followers").properties.user);
            });
            resolve(users);
        });
    }
}

module.exports = Ne4jConsultor;