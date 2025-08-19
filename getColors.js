const getNonTransparentArea = require('./dist/parseImage').default


if (require.main === module) {
  const imgPath = process.argv[2];
  if (!imgPath) {
    console.log('Usage: node index.js <image-path>');
    process.exit(1);
  }
  getNonTransparentArea(imgPath).then(res => {
    console.log(res);
  }).catch(err => {
    console.error('Error:', err.message);
  });
}

module.exports = getNonTransparentArea;