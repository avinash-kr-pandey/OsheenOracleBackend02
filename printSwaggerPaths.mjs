import swaggerSpec from './swagger.js';

console.log('Total paths:', Object.keys(swaggerSpec.paths).length);
Object.keys(swaggerSpec.paths).forEach(p => console.log(p));
