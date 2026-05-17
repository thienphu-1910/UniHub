export class NotificationStrategy {
  constructor(options = {}) {
    this.options = options;
  }

  async send(notification) {
    throw new Error('send() must be implemented by concrete strategy');
  }
}

export default NotificationStrategy;
