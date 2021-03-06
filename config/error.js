module.exports = {
  onError(error) {
    if (error.syscall !== 'listen') { throw error; }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        console.log('*************************', error)
        throw error;
    }
  }
}
