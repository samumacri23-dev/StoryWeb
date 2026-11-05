const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname, 'characters.json');

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

app.get('/api/characters', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Errore di lettura dal database.' });
        res.json(JSON.parse(data || '[]'));
    });
});

app.post('/api/characters', (req, res) => {
    const newPerson = req.body;
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        let characters = [];
        if (!err && data) characters = JSON.parse(data);
        characters.unshift(newPerson);
        fs.writeFile(DATA_FILE, JSON.stringify(characters, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Errore durante il salvataggio.' });
            res.json({ success: true, character: newPerson });
        });
    });
});

app.delete('/api/characters/:id', (req, res) => {
    const id = req.params.id;
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Errore di lettura.' });
        let characters = JSON.parse(data || '[]');
        characters = characters.filter(c => c.id !== id);
        fs.writeFile(DATA_FILE, JSON.stringify(characters, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Errore di scrittura.' });
            res.json({ success: true });
        });
    });
});

app.put('/api/characters/:id', (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Errore di lettura.' });
        let characters = JSON.parse(data || '[]');
        const idx = characters.findIndex(c => c.id === id);
        if (idx !== -1) {
            characters[idx] = { ...characters[idx], ...updatedData };
            fs.writeFile(DATA_FILE, JSON.stringify(characters, null, 2), (err) => {
                if (err) return res.status(500).json({ error: 'Errore durante l\'aggiornamento.' });
                res.json({ success: true });
            });
        } else {
            res.status(404).json({ error: 'Elemento non trovato nel database.' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server Storyweb avviato su http://localhost:${PORT}`);
});