const { Entity, PrimaryKey, Property, Index } = require('@mikro-orm/core');

class RequestHistory {
  constructor() {
    this.id = undefined;
    this.method = '';
    this.url = '';
    this.headers = {};
    this.body = null;
    this.response = {};
    this.status = 0;
    this.responseTime = 0;
    this.timestamp = new Date();
    this.collection = 'Default';
    this.name = '';
    this.description = '';
    this.isFavorite = false;
    this.tags = [];
  }
}

// Define entity metadata
Entity()(RequestHistory);
Property({ type: 'number', primary: true, autoincrement: true })(RequestHistory.prototype, 'id');
Property({ type: 'string', length: 10 })(RequestHistory.prototype, 'method');
Property({ type: 'text' })(RequestHistory.prototype, 'url');
Property({ type: 'json', nullable: true })(RequestHistory.prototype, 'headers');
Property({ type: 'text', nullable: true })(RequestHistory.prototype, 'body');
Property({ type: 'json', nullable: true })(RequestHistory.prototype, 'response');
Property({ type: 'number', default: 0 })(RequestHistory.prototype, 'status');
Property({ type: 'number', default: 0 })(RequestHistory.prototype, 'responseTime');
Property({ type: 'datetime', default: 'now()' })(RequestHistory.prototype, 'timestamp');
Property({ type: 'string', default: 'Default' })(RequestHistory.prototype, 'collection');
Property({ type: 'string', nullable: true })(RequestHistory.prototype, 'name');
Property({ type: 'string', nullable: true })(RequestHistory.prototype, 'description');
Property({ type: 'boolean', default: false })(RequestHistory.prototype, 'isFavorite');
Property({ type: 'json', default: '[]' })(RequestHistory.prototype, 'tags');

// Add indexes for better query performance
Index({ properties: ['method'] })(RequestHistory);
Index({ properties: ['timestamp'] })(RequestHistory);
Index({ properties: ['collection'] })(RequestHistory);
Index({ properties: ['isFavorite'] })(RequestHistory);

module.exports = RequestHistory;