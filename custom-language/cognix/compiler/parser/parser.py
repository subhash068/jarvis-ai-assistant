from compiler.lexer.token import TokenType
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
