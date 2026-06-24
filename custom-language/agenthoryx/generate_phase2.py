import os

base_dir = r'c:\Users\windows-11\Desktop\jarvis-ai-assistant\custom-language\agenthoryx'

files = {
    'compiler/lexer/token.py': '''from enum import Enum, auto
from dataclasses import dataclass
from typing import Any

class TokenType(Enum):
    LEFT_PAREN = auto()
    RIGHT_PAREN = auto()
    LEFT_BRACE = auto()
    RIGHT_BRACE = auto()
    COMMA = auto()
    DOT = auto()
    MINUS = auto()
    PLUS = auto()
    SEMICOLON = auto()
    SLASH = auto()
    STAR = auto()
    BANG = auto()
    BANG_EQUAL = auto()
    EQUAL = auto()
    EQUAL_EQUAL = auto()
    GREATER = auto()
    GREATER_EQUAL = auto()
    LESS = auto()
    LESS_EQUAL = auto()
    IDENTIFIER = auto()
    STRING = auto()
    NUMBER = auto()
    INTEGER = auto()
    AND = auto()
    CLASS = auto()
    ELSE = auto()
    FALSE = auto()
    FUNCTION = auto()
    FOR = auto()
    IF = auto()
    NULL = auto()
    OR = auto()
    PRINT = auto()
    RETURN = auto()
    TRUE = auto()
    LET = auto()
    WHILE = auto()
    AGENT = auto()
    TASK = auto()
    TEMPLATE = auto()
    EOF = auto()

@dataclass
class Token:
    type: TokenType
    lexeme: str
    literal: Any
    line: int

    def __str__(self):
        if self.literal is not None:
            return f"{self.type.name}({self.literal})"
        if self.type == TokenType.IDENTIFIER:
            return f"IDENTIFIER({self.lexeme})"
        return self.type.name
''',
    'compiler/lexer/keywords.py': '''from compiler.lexer.token import TokenType

KEYWORDS = {
    "and": TokenType.AND,
    "class": TokenType.CLASS,
    "else": TokenType.ELSE,
    "false": TokenType.FALSE,
    "for": TokenType.FOR,
    "function": TokenType.FUNCTION,
    "if": TokenType.IF,
    "null": TokenType.NULL,
    "or": TokenType.OR,
    "print": TokenType.PRINT,
    "return": TokenType.RETURN,
    "true": TokenType.TRUE,
    "let": TokenType.LET,
    "while": TokenType.WHILE,
    "agent": TokenType.AGENT,
    "task": TokenType.TASK,
    "template": TokenType.TEMPLATE,
}
''',
    'compiler/ast/visitor.py': '''from abc import ABC, abstractmethod

class Visitor(ABC):
    @abstractmethod
    def visit_binary_expression(self, expr): pass
    @abstractmethod
    def visit_call_expression(self, expr): pass
    @abstractmethod
    def visit_identifier_expression(self, expr): pass
    @abstractmethod
    def visit_literal_expression(self, expr): pass
    @abstractmethod
    def visit_get_expression(self, expr): pass
    @abstractmethod
    def visit_set_expression(self, expr): pass
    
    @abstractmethod
    def visit_program(self, stmt): pass
    @abstractmethod
    def visit_expression_statement(self, stmt): pass
    @abstractmethod
    def visit_variable_declaration(self, stmt): pass
    @abstractmethod
    def visit_function_declaration(self, stmt): pass
    @abstractmethod
    def visit_if_statement(self, stmt): pass
    @abstractmethod
    def visit_while_statement(self, stmt): pass
    @abstractmethod
    def visit_return_statement(self, stmt): pass
    @abstractmethod
    def visit_block_statement(self, stmt): pass
    @abstractmethod
    def visit_agent_declaration(self, stmt): pass
    @abstractmethod
    def visit_template_declaration(self, stmt): pass
''',
    'compiler/ast/expressions.py': '''from compiler.ast.nodes import Node
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
''',
    'compiler/ast/statements.py': '''from compiler.ast.nodes import Node
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
''',
    'compiler/parser/parser.py': '''from compiler.lexer.token import TokenType
from compiler.ast.expressions import BinaryExpression, CallExpression, IdentifierExpression, LiteralExpression, GetExpression, SetExpression
from compiler.ast.statements import Program, ExpressionStatement, VariableDeclaration, FunctionDeclaration, IfStatement, WhileStatement, ReturnStatement, BlockStatement, AgentDeclaration, TemplateDeclaration

class ParseError(Exception):
    pass

class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.current = 0

    def parse(self):
        statements = []
        while not self.is_at_end():
            statements.append(self.declaration())
        return Program(statements)

    def declaration(self):
        try:
            if self.match(TokenType.FUNCTION): return self.function("function")
            if self.match(TokenType.AGENT): return self.agent_declaration()
            if self.match(TokenType.TEMPLATE): return self.template_declaration()
            if self.match(TokenType.LET): return self.var_declaration()
            return self.statement()
        except ParseError:
            self.synchronize()
            return None

    def agent_declaration(self):
        name = self.consume(TokenType.IDENTIFIER, "Expect agent name.")
        self.consume(TokenType.LEFT_BRACE, "Expect '{' before agent body.")
        tasks = []
        while not self.check(TokenType.RIGHT_BRACE) and not self.is_at_end():
            self.consume(TokenType.TASK, "Expect 'task' inside agent.")
            tasks.append(self.function("task"))
        self.consume(TokenType.RIGHT_BRACE, "Expect '}' after agent body.")
        return AgentDeclaration(name, tasks)

    def template_declaration(self):
        name = self.consume(TokenType.IDENTIFIER, "Expect template name.")
        self.consume(TokenType.LEFT_PAREN, "Expect '(' after template name.")
        parameters = []
        if not self.check(TokenType.RIGHT_PAREN):
            parameters.append(self.consume(TokenType.IDENTIFIER, "Expect parameter name."))
            while self.match(TokenType.COMMA):
                parameters.append(self.consume(TokenType.IDENTIFIER, "Expect parameter name."))
        self.consume(TokenType.RIGHT_PAREN, "Expect ')' after parameters.")
        self.consume(TokenType.LEFT_BRACE, "Expect '{' before template body.")
        body = self.expression() # we expect a string literal ideally
        self.consume(TokenType.RIGHT_BRACE, "Expect '}' after template body.")
        return TemplateDeclaration(name, parameters, body)

    def function(self, kind):
        name = self.consume(TokenType.IDENTIFIER, f"Expect {kind} name.")
        self.consume(TokenType.LEFT_PAREN, f"Expect '(' after {kind} name.")
        parameters = []
        if not self.check(TokenType.RIGHT_PAREN):
            parameters.append(self.consume(TokenType.IDENTIFIER, "Expect parameter name."))
            while self.match(TokenType.COMMA):
                parameters.append(self.consume(TokenType.IDENTIFIER, "Expect parameter name."))
        self.consume(TokenType.RIGHT_PAREN, "Expect ')' after parameters.")
        self.consume(TokenType.LEFT_BRACE, f"Expect '{{' before {kind} body.")
        body = self.block()
        return FunctionDeclaration(name, parameters, body)

    def var_declaration(self):
        name = self.consume(TokenType.IDENTIFIER, "Expect variable name.")
        initializer = None
        if self.match(TokenType.EQUAL):
            initializer = self.expression()
        self.consume_optional(TokenType.SEMICOLON)
        return VariableDeclaration(name, initializer)

    def statement(self):
        if self.match(TokenType.IF): return self.if_statement()
        if self.match(TokenType.WHILE): return self.while_statement()
        if self.match(TokenType.RETURN): return self.return_statement()
        if self.match(TokenType.LEFT_BRACE): return BlockStatement(self.block())
        return self.expression_statement()

    def if_statement(self):
        condition = self.expression()
        self.consume(TokenType.LEFT_BRACE, "Expect '{' before if body.")
        then_branch = BlockStatement(self.block())
        else_branch = None
        if self.match(TokenType.ELSE):
            self.consume(TokenType.LEFT_BRACE, "Expect '{' before else body.")
            else_branch = BlockStatement(self.block())
        return IfStatement(condition, then_branch, else_branch)

    def while_statement(self):
        condition = self.expression()
        self.consume(TokenType.LEFT_BRACE, "Expect '{' before while body.")
        body = BlockStatement(self.block())
        return WhileStatement(condition, body)

    def return_statement(self):
        keyword = self.previous()
        value = None
        if not self.check(TokenType.RIGHT_BRACE) and not self.check(TokenType.SEMICOLON):
            value = self.expression()
        self.consume_optional(TokenType.SEMICOLON)
        return ReturnStatement(keyword, value)

    def expression_statement(self):
        expr = self.expression()
        self.consume_optional(TokenType.SEMICOLON)
        return ExpressionStatement(expr)

    def block(self):
        statements = []
        while not self.check(TokenType.RIGHT_BRACE) and not self.is_at_end():
            statements.append(self.declaration())
        self.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.")
        return statements

    def expression(self):
        return self.assignment()

    def assignment(self):
        expr = self.equality()
        if self.match(TokenType.EQUAL):
            equals = self.previous()
            value = self.assignment()
            if isinstance(expr, IdentifierExpression):
                return BinaryExpression(expr, equals, value)
            if isinstance(expr, GetExpression):
                return SetExpression(expr.object, expr.name, value)
            self.error(equals, "Invalid assignment target.")
        return expr

    def equality(self):
        expr = self.comparison()
        while self.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL):
            operator = self.previous()
            right = self.comparison()
            expr = BinaryExpression(expr, operator, right)
        return expr

    def comparison(self):
        expr = self.term()
        while self.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL):
            operator = self.previous()
            right = self.term()
            expr = BinaryExpression(expr, operator, right)
        return expr

    def term(self):
        expr = self.factor()
        while self.match(TokenType.MINUS, TokenType.PLUS):
            operator = self.previous()
            right = self.factor()
            expr = BinaryExpression(expr, operator, right)
        return expr

    def factor(self):
        expr = self.unary()
        while self.match(TokenType.SLASH, TokenType.STAR):
            operator = self.previous()
            right = self.unary()
            expr = BinaryExpression(expr, operator, right)
        return expr

    def unary(self):
        return self.call()

    def call(self):
        expr = self.primary()
        while True:
            if self.match(TokenType.LEFT_PAREN):
                expr = self.finish_call(expr)
            elif self.match(TokenType.DOT):
                name = self.consume(TokenType.IDENTIFIER, "Expect property name after '.'.")
                expr = GetExpression(expr, name)
            else:
                break
        return expr

    def finish_call(self, callee):
        arguments = []
        if not self.check(TokenType.RIGHT_PAREN):
            arguments.append(self.expression())
            while self.match(TokenType.COMMA):
                arguments.append(self.expression())
        paren = self.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments.")
        return CallExpression(callee, paren, arguments)

    def primary(self):
        if self.match(TokenType.FALSE): return LiteralExpression(False)
        if self.match(TokenType.TRUE): return LiteralExpression(True)
        if self.match(TokenType.NULL): return LiteralExpression(None)
        if self.match(TokenType.NUMBER, TokenType.INTEGER, TokenType.STRING):
            return LiteralExpression(self.previous().literal)
        if self.match(TokenType.IDENTIFIER):
            return IdentifierExpression(self.previous())
        if self.match(TokenType.LEFT_PAREN):
            expr = self.expression()
            self.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.")
            return expr
        raise self.error(self.peek(), "Expect expression.")

    def match(self, *types):
        for type in types:
            if self.check(type):
                self.advance()
                return True
        return False

    def check(self, type):
        if self.is_at_end(): return False
        return self.peek().type == type

    def advance(self):
        if not self.is_at_end(): self.current += 1
        return self.previous()

    def is_at_end(self):
        return self.peek().type == TokenType.EOF

    def peek(self):
        return self.tokens[self.current]

    def previous(self):
        return self.tokens[self.current - 1]

    def consume(self, type, message):
        if self.check(type): return self.advance()
        raise self.error(self.peek(), message)
        
    def consume_optional(self, type):
        if self.check(type): return self.advance()

    def error(self, token, message):
        print(f"Error at '{token.lexeme}': {message}")
        return ParseError()

    def synchronize(self):
        self.advance()
        while not self.is_at_end():
            if self.previous().type == TokenType.SEMICOLON: return
            if self.peek().type in [TokenType.CLASS, TokenType.FUNCTION, TokenType.LET, TokenType.FOR, TokenType.IF, TokenType.WHILE, TokenType.PRINT, TokenType.RETURN, TokenType.AGENT, TokenType.TASK, TokenType.TEMPLATE]:
                return
            self.advance()
'''
}

for path, content in files.items():
    os.makedirs(os.path.dirname(os.path.join(base_dir, path)), exist_ok=True)
    with open(os.path.join(base_dir, path), 'w', encoding='utf-8') as f:
        f.write(content)

print("Phase 2 compiler parser/lexer scaffolded.")
