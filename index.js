const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const app = express()

const url = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap'

// Ruta principal para listar los músicos
app.get("/", async (req, res) => {
  try {
    const response = await axios.get(url)
    const html = response.data
    const $ = cheerio.load(html)

    const links = []
    $("#mw-pages a").each((i, elemento) => {
      const link = $(elemento).attr('href')
      const name = $(elemento).text()
      links.push({ name, link })
    })

    // Generar HTML para la lista de músicos 
    const htmlContent = `
      <html>
        <head><title>Músicos de Rap</title></head>
        <body>
          <h1>Músicos de Rap</h1>
          <ul>
            ${links.map(musico => `
              <li><a href="/musico?link=${encodeURIComponent(musico.link)}">${musico.name}</a></li>
            `).join('')}
          </ul>
        </body>
      </html>
    `

    res.send(htmlContent)

  } catch (error) {
    console.error(`El error es el ${error}`)
    res.status(500).send(`Error interno ${error}`)
  }
})

//Ruta para mostrar información del músico
app.get("/musico", async (req, res) => {
  const link = req.query.link
  try {
    const response = await axios.get(`https://es.wikipedia.org${link}`)
    const html = response.data
    const $ = cheerio.load(html)

    const h1 = $("h1").text()
    const images = []
    $("img.mw-file-element").each((i, elemento) => {
      const src = $(elemento).attr("src")
      if (!src.includes('.svg')) { 
        images.push(src)
      }
    })
    const texts = []
    $("p").each((i, elemento) => {
      const text = $(elemento).text()
      const imgSrc = $(elemento).find("img.mw-file-element").attr("src")
      texts.push({ text, img: null })
      
    })

    // Generar HTML para mostrar la información de cada uno
    const htmlContent = `
      <html>
        <head><title>${h1}</title></head>
        <body>
          <h1>${h1}</h1>
          <div>Imagen:</div>
          ${images.map(img => `
            <img src="${img}" alt="Image" style="max-width: 200px; margin: 5px;">
          `).join('')}
          <div>Descripcion:</div>
          ${texts.map(textItem => `
            <p>${textItem.text}</p>
            ${textItem.img ? `<img src="${textItem.img}" alt="Image" style="max-width: 200px; margin: 5px;">` : ''}
          `).join('')}
        </body>
      </html>
    `

    res.send(htmlContent)

  } catch (error) {
    console.error(`El error es el ${error}`)
    res.status(500).send(`Error interno ${error}`)
  }
})


app.listen(3000, () => console.log('Está escuchando en el puerto http://localhost:3000'))