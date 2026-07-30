import './load-env';
import app from './app';

const port = Number(process.env.PORT ?? 4000);

const server = app.listen(port, () => {
  console.log(`AventraJob API listening on http://localhost:${port}`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please use a different port.`);
  } else {
    console.error('Server error:', error.message);
  }
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise rejection:', reason);
});
