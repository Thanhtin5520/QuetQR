// server.js
const express = require("express");
const http = require("http");
const io = require("socket.io");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const os = require("os");

const app = express();
const server = http.createServer(app);
const ioSocket = io(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Database setup
const db = new sqlite3.Database("scans.db", (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to SQLite database");
    // Tạo bảng scans nếu chưa tồn tại
    db.run(
      `CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barcode TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        session_id TEXT
      )`
    );
  }
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Routes
app.get("/api/ip", (req, res) => {
  const interfaces = os.networkInterfaces();
  let ip = "localhost";
  
  // Tìm địa chỉ IP local
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        ip = iface.address;
        break;
      }
    }
    if (ip !== "localhost") break;
  }
  
  res.json({ ip });
});

app.get("/api/history", (req, res) => {
  db.all("SELECT * FROM scans ORDER BY timestamp DESC LIMIT 100", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post("/api/clear-history", (req, res) => {
  db.run("DELETE FROM scans", [], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "History cleared" });
  });
});

app.get("/api/sessions/:sessionId", (req, res) => {
  db.all("SELECT * FROM scans WHERE session_id = ? ORDER BY timestamp DESC", [req.params.sessionId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// WebSocket logic
ioSocket.on("connection", (socket) => {
  console.log("Client connected");
  
  // Tạo session ID mới khi client kết nối
  const sessionId = Date.now().toString();
  socket.emit("sessionId", sessionId);

  // Xử lý sự kiện quét mã vạch
  socket.on("scan", (data) => {
    const { barcode } = data;
    
    // Lưu vào database
    db.run(
      "INSERT INTO scans (barcode, session_id) VALUES (?, ?)",
      [barcode, sessionId],
      function (err) {
        if (err) {
          console.error("Error saving scan:", err);
          return;
        }
        
        // Gửi mã vạch đến tất cả client
        ioSocket.emit("newScan", {
          id: this.lastID,
          barcode,
          timestamp: new Date().toISOString(),
          sessionId
        });
      }
    );
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Route chính
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/scanner", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "scanner.html"));
});

// Xử lý cho Vercel
if (process.env.NODE_ENV === 'production') {
    module.exports = app;
} else {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
