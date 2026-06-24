from compiler.ast.visitor import Visitor
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
