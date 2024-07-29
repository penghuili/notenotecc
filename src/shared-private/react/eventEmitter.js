import EventEmitter3 from 'eventemitter3';

export const eventEmitter = new EventEmitter3();

export const eventEmitterEvents = {
  refreshed: 'refreshed',
  settingsFetched: 'settingsFetched',
  loggedIn: 'loggedIn',
};
