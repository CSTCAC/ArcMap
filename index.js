//-------------------- Declarations ----------------------TEST
const express = require("express");
const path = require("path");
const sqlite = require("./db");
const app = express();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const efu = require("express-fileupload")
const PORT = 80;

//-------------------- Configurations ----------------------
const securityHeaders = {};
const db = sqlite.inmem;

//-------------------- Start ----------------------
// Server configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "files")));
app.use(efu({
    limits: { fileSize: 5000 * 1024 * 1024 },
    abortOnLimit: true
}));

// --- middleware configuration
app.use(express.urlencoded({ extended: false }));

app.use(function (req, res, next) {
    const httpOK = 200;
    res.set(securityHeaders);
    res.removeHeader("X-Powered-by");
    res.status(httpOK);
    next();
});

app.disable("x-powered-by");

// Starting the server
app.listen(PORT, () => {
    console.log("Server started (http://localhost:80/) !");
});

//-------------------- Routing ----------------------
// GET / -- this is the home page button
app.get("/", (req, res) => {
    const connSql = `SELECT c.CONN_ID, c.SOURCE_ASSET_ID,
    c.DEST_ASSET_ID,c.PROTOCOL,c.ENCRYPTION,c.SERVER_AUTHENTICATION,
    c.CLIENT_AUTHENTICATION,c.CLIENT_AUTHORISATION,c.SERVER_CRL,
    c.CLIENT_CRL,c.DESCRIPTION,s.ASSET_NAME as 'SOURCE_ASSET_NAME',
    s.ASSET_ZONE as 'SOURCE_ASSET_ZONE',d.ASSET_NAME as 'DEST_ASSET_NAME',
    d.ASSET_ZONE as 'DEST_ASSET_ZONE' from CONNS c 
    left join ASSETS s on c.SOURCE_ASSET_ID = s.ASSET_ID
    left join ASSETS d on c.DEST_ASSET_ID = d.ASSET_ID
    `;

    const appZone = `SELECT s.ASSET_NAME as 'ASSET',
                    s.ASSET_ZONE as 'ASSET_ZONE' from CONNS c
                    left join ASSETS s on c.SOURCE_ASSET_ID = s.ASSET_ID
                    UNION SELECT s.ASSET_NAME as 'ASSETP',
                    s.ASSET_ZONE as 'ASSET_ZONE' from CONNS c
                    left join ASSETS s on c.DEST_ASSET_ID = s.ASSET_ID
                    `;

    const assetList = "SELECT * FROM ASSETS"
    const obj = {}
    db.all(connSql, [], (err, rows) => {
        obj.d1 = rows;
        db.all(appZone, [], (err, rows) => {
            obj.d3 = rows;
            db.all(assetList, [], (err, rows) => {

                obj.d2 = rows;
                res.render("index", {
                    model: obj.d1, model2: obj.d2, model3: obj.d3
                });
            });
        });
    });
});

//save map
app.get("/mapSave", (req, res) => {
    res.render("./includes/mapSave");
});

app.post("/mapSave", (req, res) => {
    const sqlA = "SELECT * FROM ASSETS"
    const sqlC = "SELECT * FROM CONNS"
    const fn = req.body.fn
    const obj = {}
    db.all(sqlC, (err, rows) => {
        if (err) {
            return console.log(err);
        }
        obj.f1 = rows
        db.all(sqlA, (err, rows) => {
            if (err) {
                return console.log(err);
            }
            obj.f2 = rows
            const assetContent = JSON.stringify(obj.f2)
            const connContent = JSON.stringify(obj.f1)
            const allContent = assetContent + connContent
            fs.writeFile('./files/' + fn + ".json", allContent, function (err, result) {
                if (err) console.log('error', err);
            });
            res.redirect("/download/" + fn + ".json");
        });
    });
});

app.get('/download/:fn', function (req, res) {
    const fn = [req.params.fn]
    const file = "./files/" + fn;
    res.set({ 'Location': "/" });
    res.download(file); // Set disposition and send it.
});

//load map
app.get("/mapLoad", (req, res) => {
    res.render("./includes/mapLoad");
});

app.post("/mapLoad", async (req, res) => {
    const f = [req.files.file]
    console.log(f)
    await req.files.file.mv("./files/" + req.files.file.name)

    const fileContents = fs.readFileSync("./files/" + req.files.file.name, 'utf8')
    try {
        const pos = fileContents.indexOf("]") + 1;
        const asset = fileContents.substring(0, pos)
        const a = JSON.parse(asset)
        const conn = fileContents.substring(pos)
        const c = JSON.parse(conn)

        a.forEach(element => {
            const sql = "INSERT INTO ASSETS (ASSET_ID,ASSET_NAME,ASSET_ZONE,DESCRIPTION) VALUES (?,?,?,?)"
            const vals = [element.ASSET_ID, element.ASSET_NAME, element.ASSET_ZONE, element.DESCRIPTION]
            db.run(sql, vals)
        });
        c.forEach(element => {
            const sql = "INSERT INTO CONNS (CONN_ID,SOURCE_ASSET_ID,DEST_ASSET_ID,PROTOCOL,ENCRYPTION,SERVER_AUTHENTICATION,CLIENT_AUTHENTICATION,CLIENT_AUTHORISATION,SERVER_CRL,CLIENT_CRL,DESCRIPTION) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
            const vals = [element.CONN_ID, element.SOURCE_ASSET_ID, element.DEST_ASSET_ID, element.PROTOCOL, element.ENCRYPTION, element.SERVER_AUTHENTICATION, element.CLIENT_AUTHENTICATION, element.CLIENT_AUTHORISATION, element.SERVER_CRL, element.CLIENT_CRL, element.DESCRIPTION]
            db.run(sql, vals)
        });
    } catch (err) {
        console.error(err)
    }
    res.redirect("/")
})

