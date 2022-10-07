const sqlite3 = require("sqlite3"); //.verbose();
const db = new sqlite3.Database(":memory:");


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

db.serialize(function () {
  try {
    db.run(create_assets);
    db.run(create_connections);
  } catch (e) {
    console.log(e);
  }
});

exports.inmem = db;