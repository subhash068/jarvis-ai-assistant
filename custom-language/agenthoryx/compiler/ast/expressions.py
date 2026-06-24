from compiler.ast.nodes import Node
from compiler.lexer.token import Token
from typing import List, Any

class Expression(Node):
    pass

class BinaryExpression(Expression):
    def __init__(self, left: Expression, operator: Token, right: Expression):
        self.left = left
        self.operator = operator
        self.right = right
    def accept(self, visitor): return visitor.visit_binary_expression(self)

class CallExpression(Expression):
    def __init__(self, callee: Expression, paren: Token, arguments: List[Expression]):
        self.callee = callee
        self.paren = paren
        self.arguments = arguments
    def accept(self, visitor): return visitor.visit_call_expression(self)

class IdentifierExpression(Expression):
    def __init__(self, name: Token):
        self.name = name
    def accept(self, visitor): return visitor.visit_identifier_expression(self)

class LiteralExpression(Expression):
    def __init__(self, value: Any):
        self.value = value
    def accept(self, visitor): return visitor.visit_literal_expression(self)

class GetExpression(Expression):
    def __init__(self, object: Expression, name: Token):
        self.object = object
        self.name = name
    def accept(self, visitor): return visitor.visit_get_expression(self)

class SetExpression(Expression):
    def __init__(self, object: Expression, name: Token, value: Expression):
        self.object = object
        self.name = name
        self.value = value
    def accept(self, visitor): return visitor.visit_set_expression(self)
