import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;  

app.use(cors({
    origin: "http://localhost:3000",  // Sesuaikan dengan URL dari frontend Anda
    credentials: true                 // Mengizinkan pengiriman cookie (untuk sesi)
}));

const db = new pg.Client({
    user: process.env.DB_USER,  
    host: process.env.DB_HOST,  
    database: process.env.DB_NAME,  
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT  
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(session({
    secret: process.env.SESSION_SECRET,  // Use environment variable for session secret
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 }
}));

async function saveHistory(user_id, action) {
    const timestamp = new Date();
    await db.query("INSERT INTO history (user_id, action, timestamp) VALUES ($1, $2, $3)", [user_id, action, timestamp]);
}


app.get("/", (req, res) => {
    // console.log("lol")
    res.sendFile(path.join(__dirname, "..", "frontEnd", "login", "home.html"));
});
app.use(express.static(path.join(__dirname, "..", "frontEnd")));

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "frontEnd", "login", "login.html"));
});


app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "frontEnd", "login", "register.html"));
});


function authenticateSession(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).redirect("/login"); // Mengarahkan pengguna ke halaman login jika sesi tidak ada
    }
}

app.get("/dashboard", authenticateSession, async (req, res) => {
    const user_id = req.session.user.id;
    await saveHistory(user_id, "Akses Dashboard");
    res.sendFile(path.join(__dirname, '..', "frontEnd", "index.html"));
});

app.post("/register", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    try {
        const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (checkResult.rows.length > 0) {
            res.status(401).json({ error: "Email already exists. Try logging in." });
        } else {
            await db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, password]);
            res.redirect("/login");
        }
    } catch (err) {
        console.log(err);
    }
});


app.post("/login", async (req, res) => {
    console.log("Data yang diterima di req.body:", req.body);
    const email = req.body.username;
    const password = req.body.password;

    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const storedPassword = user.password;

            // Cocokkan password
            if (password === storedPassword) {
                req.session.user = { id: user.id, email: user.email }; // Simpan data user di sesi
                await saveHistory(user.id, "Login");
                res.json({ message: "Login successful" });
            } else {
                res.status(401).json({ error: "Incorrect Password" });
            }
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/history", authenticateSession, async (req, res) => {
    try {
        const user_id = req.session.user.id;
        const result = await db.query("SELECT * FROM history WHERE user_id = $1 ORDER BY timestamp DESC", [user_id]);
        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Gagal mengambil riwayat" });
    }
});

app.post("/log-action", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const user_id = req.session.user.id;
    const action = req.body.action || "Aksi yang tidak dijelaskan";
    console.log("user id : ", user_id);
    console.log("aksi yang dilakukan : ", action)

    try {
        await saveHistory(user_id, action);
        res.json({ message: "Action logged successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to log action" });
    }
    });

    app.get("/get-user-data", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        
        const userResult = await db.query("SELECT email FROM users WHERE id = $1", [req.session.user.id]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        
        res.json({ username: userResult.rows[0].email });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ error: "Failed to fetch user data" });
    }
});


app.get("/user-history", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        
        const historyResult = await db.query(
            "SELECT action, timestamp FROM history WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 30", 
            [req.session.user.id]  
        );

    
        res.json(historyResult.rows);
    } catch (error) {
        console.error("Error fetching user history:", error);
        res.status(500).json({ error: "Failed to fetch user history" });
    }
});


app.post("/change-password", async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        
        const userResult = await db.query("SELECT password FROM users WHERE id = $1", [req.session.user.id]);

        
        if (userResult.rows.length === 0 || userResult.rows[0].password !== oldPassword) {
            return res.status(400).json({ message: "Incorrect old password" });
        }

        
        await db.query("UPDATE users SET password = $1 WHERE id = $2", [newPassword, req.session.user.id]);
        await saveHistory(req.session.user.id, "Password changed");
        
        res.json({ message: "Password successfully updated" });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ error: "Failed to change password" });
    }
});

// Endpoint untuk Logout
app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to logout" });
        }
        res.clearCookie("connect.sid"); // Hapus cookie sesi
        res.json({ message: "Logout successful" });
    });
});


// game history //

// Endpoint untuk menyimpan hasil permainan
app.post("/save-game-result", authenticateSession, async (req, res) => {
    const { result, distance_to_finish } = req.body;
    const user_id = req.session.user.id; // Ambil user_id dari session

    try {
        // Menyimpan hasil permainan ke database
        await db.query("INSERT INTO game_results (user_id, result, distance_to_finish, timestamp) VALUES ($1, $2, $3, NOW())", [user_id, result, distance_to_finish]);
        res.json({ message: "Game result saved successfully" });
    } catch (error) {
        console.error("Error saving game result:", error);
        res.status(500).json({ error: "Failed to save game result" });
    }
});

// Endpoint untuk mengambil riwayat permainan
app.get("/user-game-history", authenticateSession, async (req, res) => {
    const user_id = req.session.user.id; // Ambil user_id dari session

    try {
        const result = await db.query("SELECT result, distance_to_finish, timestamp FROM game_results WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 30", [user_id]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching user game history:", error);
        res.status(500).json({ error: "Failed to fetch user game history" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
