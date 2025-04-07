const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const path = require('path');
const users = {}; // { socket.id: username }

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Page de login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Page de chat
app.post('/chat', (req, res) => {
    const username = req.body.username;
    if (!username || username.trim() === "") {
        return res.redirect('/');
    }

    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

io.on('connection', (socket) => {
    console.log('Nouvelle connexion socket : ' + socket.id);

    socket.on('new user', (username) => {
        users[socket.id] = username;
        console.log(`${username} s'est connecté`);
        io.emit('user connected', `${username} a rejoint le chat`);
    });

    socket.on('chat message', (msg) => {
        const username = users[socket.id] || 'Anonyme';
        io.emit('chat message', { username, msg });
    });

    socket.on('disconnect', () => {
        const username = users[socket.id];
        if (username) {
            io.emit('user disconnected', `${username} a quitté le chat`);
            delete users[socket.id];
        }
    });
});

http.listen(3000, () => {
    console.log('Serveur démarré sur http://localhost:3000');
});
