//-------------------- Declarations ----------------------
const express = require("express");
const path = require("path");
const sqlite = require("./db");
const app = express();
const PORT = 80;

//-------------------- Configurations ----------------------
const securityHeaders = {

};

const db = sqlite.inmem;

//-------------------- Start ----------------------
// Server configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// --- middleware configuration
app.use(express.urlencoded({extended: false}));

app.use(function (req, res, next) {
    const httpOK = 200;
    res.set(securityHeaders);
    res.removeHeader("X-Powered-by");
    res.status(httpOK);
    next();
});

app.disable("x-powered-by");

// SetDB
// Starting the server
const runPort=80;
app.listen(runPort, () => {
    console.log("Server started (http://localhost:80/) !");
});

//-------------------- Routing ----------------------
// GET / -- this is the home page button
app.get("/", (req, res) => {
      res.render("index", );

});

app.get("/profile", (req, res) => {
    if (req.oidc.isAuthenticated() === true) {
        res.render("profile", {
            aBText: "Logout",
            aBLink: "/logout",
            aBPic: req.oidc.user.picture,
            model: req.oidc.user
        });
    } else {
        res.render("profile", {aBText: "Login", aBLink: "/login", aBPic: "", model: req.oidc.user});
    }
});


app.get("/asset_types", (req, res) => {
    const sql = "SELECT * FROM Asset_Types ORDER BY AT_Name";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        if (req.oidc.isAuthenticated() === true) {
            res.render("assetTypeView", {
                aBText: "Logout",
                aBLink: "/logout",
                aBPic: req.oidc.user.picture,
                model: rows
            });
        } else {
            res.render("assetTypeView", {
                aBText: "Login",
                aBLink: "/login",
                aBPic: "",
                model: rows
            });
        }
    });
});


app.get("/asset_type_threats", (req, res) => {
    const sql = "SELECT * FROM Asset_Type_Threats ORDER BY AT_Name";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }

        if (req.oidc.isAuthenticated() === true) {
            res.render("assetTypeThreatView", {
                aBText: "Logout",
                aBLink: "/logout",
                aBPic: req.oidc.user.picture,
                model: rows
            });
        } else {
            res.render("assetTypeThreatView", {
                aBText: "Login",
                aBLink: "/login",
                aBPic: "",
                model: rows
            });
        }
    });
});


///-------------------------------------------- CONNS --------------------------------------------
// CONNECTIONS VIEW
app.get("/conn", (req, res) => {
    const sql = "SELECT * FROM CONNS ORDER BY CONN_ID";
    db.all(sql,  (err, rows) => {
            res.render("connectionsView", {model:rows});});
    });

//CONNECTIONS CREATE
app.get("/createConn", (req, res) => {
    const sql = "SELECT * FROM ASSET_TYPES ORDER BY AT_ID";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }

        if (req.oidc.isAuthenticated() === true) {
            res.render("connectionsCreate", {
                aBText: "Logout",
                aBLink: "/logout",
                aBPic: req.oidc.user.picture,
                model: rows
            });
        } else {
            res.render("connectionsCreate", {
                aBText: "Login",
                aBLink: "/login",
                aBPic: "",
                model: rows
            });
        }
    });
});

app.get("/createConnFromT/:id", (req, res) => {
    const id = [req.params.id, req.oidc.user.email];
    const sql = "SELECT * FROM asset_types";
    const sql1 = "SELECT * FROM CONNS WHERE CONN_ID = ? AND CONN_USER_NAME=?";
    const obj = {};
    db.all(sql, [], (err, row) => {

        if (err) {
            return console.error(err.message);
        }

        obj.d2 = row;
        db.get(sql1, id, (err, row) => {
            obj.d1 = row;
            if (req.oidc.isAuthenticated() === true) {
                res.render("connectionsCreateFromT", {
                    aBText: "Logout",
                    aBLink: "/logout",
                    aBPic: req.oidc.user.picture,
                    model: obj.d1, model2: obj.d2
                });
            } else {
                res.render("connectionsCreateFromT", {
                    aBText: "Login",
                    aBLink: "/login",
                    aBPic: "",
                    model: obj.d1, model2: obj.d2
                });
            }
        });
    });
});

