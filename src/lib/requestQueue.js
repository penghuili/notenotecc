let requestQueue = [];

export function addRequestToQueue(request) {
  requestQueue.push(request);
  processQueue();
}

let isProcessing = false;
async function processQueue() {
  if (isProcessing) {
    return;
  }

  isProcessing = true;
  while (requestQueue.length > 0) {
    const { args, handler } = requestQueue.shift();
    await handler(...args);
  }
  isProcessing = false;
}
