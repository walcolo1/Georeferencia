const bcrypt = require('bcrypt');

const hash = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW';
const password = '123'; // Wait, my test script used '123'
const password123456 = '123456';

bcrypt.compare(password, hash).then(res => console.log('123:', res));
bcrypt.compare(password123456, hash).then(res => console.log('123456:', res));
