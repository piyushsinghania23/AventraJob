require('./dist/load-env.js');
const { PrismaClient } = require('@prisma/client');
(async () => {
  const client = new PrismaClient();
  console.log('prisma-init-ok');
  await client.$disconnect();
})();