app.get("/createConnFromF/:id", (req, res) => {
    const id = [req.params.id, req.oidc.user.email];
    const sql = "SELECT * FROM asset_types";
    const sql1 = "SELECT * FROM CONNS WHERE CONN_ID = ? AND CONN_USER_NAME=?";
    const obj = {};
    db.all(sql, [], (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        obj.d2 = row;
        db.get(sql1, id, (err, row) => {
            obj.d1 = row;

            if (req.oidc.isAuthenticated() === true) {
                res.render("connectionsCreateFromF", {
                    aBText: "Logout",
                    aBLink: "/logout",
                    aBPic: req.oidc.user.picture,
                    model: obj.d1, model2: obj.d2
                });
            } else {
                res.render("connectionsCreateFromF", {
                    aBText: "Login",
                    aBLink: "/login",
                    aBPic: "",
                    model: obj.d1, model2: obj.d2
                });
            }
        });
    });
});


//CONNECTIONS CREATE POST
app.post("/createConn", (req, res) => {
    const sql = "INSERT INTO CONNS (CONN_FROM,CONN_FROM_ASSET_TYPE,CONN_FROM_ZONE,CONN_PROTOCOL, CONN_TO,CONN_TO_ASSET_TYPE,CONN_TO_ZONE,Notes, CONN_USER_NAME) VALUES (?, ?, ?,?,?,?,?,?,?)";
    const newconn = [req.body.CONN_FROM, req.body.CONN_FROM_ASSET_TYPE, req.body.CONN_FROM_ZONE, req.body.CONN_PROTOCOL, req.body.CONN_TO, req.body.CONN_TO_ASSET_TYPE, req.body.CONN_TO_ZONE, req.body.Notes, req.oidc.user.email];
    db.run(sql, newconn, err => {
        if (err) {
            return console.error(err.message);
        }
        res.redirect("/conn");
    });
});

//CONNECTIONS EDIT
app.get("/editConn/:id",(req, res) => {
    const id = [req.params.id, req.oidc.user.email];
    const sql = "SELECT * FROM asset_types";
    const sql1 = "SELECT * FROM CONNS WHERE CONN_ID = ? AND CONN_USER_NAME=?";
    const obj = {};

    db.all(sql, [], (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        obj.d2 = row;
        db.get(sql1, id, (err, row) => {
            obj.d1 = row;

            if (req.oidc.isAuthenticated() === true) {
                res.render("connectionsEdit", {
                    aBText: "Logout",
                    aBLink: "/logout",
                    aBPic: req.oidc.user.picture,
                    model: obj.d1, model2: obj.d2
                });
            } else {
                res.render("connectionsEdit", {
                    aBText: "Login",
                    aBLink: "/login",
                    aBPic: "",
                    model: obj.d1, model2: obj.d2
                });
            }
        });
    });
});

//////////////////////NEEDS TO PREVENT TRAVERSAL //////////////////////NEEDS TO PREVENT TRAVERSAL//////////////////////NEEDS TO PREVENT TRAVERSAL //////////////////////NEEDS TO PREVENT TRAVERSAL //////////////////////NEEDS TO PREVENT TRAVERSAL
//CONNECTIONS EDIT POST
app.post("/editConn/:id", (req, res) => {
    const id = req.params.id;
    const sql = "UPDATE CONNS SET CONN_FROM =?       ,CONN_FROM_ASSET_TYPE=?,       CONN_FROM_ZONE=?,       CONN_PROTOCOL=?,       CONN_TO=?,        CONN_TO_ASSET_TYPE=?,   CONN_TO_ZONE=?,          Notes=? WHERE CONN_ID=? AND CONN_USER_NAME=?";
    const conn = [req.body.CONN_FROM, req.body.CONN_FROM_ASSET_TYPE, req.body.CONN_FROM_ZONE, req.body.CONN_PROTOCOL, req.body.CONN_TO, req.body.CONN_TO_ASSET_TYPE, req.body.CONN_TO_ZONE, req.body.Notes, id, req.oidc.user.email];
    db.run(sql, conn, err => {
        if (err) {
            return console.error(err.message);
        }
        res.redirect("/conn");
    });
});


