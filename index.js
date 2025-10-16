import * as fs from 'fs';
import * as readline from 'readline';

const dataDirectory = './data';
const outputDirectory = './output';
const epochTime = Date.now();
const dateString = new Date(epochTime).toISOString().split('T')[0];
const outputFilePath = `${outputDirectory}/${dateString}-compiled-crime-data.csv`;

const getFiles = () => {
  return fs.readdirSync(dataDirectory);
};

const readFile = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.log(error);
  }
};

const compileFileLines = (filePath, index) => {
  let lineIndex = 0;
  let lineTokens;
  let headersRetrieved = false;
  let headers = '';
  const fileStream = fs.createReadStream(filePath);
  const writeStream = fs.createWriteStream(outputFilePath, { flags: 'a' }); // 'a' for append
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  rl.on('line', (line) => {
    const indices = [0, 1, 4, 5, 9];
    if (index === 0) {
      const headerTokens = line.split(',');
      const reducedHeaders = indices.map((i) => headerTokens[i]);
      writeStream.write(reducedHeaders + '\n');
      headersRetrieved = true;
    }
    if (lineIndex > 0) {
      const lineTokens = line.split(',');
      const reducedData = indices.map((i) => lineTokens[i]);
      if (reducedData[2] !== '' && reducedData[3] !== '') {
        writeStream.write(reducedData + '\n');
      }
    }
    lineIndex++;
  });

  rl.on('close', () => {
    console.log(`Finished document ${filePath}`);
    writeStream.end();
  });

  rl.on('error', (err) => {
    console.error(`Error reading from ${filePath}`);
    writeStream.end();
  });
};

const main = () => {
  console.log('Running main!');
  const files = getFiles();
  files.forEach((file, index) => {
    compileFileLines(`${dataDirectory}/${file}`, index);
  });
};

main();
