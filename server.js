const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const Clock = require('./models/clock.model');
const Level = require('./models/level.model');

// Création du serveur HTTP pour servir les fichiers statiques
const server = http.createServer((req, res) => {
    // Définir le chemin vers le fichier demandé
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

    // Obtenir l'extension du fichier demandé
    let extname = path.extname(filePath);

    // Définir le type de contenu par défaut
    let contentType = 'text/html';

    // Définir le type de contenu en fonction de l'extension
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
    }

    // Lire le fichier
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code == 'ENOENT') {
                // Page non trouvée
                fs.readFile(path.join(__dirname, 'public', '404.html'), (err, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf8');
                });
            } else {
                // Autre erreur
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Succès
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf8');
        }
    });
});

// Créer un serveur WebSocket et l'attacher au serveur HTTP
const wss = new WebSocket.Server({ server });

let users = [];
let timer = 0;
let level;
let clock;
let levels;
let interval;
let shutdownTimeout;

const setClock = () => {
    clock = new Clock();
    levels = [new Level(1, 20, [10, 20]), new Level(2, 15, [20, 40]), new Level(3, 10, [30, 60])];
    for (let level of levels) {
        clock.addLevel(level);
    }
    level = clock.getLevel(0);
    timer = level.getDuration();
}

const broadcast = (data) => {
    users.forEach((user) => {
        user.send(JSON.stringify(data));
    });
};

const updateTimer = () => {
    if (clock.isRunning()) {
        if (timer === 0) {
            try {
                level = clock.nextLevel();
                timer = level.getDuration();
                broadcast({ type: 'level', level: level.getId() });
            } catch (error) {
                startShutdownTimer(0);
            }
        } else {
            timer--;
        }
        if (interval) {
            broadcast({ type: 'timer', timer });
        }
    }
};

const resetTimer = () => {
    setClock();
    broadcast({ type: 'level', level: level.getId() });
    broadcast({ type: 'timer', timer });
}

const startTimer = () => {
    if (!interval) {
        interval = setInterval(updateTimer, 1000);
    }
    clock.run();
};

const pauseTimer = () => {
    clock.stop();
};

const startShutdownTimer = (timeout) => {
    shutdownTimeout = setTimeout(() => {
        console.log('Timer arreté');
        broadcast({ type: 'end', message: 'Le timer est terminé !' });
        clearInterval(interval);
        interval = null;
    }, timeout);
};

const cancelShutdownTimer = () => {
    if (shutdownTimeout) {
        clearTimeout(shutdownTimeout);
        shutdownTimeout = null;
    }
};

setClock();

wss.on('connection', (ws) => {
    cancelShutdownTimer();

    users.push(ws);

    if (users.length === 1) {
        ws.isHost = true;
    }

    ws.send(JSON.stringify({ type: 'initial', timer, level: level.getId(), isHost: ws.isHost }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'start') {
            if (ws.isHost) {
                startTimer();
            }
        } else if (data.type === 'pause') {
            if (ws.isHost) {
                pauseTimer();
            }
        } else if (data.type === 'reset') {
            if (ws.isHost) {
                resetTimer();
            }
        }
    });

    ws.on('close', () => {
        users = users.filter(user => user !== ws);
        if (ws.isHost && users.length > 0) {
            users[0].isHost = true;
            users[0].send(JSON.stringify({ type: 'host' }));
        }

        if (users.length === 0) {
            startShutdownTimer(3600000);
        }
    });
});

server.listen(8100, () => {
    console.log('Server is running on http://localhost:8100');
});
