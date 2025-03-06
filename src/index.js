const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const app = express();
const hbs = require("hbs");
const Appointment = require("./models/appointment");
require("./db/conn");

const port = process.env.PORT || 3001;
const static_path = path.join(__dirname, "../public");
const views_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));

app.set("view engine", "hbs");
app.set("views", views_path);
hbs.registerPartials(partials_path);

app.get("/", (req, res) => {
    res.render("main");
});

app.get("/women", (req, res) => {
    res.render("index");
});

app.get("/lgbtq", (req, res) => {
    res.render("Lindex");
});

app.post("/appointment", async (req, res) => {
    try {
        const { name, number, email, time, messages, source } = req.body;

        if (!number || !email) {
            return res.status(400).send("Number and email are required");
        }

        const AppointmentEmployee = new Appointment({
            name,
            number,
            email,
            time,
            messages,
        });

        await AppointmentEmployee.save();

        // Render appropriate page based on `source`
        if (source === "Lindex") {
            res.status(201).render("Lindex");
        } else {
            res.status(201).render("index");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// Subscription Route
app.post("/subscribe", (req, res) => {
    const { email } = req.body;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "", // Your Gmail address
            pass: "", // Your Gmail password
        },
    });

    const mailOptions = {
        from: "",
        to: email,
        subject: "Subscription Confirmation",
        text: "Thank you for subscribing to our newsletter!",
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error:", error);
            res.status(500).send("Error sending confirmation email");
        } else {
            console.log("Email sent:", info.response);
            res.sendStatus(200);
        }
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});