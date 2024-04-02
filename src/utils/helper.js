const Web3 = require('web3');

const fromWei = (weiValue) => {
  return Web3.utils.fromWei(weiValue, 'ether');
};

const toWei = (etherValue) => {
  return Web3.utils.toWei(etherValue, 'ether');
};

const formatDate = (timestamp) => {
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleString();
};

const parseErrorMessage = (error) => {
  if (error.message.includes('revert')) {
    const revertReason = error.message.match(/revert (.*)/);
    return revertReason ? revertReason[1] : 'Transaction has been reverted by the EVM.';
  } else if (error.message.includes('VM Exception')) {
    const exceptionReason = error.message.match(/VM Exception while processing transaction: (.*)/);
    return exceptionReason ? exceptionReason[1] : 'A VM Exception occurred.';
  }
  return error.message;
};

module.exports = {
  fromWei,
  toWei,
  formatDate,
  parseErrorMessage,
};

