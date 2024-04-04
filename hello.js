const express = require('express');
const TokenOrchestrator = require('./TokenOrchestrator')
const app = express();

const port = 8888;
const tokenOrchestrator = new TokenOrchestrator();

function getKey(req, res) {
    let key = tokenOrchestrator.getKey();
    if(key === "")
        res.status(404).send('Not found');
    else
        res.send(key);
}

function generateNewKeys(req, res) {
    let key = tokenOrchestrator.generateKeys();
    res.send('Key generated : ' + key);
}

function getDetails(req, res) {
    let details = String(tokenOrchestrator.getDetails(req.params.id));
    res.writeHead(200,
        {
            'Content-Length':
                Buffer.byteLength(details),
            'Content-Type':
                'text/plain',
            'Metadata': details
        });
    res.end(details);
}

function deleteKey(req, res) {
    let response = tokenOrchestrator.deleteKey(req.params.id);
    res.send(response)
}

function unblockKey(req, res){
    let response =tokenOrchestrator.unblockKey(req.params.id);
    res.send(response);
}

function keepAlive(req, res){
    tokenOrchestrator.keepAlive(req.params.id);
    res.send("Key alive for next 5 minutes");
}

app.get('/keys', getKey);
app.post('/keys', generateNewKeys);
app.head('/keys/:id', getDetails);
app.delete('/keys/:id', deleteKey);
app.put('/keys/:id', unblockKey);
app.put('/keepalive/:id', keepAlive);

app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});