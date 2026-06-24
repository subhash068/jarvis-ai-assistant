import os

base_dir = r'c:\Users\windows-11\Desktop\jarvis-ai-assistant\custom-language\agenthoryx'

files = {
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

    def visit_agent_declaration(self, stmt):
        name = stmt.name.lexeme
        self.current_scope.define(name)
        for task in stmt.tasks:
            self.begin_scope()
            for param in task.params:
                self.current_scope.define(param.lexeme)
            for s in task.body:
                if s: s.accept(self)
            self.end_scope()

    def visit_template_declaration(self, stmt):
        name = stmt.name.lexeme
        self.current_scope.define(name)

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
        builtins = ["print", "input", "len", "type", "range", "ai", "tool", "memory", "knowledge"]
        if not self.current_scope.is_defined(name) and name not in builtins:
            raise SemanticError(f"Undefined variable '{name}'.")

    def visit_get_expression(self, expr):
        expr.object.accept(self)

    def visit_set_expression(self, expr):
        expr.value.accept(self)
        expr.object.accept(self)

    def visit_literal_expression(self, expr):
        pass
''',
    'runtime/ai_runtime.py': '''from runtime.function import Callable

class AIChat(Callable):
    def call(self, interpreter, arguments):
        prompt = arguments[0]
        # In a real system, this would call OpenAI/Gemini/Anthropic
        return f"[AI Runtime Response to: {prompt}]"
    def arity(self): return 1

class AIRuntime:
    def __init__(self):
        self.chat = AIChat()

class ToolWeather(Callable):
    def call(self, interpreter, arguments):
        city = arguments[0]
        return f"[Weather Tool: It is sunny in {city}]"
    def arity(self): return 1

class ToolSearch(Callable):
    def call(self, interpreter, arguments):
        query = arguments[0]
        return f"[Search Tool: Found 10 results for '{query}']"
    def arity(self): return 1

class ToolRuntime:
    def __init__(self):
        self.weather = ToolWeather()
        self.search = ToolSearch()

class MemorySave(Callable):
    def __init__(self, mem_store):
        self.mem_store = mem_store
    def call(self, interpreter, arguments):
        self.mem_store[arguments[0]] = arguments[1]
        return None
    def arity(self): return 2

class MemoryGet(Callable):
    def __init__(self, mem_store):
        self.mem_store = mem_store
    def call(self, interpreter, arguments):
        return self.mem_store.get(arguments[0])
    def arity(self): return 1

class MemoryRuntime:
    def __init__(self):
        self.store = {}
        self.save = MemorySave(self.store)
        self.get = MemoryGet(self.store)

class KnowledgeAsk(Callable):
    def call(self, interpreter, arguments):
        query = arguments[0]
        return f"[Knowledge RAG: Information about '{query}' from docs]"
    def arity(self): return 1

class KnowledgeRuntime:
    def __init__(self):
        self.ask = KnowledgeAsk()
''',
    'runtime/interpreter.py': '''from compiler.ast.visitor import Visitor
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
'''
}

for path, content in files.items():
    os.makedirs(os.path.dirname(os.path.join(base_dir, path)), exist_ok=True)
    with open(os.path.join(base_dir, path), 'w', encoding='utf-8') as f:
        f.write(content)

with open(os.path.join(base_dir, 'examples', 'agent.agx'), 'w', encoding='utf-8') as f:
    f.write('''agent ResearchAgent {
    task research(topic) {
        return ai.chat("Explain " + topic)
    }
}

let result = ResearchAgent.research("Machine Learning")
print(result)

let weather = tool.weather("Hyderabad")
print(weather)

memory.save("user_name", "Devendra")
print(memory.get("user_name"))
''')

print("Phase 2 semantic/runtime scaffolded.")
