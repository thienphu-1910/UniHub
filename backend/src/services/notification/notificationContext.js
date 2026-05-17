import NotificationStrategy from './notificationStrategy.js';

export class NotificationContext {
  constructor(strategy) {
    if (!(strategy instanceof NotificationStrategy)) {
      throw new Error('strategy must extend NotificationStrategy');
    }
    this.strategy = strategy;
  }

  async send(payload) {
    return this.strategy.send(payload);
  }
}

export default NotificationContext;
