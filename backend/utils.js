const lineReader = require('line-reader');
const Promise = require('bluebird');

/**
 * read text file and return a matrix
 * @param {String} fileName 
 * @return {Array} 
 */
module.exports.readFile = async function readFile(fileName) {
  const matrix = [];
  let eachLine = Promise.promisify(lineReader.eachLine);
  await eachLine(`${__dirname}/tmp/${fileName}`, {separator: /\n/, encoding: 'latin1'}, function(line, last) {
    const arr = line.replace(/"/g, '').split(',');
    matrix.push(arr);
  });
  return matrix;
};

/**
 * find an array of array, each array has one 820 and many 830 
 * @param {Array} matrix
 * @return {Array}
 */
module.exports.find820And830 = async function find820And830(matrix) {
  const result = [];
  let item = [];

  matrix.forEach(arr => {
    if(arr[0] === '820') {
      if(item.length !== 0) {
        result.push(item);
        item = [];
      }
      item.push(arr);
    }
    if(arr[0] === '830') {
      item.push(arr);
    }
  });

  if(item.length !== 0) {
    result.push(item);
  }

  return result;
}

/**
 * find number of 760
 * @param {Array} matrix
 * @return {Number}
 */
module.exports.find760 = async function find760(matrix) {
  const result = [];

  matrix.forEach(arr => {
    if(arr[0] === '760') {
      result.push(arr);
    }
  });

  return result;
}

/**
 * make line
 */
const makeLine = function makeLine(matrix, AccoutNumber, code, date, currency, arr) {
  let line = Array(700).fill(' ').join('');
  line = replaceAt(2, code, line);
  line = replaceAt(12, 'ESPF', line);
  line = replaceAt(93, date.replace(/-/g, '')+'S', line);
  line = replaceAt(120, currency, line);
  line = replaceAt(162, matrix[0][1], line);
  line = replaceAt(125, AccoutNumber, line);
  
  for(let row of arr) {
    line = replaceAt(row.pos-1, row.content, line);
  }

  return line;
}

const replaceAt = function(index, replacement, line) {
  return line.substr(0, index) + replacement + line.substr(index + replacement.length);
}

/**
 * make content
 */
module.exports.makeContent = async function makeContent(socMatrixFiltredItem, pivotMatrixFiltred, code, date, currency) {
  const AccoutNumber = findAccountNumber(socMatrixFiltredItem, pivotMatrixFiltred);
  // 0,1 contains ESOC or TSRFT
  const content = [];
  // const arr = [{pos: 150, content: 'teeeesst'}];

  const arr = makeArr(socMatrixFiltredItem[0][1], pivotMatrixFiltred, socMatrixFiltredItem);

  for(arrItem of arr) {
    let line = makeLine(socMatrixFiltredItem, AccoutNumber, code, date, currency, arrItem);
    line = line.replace(/\s+$/,'');
    content.push(line);
  }
  return content.join('\n');
}

const makeArr = function makeArr(word, pivotMatrixFiltred, socMatrixFiltredItem) {
  const arr = [];
  const reg = /\[_([A-Z]+) = _([A-Za-z0-9]+)\]/g;
  for(row of pivotMatrixFiltred) {
    const kv = [];
    const regex = RegExp(word);
    let rg;
    let arrItem = null;
    if(regex.test(row[4])) {
      arrItem = [];
      do {
        rg = reg.exec(row[19]);
        if(rg && rg[1] !== 'TYENT') {
          kv.push({ key: rg[1], value: rg[2] });
        }
      } while(rg);
    }
    // console.log(kv);

    // search in for key in socMatrixFiltredItem
    for(kvItem of kv) {
      let flag = false;

      // 1
      for(rowSoc of socMatrixFiltredItem) {
        if(!flag && rowSoc[0] === '830' && rowSoc[1] === kvItem.key) {
          // 3 is position
          arrItem.push({pos: rowSoc[3], content: kvItem.value});
          flag = true;
          break;
        }
      }
      // 13
      for(rowSoc of socMatrixFiltredItem) {
        if(!flag && rowSoc[0] === '830' && rowSoc[13] === kvItem.key) {
          // 3 is position
          arrItem.push({pos: rowSoc[3], content: kvItem.value});
          flag = true;
          break;
        }
      }

    }
    if(arrItem) {
      arr.push(arrItem);
    }
  }
  return arr;
}

const findAccountNumber = function findAccountNumber(matrix, pivotMatrixFiltred) {
  let accountNumber = '';
  for(let row of pivotMatrixFiltred) {
    const regex = RegExp(matrix[0][1]);
    if(regex.test(row[4])) {
      accountNumber = /\[ADDACCOUNT _([A-Z]+)\]/.exec(row[19])[1];
      // console.log(row[19]);
      break;
    }
  }

  return accountNumber;
}

