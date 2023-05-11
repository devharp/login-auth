const express = require('express');
const cors = require('cors');
const sqlite = require('sqlite3');
const jwt = require('jsonwebtoken');
const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite.Database('data.db');

const HTTP_PORT = 3001;
const SECRET_KEY = 'abcdef';
app.get('/login', async (req, res) => {
    try{

        const { username, password } = req.query;
        if ( !username || !password ) return res.sendStatus(401);
        const dbResponse = await getUser({ username, password });
        
        if (dbResponse) { return res.send({ token: jwt.sign({ username, password }, SECRET_KEY) }); }
    }catch (err) { console.log(err); }
    
    return res.sendStatus(401);
});

app.get('/verify', async (req, res) => {
    try{
        const { token } = req.query;
        if(!token) return res.sendStatus(401);
        const { username, password } = jwt.verify(token, SECRET_KEY);

        if (!username || !password) return res.sendStatus(401);
        if (await getUser({ username, password })) return res.sendStatus(200);
    }catch (err) { console.log(err); }

    return res.sendStatus(401);

});

app.post('/register', async (req, res) => {
    try{
        const { username, password, email } = req.body;
        if ( !username || !password || !email ) return res.sendStatus(401);
    
        const dbResponse = await addUser({ username, password, email });
        if (dbResponse) return res.sendStatus(200);
    } catch (error) {
        console.log(error)
    }
    return res.sendStatus(501);
});

app.get('/forgot-password', async (req, res) => {
    try{
        const { otp, email } = req.query;
        if (otp !== '0000' || !email) return res.sendStatus(401);
        const password = await getUserByEmail(email);
        return res.send(password);
    } catch (err) { console.log(err) }
    return res.sendStatus(401);
});

app.listen(HTTP_PORT, () => {
    console.log(`Server running on port: ${HTTP_PORT}`);
});

function genRanHex(length = 20) {
    return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}


function addUser({ username, password, email }) {
    const insertQuery = `INSERT INTO users (id, username, password, email) VALUES (?, ?, ?, ?)`;
    return new Promise((resolve, reject) => {
        try{
            db.run(insertQuery, [genRanHex(), username, password, email], (err) => {
                if (err) return reject(err);
                return resolve(true);
            })
        } catch (err) {
            reject(err);
        }
    });
}

function getUser({ username, password }) {
    return new Promise((resolve, reject) => {
        try{
            if (!username || !password) return reject(false);
            const selectQuery = `SELECT * FROM users WHERE username = ? and password = ?`;
            db.get(selectQuery, [username, password], (err, row) => {
                if (err || !row) return reject(false);
                return resolve(true);
            })
        }
        catch(err){ reject(err) }
    });
}

function getUserByEmail (email) {
    return new Promise((resolve, reject) => {
        try{
            if(!email) return reject(false);
            const selectQuery = `SELECT * FROM users WHERE email = ?`;
            db.get(selectQuery, [email], (err, row) => {
                if (err || !row) return reject(false);
                return resolve(row.password);
            });
        } catch(err) { reject(err); }
    });
}