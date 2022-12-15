const express = require('express')
const path = require('path')
const { get } = require('request')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// const viewsDir = path.join(__dirname, 'views')
// app.use(express.static(viewsDir))
const docsDir = path.join(__dirname, 'docs')
app.use(express.static(docsDir))
// app.use(express.static(path.join(__dirname, './public')))
app.use(express.static(path.join(__dirname, './docs')))
app.use(express.static(path.join(__dirname, './weights')))
app.use(express.static(path.join(__dirname, './dist')))

// app.get('/', (req, res) => res.sendFile(path.join(viewsDir, 'index.html')))
app.get('/', (req, res) => res.sendFile(path.join(docsDir, 'index.html')))

app.listen(3000, () => console.log('Listening on port 3000!'))
