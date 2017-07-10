const { simple, constructorPayload } = require('../es');

module.exports.LeagueCreated = constructorPayload('created');
module.exports.LeaguePlayerJoined = simple('nameChanged', 'id', 'team');
module.exports.DescriptionChanged = simple('descriptionChanged', 'description');
module.exports.NameChanged = simple('nameChanged', 'name');
module.exports.Opened = simple('opened');
module.exports.Closed = simple('closed');
module.exports.Published = simple('published', 'id');
module.exports.UnPublished = simple('unPublished', 'id');
module.exports.RuleAdded = simple('ruleAdded', 'id', 'rule');
module.exports.RuleDiscarded = simple('ruleDiscarded', 'id');
module.exports.TypeChanged = simple('typeChanged', 'type');
module.exports.PlayerAdded = constructorPayload('playerAdded');
module.exports.Started = constructorPayload('started');
module.exports.TeamUpdated = simple('teamUpdated', 'id', 'team');
