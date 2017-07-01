class InvalidCommandError extends Error { }
class CommandNotApplicableError extends Error { }
class CommandNotDeclaredError extends Error { }
class ManagerNotDefinedError extends Error { }
class AccessDeniedError extends Error { }

module.exports = {
  InvalidCommandError,
  CommandNotApplicableError,
  CommandNotDeclaredError,
  ManagerNotDefinedError,
  AccessDeniedError,
};
