import { app } from './app.js';
import { env } from './config/env.js';

app.listen(env.port, () => {
  console.log(`Planta a correr em http://localhost:${env.port}`);
});
