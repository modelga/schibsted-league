 const { handler } = require('../../es');
 const { RuleDiscarded } = require('../events');
 const ModeratorCommand = require('./ModeratorCommand');

 module.exports = class extends ModeratorCommand {
   constructor(id, ruleId) {
     super(id);
     this.ruleId = ruleId;
   }
   events() { return [new RuleDiscarded(this.ruleId)]; }
   static declare() {
     return ['league'];
   }
};
 handler.declare(module.exports);
