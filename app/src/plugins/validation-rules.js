const samePassword = (passwordOne, passwordTwo) => passwordOne === passwordTwo || 'Passwords don\'t match';
const notEmpty = value => !!value || 'Field is required';
const isNumber = value => (!Number.isNaN(parseFloat(value))) || 'Not a number';
const atLeastZero = value => Number(value) >= 0 || 'has to be at least 0';
const isPositive = value => Number(value) > 0 || 'Has to be positive';
const maxFileSize = value => !value || value.size < 250000 || 'File size should be less than 250 kb';

export {
    samePassword,
    isPositive,
    atLeastZero,
    notEmpty,
    isNumber,
    maxFileSize,
};
