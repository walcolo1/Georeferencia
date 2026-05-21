const bcrypt = require('bcrypt');

const hash = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW';

async function test() {
  console.log('123456:', await bcrypt.compare('123456', hash));
  console.log('admin:', await bcrypt.compare('admin', hash));
  console.log('password:', await bcrypt.compare('password', hash));
}
test();
