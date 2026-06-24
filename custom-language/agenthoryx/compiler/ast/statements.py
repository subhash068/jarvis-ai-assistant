from compiler.ast.nodes import Node
from compiler.ast.expressions import Expression
from compiler.lexer.token import Token
from typing import List, Optional

class Statement(Node):
    pass

class Program(Node):
    def __init__(self, statements: List[Statement]):
        self.statements = statements
    def accept(self, visitor): return visitor.visit_program(self)

class ExpressionStatement(Statement):
    def __init__(self, expression: Expression):
        self.expression = expression
    def accept(self, visitor): return visitor.visit_expression_statement(self)

class VariableDeclaration(Statement):
    def __init__(self, name: Token, initializer: Optional[Expression]):
        self.name = name
        self.initializer = initializer
    def accept(self, visitor): return visitor.visit_variable_declaration(self)

class FunctionDeclaration(Statement):
    def __init__(self, name: Token, params: List[Token], body: List[Statement]):
        self.name = name
        self.params = params
        self.body = body
    def accept(self, visitor): return visitor.visit_function_declaration(self)

class IfStatement(Statement):
    def __init__(self, condition: Expression, then_branch: Statement, else_branch: Optional[Statement]):
        self.condition = condition
        self.then_branch = then_branch
        self.else_branch = else_branch
    def accept(self, visitor): return visitor.visit_if_statement(self)

class WhileStatement(Statement):
    def __init__(self, condition: Expression, body: Statement):
        self.condition = condition
        self.body = body
    def accept(self, visitor): return visitor.visit_while_statement(self)

class ReturnStatement(Statement):
    def __init__(self, keyword: Token, value: Optional[Expression]):
        self.keyword = keyword
        self.value = value
    def accept(self, visitor): return visitor.visit_return_statement(self)

class BlockStatement(Statement):
    def __init__(self, statements: List[Statement]):
        self.statements = statements
    def accept(self, visitor): return visitor.visit_block_statement(self)

class AgentDeclaration(Statement):
    def __init__(self, name: Token, tasks: List[FunctionDeclaration]):
        self.name = name
        self.tasks = tasks
    def accept(self, visitor): return visitor.visit_agent_declaration(self)

class TemplateDeclaration(Statement):
    def __init__(self, name: Token, params: List[Token], body: Expression):
        self.name = name
        self.params = params
        self.body = body
    def accept(self, visitor): return visitor.visit_template_declaration(self)
