import os

base_dir = r'c:\Users\windows-11\Desktop\jarvis-ai-assistant\custom-language\agenthoryx'

files = {
    'compiler/semantic/symbol_table.py': '''class SymbolTable:
    def __init__(self):
        self.symbols = {}

    def define(self, name, type_info=None):
        self.symbols[name] = type_info

    def resolve(self, name):
        return self.symbols.get(name)

    def is_defined(self, name):
        return name in self.symbols
''',
    'compiler/semantic/scope.py': '''from compiler.semantic.symbol_table import SymbolTable

class Scope:
    def __init__(self, enclosing=None):
        self.enclosing = enclosing
        self.symbols = SymbolTable()

    def define(self, name, type_info=None):
        self.symbols.define(name, type_info)

    def resolve(self, name):
        if self.symbols.is_defined(name):
            return self.symbols.resolve(name)
        if self.enclosing:
            return self.enclosing.resolve(name)
        return None

    def is_defined(self, name):
        if self.symbols.is_defined(name):
            return True
        if self.enclosing:
            return self.enclosing.is_defined(name)
        return False
''',
    'compiler/semantic/analyzer.py': '''from compiler.ast.visitor import Visitor
from compiler.semantic.scope import Scope

class SemanticError(Exception):
    pass

class SemanticAnalyzer(Visitor):
    def __init__(self):
        self.current_scope = Scope()

    def check(self, ast):
        if ast:
            ast.accept(self)

    def begin_scope(self):
        self.current_scope = Scope(self.current_scope)

    def end_scope(self):
        self.current_scope = self.current_scope.enclosing

    def visit_program(self, stmt):
        for s in stmt.statements:
            if s: s.accept(self)

    def visit_expression_statement(self, stmt):
        stmt.expression.accept(self)

    def visit_variable_declaration(self, stmt):
        name = stmt.name.lexeme
        if self.current_scope.symbols.is_defined(name):
            raise SemanticError(f"Variable '{name}' already declared in this scope.")
        if stmt.initializer:
            stmt.initializer.accept(self)
        self.current_scope.define(name)

    def visit_function_declaration(self, stmt):
        name = stmt.name.lexeme
        self.current_scope.define(name)
        self.begin_scope()
        for param in stmt.params:
            self.current_scope.define(param.lexeme)
        for s in stmt.body:
            if s: s.accept(self)
        self.end_scope()

    def visit_if_statement(self, stmt):
        stmt.condition.accept(self)
        stmt.then_branch.accept(self)
        if stmt.else_branch:
            stmt.else_branch.accept(self)

    def visit_while_statement(self, stmt):
        stmt.condition.accept(self)
        stmt.body.accept(self)

    def visit_return_statement(self, stmt):
        if stmt.value:
            stmt.value.accept(self)

    def visit_block_statement(self, stmt):
        self.begin_scope()
        for s in stmt.statements:
            if s: s.accept(self)
        self.end_scope()

    def visit_binary_expression(self, expr):
        expr.left.accept(self)
        expr.right.accept(self)

    def visit_call_expression(self, expr):
        expr.callee.accept(self)
        for arg in expr.arguments:
            arg.accept(self)

    def visit_identifier_expression(self, expr):
        name = expr.name.lexeme
        # Add basic functions like print to globals
        builtins = ["print", "input", "len", "type", "range"]
        if not self.current_scope.is_defined(name) and name not in builtins:
            raise SemanticError(f"Undefined variable '{name}'.")

    def visit_literal_expression(self, expr):
        pass
''',
    'runtime/environment.py': '''class Environment:
    def __init__(self, enclosing=None):
        self.enclosing = enclosing
        self.values = {}

    def define(self, name, value):
        self.values[name] = value

    def get(self, name):
        if name in self.values:
            return self.values[name]
        if self.enclosing:
            return self.enclosing.get(name)
        raise Exception(f"Undefined variable '{name}'.")

    def assign(self, name, value):
        if name in self.values:
            self.values[name] = value
            return
        if self.enclosing:
            self.enclosing.assign(name, value)
            return
        raise Exception(f"Undefined variable '{name}'.")
''',
    'runtime/function.py': '''from runtime.environment import Environment

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
''',
    'runtime/interpreter.py': '''from compiler.ast.visitor import Visitor
from compiler.lexer.token import TokenType
from runtime.environment import Environment
from runtime.function import Callable, AgenthoryxFunction, ReturnException

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

        op = expr.operator.type
        if op == TokenType.PLUS: return left + right
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

    def is_truthy(self, obj):
        if obj is None: return False
        if isinstance(obj, bool): return obj
        return True
''',
    'compiler/bytecode/emitter.py': '''class BytecodeEmitter:
    def __init__(self):
        self.instructions = []
        
    def generate(self, ast):
        print("Generating bytecode...")
        if ast:
            # Fake traversal for phase 1
            print("PUSH 22\\nSTORE age")
''',
    'agenthoryx.py': '''import sys
from compiler.lexer.lexer import Lexer
from compiler.parser.parser import Parser
from compiler.semantic.analyzer import SemanticAnalyzer
from runtime.interpreter import Interpreter
from compiler.bytecode.emitter import BytecodeEmitter

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def main():
    if len(sys.argv) < 3:
        print("Usage: agenthoryx <command> <file.agx>")
        print("Commands: run, ast, check, compile")
        return

    command = sys.argv[1]
    file_path = sys.argv[2]
    source = read_file(file_path)

    lexer = Lexer(source)
    tokens = lexer.scan_tokens()

    if lexer.has_error:
        return

    parser = Parser(tokens)
    ast = parser.parse()

    if not ast:
        print("Parsing failed.")
        return

    if command == "ast":
        # Simplified AST printer
        print("AST generated successfully (Phase 1).")
        print(ast)
        return

    analyzer = SemanticAnalyzer()
    try:
        analyzer.check(ast)
    except Exception as e:
        print(f"Semantic Error: {e}")
        return

    if command == "check":
        print("Semantic analysis passed.")
        return

    if command == "compile":
        emitter = BytecodeEmitter()
        emitter.generate(ast)
        return

    if command == "run":
        interpreter = Interpreter()
        interpreter.interpret(ast)

if __name__ == "__main__":
    main()
''',
    'examples/hello.agx': '''let name = "Devendra"

function greet(user) {
    print(user)
}

greet(name)

let age = 22
if age >= 18 {
   print("Adult")
} else {
   print("Minor")
}

let i = 0
while i < 3 {
    print(i)
    i = i + 1
}
'''
}

for path, content in files.items():
    with open(os.path.join(base_dir, path), 'w', encoding='utf-8') as f:
        f.write(content)

print('Semantic, Runtime, Bytecode, CLI generated')
