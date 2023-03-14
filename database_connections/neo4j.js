const neo4j = require('neo4j-driver');

var driver = neo4j.driver(
    'neo4j://localhost:7687',
    neo4j.auth.basic('neo4j', 'password')
);

var session = driver.session();

module.exports = session;
