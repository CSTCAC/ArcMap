const sqlite3 = require("sqlite3"); //.verbose();
const db = new sqlite3.Database(":memory:");

///-------------------------------------------- TABLES ------------------------------------------

const create_applications = `CREATE TABLE IF NOT EXISTS APPS (
  _ID INTEGER PRIMARY KEY AUTOINCREMENT,
  APP_ID VARCHAR(100) NOT NULL,
  APP_NAME VARCHAR(100) NOT NULL,
  DESCRIPTION TEXT
);`;

const create_flows = `CREATE TABLE IF NOT EXISTS FLOWS (
  _ID INTEGER PRIMARY KEY AUTOINCREMENT,
  FLOW_ID VARCHAR(100) NOT NULL,
  FLOW_NAME VARCHAR(100) NOT NULL,
  DESCRIPTION TEXT
);`;

const create_connections = `CREATE TABLE IF NOT EXISTS CONNS (
  CONN_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  FLOW_NAME VARCHAR(100),
  SOURCE_APP VARCHAR(100), 
  SOURCE_APP_ZONE VARCHAR(100),
  DEST_APP VARCHAR(100), 
  DEST_APP_ZONE VARCHAR(100),
  PROTOCOL VARCHAR(100),
  ENCRYPTION VARCHAR(100),
  SERVER_AUTHENTICATION VARCHAR(100),
  CLIENT_AUTHENTICATION VARCHAR(100),
  CLIENT_AUTHORISATION VARCHAR(100),
  SERVER_CRL VARCHAR(100),
  CLIENT_CRL VARCHAR(100),
  DESCRIPTION TEXT
);`;

const insert_applications = `INSERT INTO FLOWS (FLOW_ID, FLOW_NAME,DESCRIPTION) VALUES
('123','DEMO 1','DEMO APP 1'),
('456','DEMO 2','DEMO APP 2'),
('789','DEMO 3','DEMO APP 3');`

const insert_flows = `INSERT INTO APPS (APP_ID, APP_NAME,DESCRIPTION) VALUES
('123','APP 1','DEMO APP 1'),
('456','APP 2','DEMO APP 2'),
('456','APP 3','DEMO APP 3'),
('456','APP 4','DEMO APP 4'),
('456','APP 5','DEMO APP 5'),
('789','DEMO 6','DEMO APP 6');`



// Serialise the creation of the in memdb
db.serialize(function () {
  try {
    db.run(create_applications);
    db.run(create_flows);
    db.run(create_connections);
    db.run(insert_applications);
    db.run(insert_flows);
  } catch (e) {
    console.log(e);
  }
});

exports.inmem = db;