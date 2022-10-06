const sqlite3 = require("sqlite3"); //.verbose();
const db = new sqlite3.Database(":memory:");
const { v4: uuidv4 } = require('uuid');


///-------------------------------------------- TABLES ------------------------------------------

const create_assets = `CREATE TABLE IF NOT EXISTS ASSETS (
  ASSET_ID VARCHAR(100) NOT NULL,
  ASSET_NAME VARCHAR(100) NOT NULL,
  ASSET_ZONE VARCHAR(100) NOT NULL,
  DESCRIPTION TEXT
);`;

const create_connections = `CREATE TABLE IF NOT EXISTS CONNS (
  CONN_ID VARCHAR(100) PRIMARY KEY,
  SOURCE_ASSET_ID VARCHAR(100), 
  DEST_ASSET_ID VARCHAR(100), 
  PROTOCOL VARCHAR(100),
  ENCRYPTION VARCHAR(100),
  SERVER_AUTHENTICATION VARCHAR(100),
  CLIENT_AUTHENTICATION VARCHAR(100),
  CLIENT_AUTHORISATION VARCHAR(100),
  SERVER_CRL VARCHAR(100),
  CLIENT_CRL VARCHAR(100),
  DESCRIPTION TEXT
);`;


const insert_conns = `INSERT INTO CONNS (
  CONN_ID,
  SOURCE_ASSET_ID,
  DEST_ASSET_ID,
  PROTOCOL,
  ENCRYPTION,
  SERVER_AUTHENTICATION,
  CLIENT_AUTHENTICATION,
  CLIENT_AUTHORISATION, 
  SERVER_CRL,
  CLIENT_CRL,
  DESCRIPTION) VALUES
  ('` + uuidv4()+ `' ,'1234','5678','HTTPS','TLS 1.2','Certificate Based','Secret','ID Based','Client Checks','N/A','Conn between A and B');`


  const insert_assets = `INSERT INTO ASSETS (
    ASSET_ID,ASSET_NAME,ASSET_ZONE,DESCRIPTION) 
    VALUES
    ('1234','Client Device','A','Client mobile or web device'),
    ('5678','Attacker Device','B','Client mobile or web device'),
    ('` + uuidv4()+ `','DDoS Protection','A','as said'),
    ('` + uuidv4()+ `','2','3','4'),
    ('` + uuidv4()+ `','2','3','4'),
     ('` + uuidv4()+ `','2','3','4');`


 

// Serialise the creation of the in memdb
db.serialize(function () {
  try {
    db.run(create_assets);
    db.run(create_connections);
    //db.run(insert_conns);
    //db.run(insert_assets);

  } catch (e) {
    console.log(e);
  }
});

exports.inmem = db;