//new map
app.get("/mapNew", (req, res) => {
    res.render("./includes/mapNew");
});

app.post("/mapNew", (req, res) => {
    const sql = "DELETE FROM ASSETS"
    const sqlD = "DELETE FROM CONNS"
    db.run(sqlD, err => {
        db.run(sql, err => {
            res.redirect("/");
        });
    });
});

//ADD ASSET
app.get("/assetAdd", (req, res) => {
    res.render("./includes/assetAdd");
});

app.post("/assetAdd", (req, res) => {
    const vals = [uuidv4(), req.body.assetName, req.body.zoneName, req.body.description];
    const sql = "INSERT INTO ASSETS (ASSET_ID,ASSET_NAME,ASSET_ZONE,DESCRIPTION) VALUES (?,?,?,?)"
    db.run(sql, vals, err => {
        if (err) {
            return console.error(err.message);
        }
        res.redirect("/");
    });
});

//EDIT ASSET ------ see if possible to edit all of the connections table on edit would need old name and new name?
app.get("/assetEdit/:id", (req, res) => {
    const id = [req.params.id];
    const sql = "SELECT * FROM ASSETS WHERE ASSET_ID=?";
    db.get(sql, id, (err, rows) => {
        res.render("./includes/assetEdit", { model: rows });
    });
});

app.post("/assetEdit/:id", (req, res) => {
    const vals = [req.body.assetName, req.body.zoneName, req.body.description, req.params.id];
    const sql = "UPDATE ASSETS SET ASSET_NAME=?,ASSET_ZONE=?,DESCRIPTION=? WHERE ASSET_ID=?"
    db.run(sql, vals, err => {
        if (err) {
            return console.error(err.message);
        }
        res.redirect("/");
    });
});

//DELETE ASSET
app.get("/assetDelete/:id", (req, res) => {
    const id = [req.params.id];
    const sql = "SELECT * FROM ASSETS WHERE ASSET_ID=?";
    db.get(sql, id, (err, rows) => {
        res.render("./includes/assetDelete", { model: rows });
    });
});

app.post("/assetDelete/:id", (req, res) => {
    const vals = [req.params.id];
    const delvals = [req.params.id, req.params.id];
    const sql = "DELETE FROM ASSETS WHERE ASSET_ID=?"
    const sqlD = "DELETE FROM CONNS WHERE SOURCE_ASSET_ID=? OR DEST_ASSET_ID =?"

    db.run(sqlD, delvals, err => {
        db.run(sql, vals, err => {

            res.redirect("/");
        });
    });
});

//Create Connection
app.get("/connectionAdd", (req, res) => {

    const assetList = "SELECT * FROM ASSETS"
    db.all(assetList, [], (err, rows) => {
        res.render("./includes/connectionAdd", {
            assetModel: rows
        });
    });
});

// CREATE CONN
app.post("/connectionAdd", (req, res) => {
    const vals = [uuidv4(), req.body.sourceApp, req.body.destApp, req.body.proto, req.body.enc, req.body.serverAuth, req.body.clientAuth, req.body.clientAuthz, req.body.serverCRL, req.body.clientCRL, req.body.desc];
    const sql = "INSERT INTO CONNS (CONN_ID,SOURCE_ASSET_ID,DEST_ASSET_ID,PROTOCOL,ENCRYPTION,SERVER_AUTHENTICATION,CLIENT_AUTHENTICATION,CLIENT_AUTHORISATION,SERVER_CRL,CLIENT_CRL,DESCRIPTION) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
    db.run(sql, vals, err => {
        if (err) {
            return console.error(err.message);
        }
        res.redirect("/");
    });
});


//Edit Connection
app.get("/connectionEdit/:id", (req, res) => {
    const id = [req.params.id];
    const sql = `SELECT c.CONN_ID, c.SOURCE_ASSET_ID,
    c.DEST_ASSET_ID,c.PROTOCOL,c.ENCRYPTION,c.SERVER_AUTHENTICATION,
    c.CLIENT_AUTHENTICATION,c.CLIENT_AUTHORISATION,c.SERVER_CRL,
    c.CLIENT_CRL,c.DESCRIPTION,s.ASSET_NAME as 'SOURCE_ASSET_NAME',
    s.ASSET_ZONE as 'SOURCE_ASSET_ZONE',d.ASSET_NAME as 'DEST_ASSET_NAME',
    d.ASSET_ZONE as 'DEST_ASSET_ZONE' from CONNS c 
    left join ASSETS s on c.SOURCE_ASSET_ID = s.ASSET_ID
    left join ASSETS d on c.DEST_ASSET_ID = d.ASSET_ID
    WHERE c.CONN_ID=?`;

    const assetList = "SELECT * FROM ASSETS"
    const obj = {}
    db.get(sql, id, (err, rows) => {
        obj.d1 = rows;
        db.all(assetList, [], (err, rows) => {
            obj.d2 = rows;
            res.render("./includes/connectionEdit", { model: obj.d1, assetModel: obj.d2 });
        });
    });
});

