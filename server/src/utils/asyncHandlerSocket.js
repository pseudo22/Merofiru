const asyncHandlerSocket = (requestHandler) => {
    return (socket, next) => {
      Promise.resolve(requestHandler(socket, next))
        .catch((err) => next(err))
    };
  };
  
  export { asyncHandlerSocket }