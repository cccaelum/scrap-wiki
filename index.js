const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const app = express()

const url = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap'

app.get('/', async (req, res) => {
    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);

            // Extraer los enlaces y nombres de los músicos de rap
            const musicosDeRap = [];
            $('#mw-pages a').each((index, element) => {
                const name = $(element).text();
                const link = $(element).attr('href');
                if (link.startsWith('/wiki/')) {
                    musicosDeRap.push({
                        name,
                        link: link.replace('/wiki/', ''), // Guardar solo la parte final del enlace
                    });
                }
            });

            // Renderizar la lista de músicos de rap con enlaces
            res.send(`
                <h1>Músicos de Rap en Wikipedia</h1>
                <ul>
                    ${musicosDeRap.map(musico => `
                        <li>
                            <a href="/musico-de-rap/${encodeURIComponent(musico.link)}">${musico.name}</a>
                        </li>
                    `).join('')}
                </ul>
            `);
        }
    } catch (error) {
        console.error('Error al hacer scraping:', error);
        res.status(500).send('Hubo un error al realizar el scraping.');
    }
});

// Ruta dinámica para mostrar información de cada músico de rap
app.get('/musico-de-rap/:id', async (req, res) => {
    const musicoId = req.params.id;
    const musicoUrl = `https://es.wikipedia.org/wiki/${musicoId}`;

    try {
        const response = await axios.get(musicoUrl);
        if (response.status === 200) {
            const html = response.data;
            res.send(html);
        }
    } catch (error) {
        console.error('Error al acceder a la página del músico de rap:', error);
        res.status(500).send('Hubo un error al acceder a la página del músico de rap.');
    }
});

app.listen(3000, () => {
    console.log('express esta escuchando en el puerto http://localhost:3000')
})