app.post("/connectionEdit/:id", (req, res) => {
    const vals = [req.body.sourceApp, req.body.destApp, req.body.proto, req.body.enc, req.body.serverAuth, req.body.clientAuth, req.body.clientAuthz, req.body.serverCRL, req.body.clientCRL, req.body.desc, req.params.id];
    const sql = "UPDATE CONNS SET SOURCE_ASSET_ID=?,DEST_ASSET_ID=?,PROTOCOL=?,ENCRYPTION=?,SERVER_AUTHENTICATION=?,CLIENT_AUTHENTICATION=?,CLIENT_AUTHORISATION=?,SERVER_CRL=?,CLIENT_CRL=?,DESCRIPTION=? WHERE CONN_ID=?"
    db.run(sql, vals, err => {
        if (err) {
            return console.error(err.message);
        }
        res.redirect("/");
    });
});

// Clone Connection
app.get("/connectionClone/:id", (req, res) => {
    const id = [req.params.id];
    const sql = `SELECT c.CONN_ID, c.SOURCE_ASSET_ID,
    c.DEST_ASSET_ID,c.PROTOCOL,c.ENCRYPTION,c.SERVER_AUTHENTICATION,
    c.CLIENT_AUTHENTICATION,c.CLIENT_AUTHORISATION,c.SERVER_CRL,
    c.CLIENT_CRL,c.DESCRIPTION,s.ASSET_NAME as 'SOURCE_ASSET_NAME',
    s.ASSET_ZONE as 'SOURCE_ASSET_ZONE',d.ASSET_NAME as 'DEST_ASSET_NAME',
    d.ASSET_ZONE as 'DEST_ASSET_ZONE' from CONNS c 
    left join ASSETS s on c.SOURCE_ASSET_ID = s.ASSET_ID
    left join ASSETS d on c.DEST_ASSET_ID = d.ASSET_ID
    WHERE c.CONN_ID=?`;

    const assetList = "SELECT * FROM ASSETS"
    const obj = {}
    db.get(sql, id, (err, rows) => {
        obj.d1 = rows;
        db.all(assetList, [], (err, rows) => {
            obj.d2 = rows;
            res.render("./includes/connectionClone", { model: obj.d1, assetModel: obj.d2 });
        });
    });
});

app.post("/connectionClone", (req, res) => {
    const vals = [uuidv4(), req.body.sourceApp, req.body.destApp, req.body.proto, req.body.enc, req.body.serverAuth, req.body.clientAuth, req.body.clientAuthz, req.body.serverCRL, req.body.clientCRL, req.body.desc];
    const sql = "INSERT INTO CONNS (CONN_ID,SOURCE_ASSET_ID,DEST_ASSET_ID,PROTOCOL,ENCRYPTION,SERVER_AUTHENTICATION,CLIENT_AUTHENTICATION,CLIENT_AUTHORISATION,SERVER_CRL,CLIENT_CRL,DESCRIPTION) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
    db.run(sql, vals, err => {
        if (err) {
            return console.error(err.message);
        }
        res.redirect("/");
    });
});

//Del Connection
app.get("/connectionDelete/:id", (req, res) => {
    const id = [req.params.id];
    const sql = `SELECT c.CONN_ID, c.SOURCE_ASSET_ID,
    c.DEST_ASSET_ID,c.PROTOCOL,c.ENCRYPTION,c.SERVER_AUTHENTICATION,
    c.CLIENT_AUTHENTICATION,c.CLIENT_AUTHORISATION,c.SERVER_CRL,
    c.CLIENT_CRL,c.DESCRIPTION,s.ASSET_NAME as 'SOURCE_ASSET_NAME',
    s.ASSET_ZONE as 'SOURCE_ASSET_ZONE',d.ASSET_NAME as 'DEST_ASSET_NAME',
    d.ASSET_ZONE as 'DEST_ASSET_ZONE' from CONNS c 
    left join ASSETS s on c.SOURCE_ASSET_ID = s.ASSET_ID
    left join ASSETS d on c.DEST_ASSET_ID = d.ASSET_ID
    WHERE c.CONN_ID=?`;
    db.get(sql, id, (err, rows) => {
        res.render("./includes/connectionDelete", { model: rows });
    });
});

app.post("/connectionDelete/:id", (req, res) => {
    const vals = [req.params.id];
    const sql = "DELETE FROM CONNS WHERE CONN_ID=?"
    db.run(sql, vals, err => {
        if (err) {
            return console.error(err.message);
        }
        res.redirect("/");
    });
});