app.get("/threatGraph", (req, res) => {
    const sql = "SELECT REPLACE(c.CONN_FROM,' ','_') as CONN_FROM, REPLACE(c.CONN_PROTOCOL,' ','_') as CONN_PROTOCOL, REPLACE(c.CONN_TO,' ','_') as CONN_TO FROM CONNS c where CONN_USER_NAME=? ORDER BY CONN_ID ";
    db.all(sql, req.oidc.user.email, (err, rows) => {
        if (err) {
            return console.error(err.message);
        }

        if (req.oidc.isAuthenticated() === true) {
            res.render("threatModelVisual", {
                aBText: "Logout",
                aBLink: "/logout",
                aBPic: req.oidc.user.picture,
                model: rows
            });
        } else {
            res.render("threatModelVisual", {
                aBText: "Login",
                aBLink: "/login",
                aBPic: "",
                model: rows
            });
        }
    });
});


//CONNECTIONS DELETE
app.get("/deleteConn/:id", (req, res) => {
    const id = [req.params.id, req.oidc.user.email];
    const sql = "SELECT * FROM CONNS WHERE CONN_ID = ? and CONN_USER_NAME=?";
    db.get(sql, id, (err, rows) => {
        if (err) {
            return console.error(err.message);
        }

        if (req.oidc.isAuthenticated() === true) {
            res.render("connectionsDelete", {
                aBText: "Logout",
                aBLink: "/logout",
                aBPic: req.oidc.user.picture,
                model: rows
            });
        } else {
            res.render("connectionsDelete", {
                aBText: "Login",
                aBLink: "/login",
                aBPic: "",
                model: rows
            });
        }
    });
});

//CONNECTIONS DELETE POST
app.post("/deleteConn/:id", (req, res) => {
    const id = [req.params.id,req.oidc.user.email];
    const sql = "DELETE FROM CONNS WHERE CONN_ID = ? and CONN_USER_NAME=?";
    db.run(sql, id, err => {
        if (err) {
            return console.error(err.message);
        }
        res.redirect("/conn");
    });
});

app.get("/threatmodel",  (req, res) => {
    const sql = "select distinct * from (select c.CONN_FROM as Asset, c.CONN_FROM_ASSET_TYPE as Asset_Type, a.AT_Threat, t.Description, " +
        "t.Alternate_Terms, t.Likelihood_Of_Attack, t.Typical_Severity, REPLACE(t.Mitigations,'::', '-') as NewMit, c.CONN_USER_NAME " +
        "FROM CONNS c left join ASSET_TYPE_THREATS a on c.CONN_FROM_ASSET_TYPE = a.AT_NAME left join capec t on a.AT_Threat=t.Name where c.CONN_USER_NAME=?" +
        "union all " +
        "SELECT c.CONN_TO as Asset, c.CONN_TO_ASSET_TYPE as Asset_Type, a.AT_Threat, t.Description, " +
        "t.Alternate_Terms, t.Likelihood_Of_Attack, t.Typical_Severity, REPLACE(t.Mitigations,'::', '-') as NewMit, c.CONN_USER_NAME " +
        "FROM CONNS c left join ASSET_TYPE_THREATS a on c.CONN_TO_ASSET_TYPE = a.AT_NAME left join capec t on a.AT_Threat=t.Name  where c.CONN_USER_NAME=?)";

    db.all(sql, req.oidc.user.email, (err, rows) => {
        if (err) {
            return console.error(err.message);
        }

        if (req.oidc.isAuthenticated() === true) {
            res.render("threatModelView", {
                aBText: "Logout",
                aBLink: "/logout",
                aBPic: req.oidc.user.picture,
                model: rows
            });
        } else {
            res.render("threatModelView", {
                aBText: "Login",
                aBLink: "/login",
                aBPic: "",
                model: rows
            });
        }
    });
});

app.get("/capecDisplay/:name", (req, res) => {
    const id = req.params.name;
    const sql = "SELECT * FROM Capec c WHERE c.name = ? ";
    db.get(sql, id, (err, rows) => {
        if (err) {
            return console.error(err.message);
        }

        if (req.oidc.isAuthenticated() === true) {
            res.render("capecView", {
                aBText: "Logout",
                aBLink: "/logout",
                aBPic: req.oidc.user.picture,
                model: rows
            });
        } else {
            res.render("capecView", {
                aBText: "Login",
                aBLink: "/login",
                aBPic: "",
                model: rows
            });
        }

    });
});