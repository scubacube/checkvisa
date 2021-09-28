const puppeteer = require('puppeteer')
let link = 'https://frs.gov.cz/cs/ioff/application-status'
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const config = require('config');
const userData = require('./models/User');
const path = require('path');
require('dotenv').config()
const fetch = require("node-fetch");

let dataFromFront;
//send email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'myemail@gmail.com',
        pass: process.env.MAIL_PASSWORD
    }
});

const app = express()

app.use(
    cors({
        origin: 'http://czvisas.herokuapp.com',
        credentials: true,
    })
);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose.Promise = global.Promise;

if (process.env.NODE_ENV === 'production') {
    app.use('/', express.static(path.join(__dirname, './client/build')))

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, './client/build/index.html'))
    })
}
// const PORT = config.get('port' || 5000)
const PORT = process.env.PORT || 3001;

async function startDb() {

    try {
        await mongoose.connect(config.get('mongoUri'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        app.listen(PORT, () => console.log(`app has been started on port ${PORT}...`))
    } catch (e) {
        console.log('server error', e.message)
        process.exit(1)
    }
}
startDb();

const parseStatus = async (code, type, year) => {
    let resultOnPage;
    let result;
    try {
        let browser = await puppeteer.launch({
            headless: true,
            slowMo: 100,
            devtools: false,
            args: ['--no-sandbox']
        })
        let page = await browser.newPage()
        await page.setViewport({width: 1400, height: 900})
        await page.goto(link, {waitUntil: 'domcontentloaded'})


        const selector = await page.$('#edit-ioff-application-number')
        await selector.type(code)

        await page.select('#edit-ioff-application-code', type)
        await page.select('#edit-ioff-application-year', year)

        //Find submit button and click it
        const buttonSubmit = await page.$('#edit-submit-button')
        await buttonSubmit.click()

        //Wait for navigation after reloading the page
        await page.waitForNavigation()

        //Find needed value on reloaded page
        resultOnPage = await page.$eval(
            'p.alert.alert-info > span > strong',
            el => el.textContent
        )

        if (resultOnPage === 'Vyřízeno – POVOLENO') {
            result = 'POVOLENO';
        } else if (resultOnPage === 'Nenalezeno') {
            result = 'NENALEZENO';
        } else if (resultOnPage === 'Zpracovává se') {
            result = 'Zpracovává se';
        } else result = 'ZAMITNUTO';
        await page.close()
        await browser.close()
    } catch(e) {
        console.log(e)
    }
    return result;
}

let running = false;

async function checkAll() {
    running = true;
    userData.find(async function (err, users) {
        if (err) return console.error(err);
        for (let i = 0; i < users.length; i++) {
            try {
                let code = users[i].code;
                let type = users[i].type;
                let year = users[i].year;
                let email = users[i].email;
                let browser = await puppeteer.launch({
                    headless: true,
                    slowMo: 100,
                    devtools: false,
                    args: ['--no-sandbox']
                })
                let page = await browser.newPage()
                await page.setViewport({width: 1400, height: 900})
                await page.goto(link, {waitUntil: 'domcontentloaded'})

                const selector = await page.$('#edit-ioff-application-number')
                await selector.type(code.toString())

                await page.select('#edit-ioff-application-code', type.toString())
                await page.select('#edit-ioff-application-year', year.toString())

                //Find submit button and click it
                const buttonSubmit = await page.$('#edit-submit-button')
                await buttonSubmit.click()

                //Wait for navigation after reloading the page
                await page.waitForNavigation()

                //Find needed value on reloaded page
                const resultOnPage = await page.$eval(
                    'p.alert.alert-info > span > strong',
                    el => el.textContent
                )
                if (resultOnPage === 'Vyřízeno – POVOLENO') {
                    console.log(email);
                    let emailresponce = (resultOnPage, em) => {
                        return {
                            to: em,
                            subject: 'Check your visa result',
                            text: `Hello, your visa status of ${code}/${type} - ${year} is - ${resultOnPage}`
                        }
                    }
                    await transporter.sendMail(emailresponce(resultOnPage, email), function(error, info){
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });

                }
                await browser.close()

            } catch (e) {
                console.log(e)
            }
        }

    })
    userData.deleteMany({status: "POVOLENO"}, async function () {
        console.log('all approved applications were deleted if there were any')
    });

}

function isRunning() {
    let today = new Date();
    let hours = today.getHours();
    let min = today.getMinutes();
    let timeToCheck =
        hours === 7 && min === 55
        || hours === 19 && min === 55

    console.log(hours + ":" + min);
    console.log(running);

    if (running === true) {
        console.log("checkALL is running, running - " + running);
    }
    if(running === false && timeToCheck) {
        checkAll();
    }
    if(!timeToCheck && running) {
        running = false;
    }
}
setInterval(isRunning, 5400);

app.post('/create',  async function (req, res) {
    const isHuman = fetch(`https://www.google.com/recaptcha/api/siteverify`, {
        method: "post",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
        },
        body: `secret=${process.env.RECAPTCHA_SERVER_KEY}&response=${req.body.humanKey}`
    })
        .then(res => res.json())
        .then(json => json.success)
        .catch(err => {
            throw new Error(`Error in Google Siteverify API. ${err.message}`)
        })

    if (req.body.recaptcha === null || !isHuman) {
        console.log("recaptcha - " + req.body.recaptcha)
        console.log("isHuman - " + isHuman)
        throw new Error(`YOU ARE NOT A HUMAN.`)
    }

    parseStatus(req.body.code, req.body.type, req.body.year, req.body.email).then(body => {
        dataFromFront = {
            code: req.body.code,
            type: req.body.type,
            year: req.body.year,
            email: req.body.email,
            status: body
        };
        if (dataFromFront.status === "POVOLENO") {
            res.end("POVOLENO");
        } else if (dataFromFront.status === "NENALEZENO") {
            res.end("NENALEZENO");
        } else if (dataFromFront.status === "Zpracovává se") {
            res.end("Zpracovává se");
        } else res.end("ZAMITNUTO");

        let myData = new userData(dataFromFront);

        if (dataFromFront.status === "POVOLENO") {
            console.log('already povoleno, not going to save to db')
            return
        } else {
            myData.save()
                .then(() => {
                    console.log("object saved to database");

                })
                .catch(() => {
                    res.status(400).send("Unable to save to database");
                });
        }

    });
});
