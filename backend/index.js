const express = require('express');
const fileUpload = require('express-fileupload');
const lineReader = require('line-reader');
const fs = require('fs');
const Promise = require('bluebird');
const { readFile, find820And830, find760, makeContent } = require('./utils');
const app = express();
app.use(fileUpload());

app.post('/process', async (req, res) => {

  // getting variables
  const { codeSoc, date, currency } = req.body;


  // getting files
  const soc = req.files.socFile;
  const pivot = req.files.pivotFile;

  // rename files
  const socName = Date.now() + soc.name;
  const pivotName = Date.now() + pivot.name;

  // moving files
  soc.mv(`${__dirname}/tmp/${socName}`, function(err) {
    if (err) return res.send(err);
  });
  pivot.mv(`${__dirname}/tmp/${pivotName}`, function(err) {
    if (err) return res.send(err);
  });

  const socMatrix = await readFile(socName);
  const socMatrixFiltred = await find820And830(socMatrix);

  const pivotMatrix = await readFile(pivotName);
  const pivotMatrixFiltred = await find760(pivotMatrix);

  // generate files : array of file names result
  // matrix contains 820 & 830
  const result = await Promise.all(socMatrixFiltred.map(async socMatrixFiltredItem => {
    const content = await makeContent(socMatrixFiltredItem, pivotMatrixFiltred, codeSoc, date, currency);
    const resultFileName = `${Date.now()}-${socMatrixFiltredItem[0][1]}.SXX`;
    fs.writeFile(`tmp/${resultFileName}`, content, 'utf8', function (err) {
      if (err) return console.log(err);
    });
    return resultFileName;
  }));

  return res.json(result);
});

app.get('/process', (req, res) => {
  const fileName = req.query.fileName;
  return res.download(`${__dirname}/tmp/${fileName}`, `ESPF${fileName.replace(/^\d+/, '')}`);
});

app.get('/ping', (req, res) => {
  res.json('pong');
})

app.listen(5000, console.log('Server Started...'));