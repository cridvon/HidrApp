import { app } from './app';
import { config } from './config';

app.listen(config.port, () => {
  console.log(`HidrApp API escuchando en el puerto ${config.port}`);
});
