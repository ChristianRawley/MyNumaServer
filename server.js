const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());

const routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach(file => {
    if (file.endsWith('.js')) {
        const route = require(path.join(routesPath, file));
        app.use(route);
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
