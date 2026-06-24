from runtime.environment import Environment

class Callable:
    def call(self, interpreter, arguments):
        pass
    def arity(self):
        pass

class AgenthoryxFunction(Callable):
    def __init__(self, declaration, closure):
        self.declaration = declaration
        self.closure = closure

    def call(self, interpreter, arguments):
        environment = Environment(self.closure)
        for i in range(len(self.declaration.params)):
            environment.define(self.declaration.params[i].lexeme, arguments[i])
        
        try:
            interpreter.execute_block(self.declaration.body, environment)
        except ReturnException as r:
            return r.value
        return None

    def arity(self):
        return len(self.declaration.params)

class ReturnException(Exception):
    def __init__(self, value):
        self.value = value
