from compiler.ast.visitor import Visitor
from compiler.lexer.token import TokenType
from runtime.environment import Environment
from runtime.function import Callable, AgenthoryxFunction, ReturnException
from runtime.ai_runtime import AIRuntime, ToolRuntime, MemoryRuntime, KnowledgeRuntime

class AgenthoryxAgent:
    def __init__(self, name, methods):
        self.name = name
        self.methods = methods
        
    def get(self, name_token):
        name = name_token.lexeme
        if name in self.methods:
            return self.methods[name]
        raise Exception(f"Undefined property '{name}' on agent '{self.name}'.")

class Interpreter(Visitor):
    def __init__(self):
        self.globals = Environment()
        self.environment = self.globals
        
        class PrintFunc(Callable):
            def call(self, interpreter, arguments):
                print(arguments[0])
                return None
            def arity(self): return 1
            
        class LenFunc(Callable):
            def call(self, interpreter, arguments): return len(arguments[0])
            def arity(self): return 1
            
        self.globals.define("print", PrintFunc())
        self.globals.define("len", LenFunc())
        
        # Native Phase 2 runtimes
        self.globals.define("ai", AIRuntime())
        self.globals.define("tool", ToolRuntime())
        self.globals.define("memory", MemoryRuntime())
        self.globals.define("knowledge", KnowledgeRuntime())

    def interpret(self, ast):
        try:
            if ast:
                ast.accept(self)
        except Exception as e:
            print(f"Runtime Error: {e}")

    def execute_block(self, statements, environment):
        previous = self.environment
        try:
            self.environment = environment
            for statement in statements:
                if statement: statement.accept(self)
        finally:
            self.environment = previous

    def visit_program(self, stmt):
        for statement in stmt.statements:
            if statement: statement.accept(self)

    def visit_expression_statement(self, stmt):
        stmt.expression.accept(self)

    def visit_variable_declaration(self, stmt):
        value = None
        if stmt.initializer:
            value = stmt.initializer.accept(self)
        self.environment.define(stmt.name.lexeme, value)

    def visit_function_declaration(self, stmt):
        function = AgenthoryxFunction(stmt, self.environment)
        self.environment.define(stmt.name.lexeme, function)

    def visit_agent_declaration(self, stmt):
        methods = {}
        for task in stmt.tasks:
            methods[task.name.lexeme] = AgenthoryxFunction(task, self.environment)
        agent = AgenthoryxAgent(stmt.name.lexeme, methods)
        self.environment.define(stmt.name.lexeme, agent)

    def visit_template_declaration(self, stmt):
        pass # To be fully supported in v0.6

    def visit_if_statement(self, stmt):
        if self.is_truthy(stmt.condition.accept(self)):
            stmt.then_branch.accept(self)
        elif stmt.else_branch:
            stmt.else_branch.accept(self)

    def visit_while_statement(self, stmt):
        while self.is_truthy(stmt.condition.accept(self)):
            stmt.body.accept(self)

    def visit_return_statement(self, stmt):
        value = None
        if stmt.value:
            value = stmt.value.accept(self)
        raise ReturnException(value)

    def visit_block_statement(self, stmt):
        self.execute_block(stmt.statements, Environment(self.environment))

    def visit_binary_expression(self, expr):
        if expr.operator.type == TokenType.EQUAL:
            value = expr.right.accept(self)
            self.environment.assign(expr.left.name.lexeme, value)
            return value

        left = expr.left.accept(self)
        right = expr.right.accept(self)
        
        # simple string concat support
        if op := expr.operator.type:
            if op == TokenType.PLUS:
                if isinstance(left, str) or isinstance(right, str):
                    return str(left) + str(right)
                return left + right
            if op == TokenType.MINUS: return left - right
            if op == TokenType.SLASH: return left / right
            if op == TokenType.STAR: return left * right
            if op == TokenType.GREATER: return left > right
            if op == TokenType.GREATER_EQUAL: return left >= right
            if op == TokenType.LESS: return left < right
            if op == TokenType.LESS_EQUAL: return left <= right
            if op == TokenType.BANG_EQUAL: return left != right
            if op == TokenType.EQUAL_EQUAL: return left == right

    def visit_call_expression(self, expr):
        callee = expr.callee.accept(self)
        arguments = [arg.accept(self) for arg in expr.arguments]

        if not isinstance(callee, Callable):
            raise Exception("Can only call functions and classes.")
        if len(arguments) != callee.arity():
            raise Exception(f"Expected {callee.arity()} arguments but got {len(arguments)}.")
        
        return callee.call(self, arguments)

    def visit_identifier_expression(self, expr):
        return self.environment.get(expr.name.lexeme)

    def visit_literal_expression(self, expr):
        return expr.value

    def visit_get_expression(self, expr):
        obj = expr.object.accept(self)
        if isinstance(obj, AgenthoryxAgent):
            return obj.get(expr.name)
        if hasattr(obj, expr.name.lexeme):
            return getattr(obj, expr.name.lexeme)
        raise Exception(f"Only instances have properties.")

    def visit_set_expression(self, expr):
        raise Exception("Not implemented for phase 2")

    def is_truthy(self, obj):
        if obj is None: return False
        if isinstance(obj, bool): return obj
        return True
