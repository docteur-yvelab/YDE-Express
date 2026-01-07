const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // L'URL de ton projet React
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté :', socket.id);

    // Quand un livreur envoie sa position
    socket.on('update-location', (data) => {
        // data contient { lat, lng, orderId }
        console.log(`Position reçue pour ${data.orderId}:`, data.lat, data.lng);
        
        // On renvoie la position à tout le monde (ou à une "room" spécifique)
        socket.broadcast.emit('location-received', data);
    });

    socket.on('disconnect', () => {
        console.log('Utilisateur déconnecté');
    });
});

server.listen(4000, () => {
    console.log('Serveur YDE-Express tourne sur le port 4000');
});