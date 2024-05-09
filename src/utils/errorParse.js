
const errorParse = (error) => {
  let errorMSG = error;
  if (error.includes('duplicate key')) {
    errorMSG = `A record with the property ${errorMSG.split('key: ')[1]} already exists`;
  }
  if (error.includes('validation failed')) {
    errorMSG = `Please send the following keys in your payload: (${errorMSG.split(/[``]/).filter(val => !val.includes(' '))})`;
  }
  return errorMSG;
};

module.exports = errorParse;
