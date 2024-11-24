const express = require('express');
const Pool = require('./db');
const app = express();
const PORT = process.env.PORT || 8087;

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.json());


app.post('/reg', async(req, res) => {
    const {email, fio, password, position, company, work, city, tel} = req.body;
    const query = await Pool.query(`INSERT INTO user_cab(phone, password, company, dolgnost, email, country, city) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [email, fio, password, position, company, work, city]);
    return res.status(201).send("Регистрация прошла успешно");
})

app.post('/lk', async (req, res) => {
    const {phone, password, company, dolgnost, email, country, city} = req.body;
    console.log(req.body);
    try {
        /*const checkEmail = await Pool.query("select * from user_cab where country = $1", [country]);
        if(checkEmail.rows.length > 0) {
            return res.status(403).json('Такой пользователь уже есть');
        }*/
        const query = await Pool.query(`INSERT INTO user_cab(phone, password, company, dolgnost, email, country, city) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [phone, password, company, dolgnost, email, country, city]);
        return res.status(201).send(query.rows[0]);

    } catch(error) {
        res.status(500).send(error)
    }
});

app.delete('/lk/:id', async (req, res) => {
    const id = req.params.id;
    const deleteCab = await Pool.query(`delete from user_cab where user_id = $1`, [id]);
    res.send('del');
});


app.post('/post', async (req, res) => {
    const {first, second} = req.body;
    const createPost = await Pool.query(`insert into post(first, second) values ($1, $2) RETURNING *`, [first, second]);
    res.status(201).send("Регистрация прошла успешно");
})



app.listen(PORT, () => console.log(`work: ${PORT}`));
