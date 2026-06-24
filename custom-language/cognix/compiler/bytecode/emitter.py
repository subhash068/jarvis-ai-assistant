from compiler.bytecode.opcodes import OpCode
from compiler.ast.visitor import Visitor
from compiler.lexer.token import TokenType

class BytecodeEmitter(Visitor):
    def __init__(self):
        self.instructions = []
        
    def generate(self, ast):
        if ast:
            ast.accept(self)
        self.emit(OpCode.HALT)
        return self.instructions

    def emit(self, op, val=None):
        self.instructions.append({'op': op, 'val': val})

    def visit_program(self, stmt):
        for statement in stmt.statements:
            if statement: statement.accept(self)

    def visit_expression_statement(self, stmt):
        stmt.expression.accept(self)

    def visit_variable_declaration(self, stmt):
        if stmt.initializer:
            stmt.initializer.accept(self)
        self.emit(OpCode.STORE, stmt.name.lexeme)

    def visit_binary_expression(self, expr):
        if expr.operator.type == TokenType.EQUAL:
            expr.right.accept(self)
            self.emit(OpCode.STORE, expr.left.name.lexeme)
            return
            
        expr.left.accept(self)
        expr.right.accept(self)
        
        op = expr.operator.type
        if op == TokenType.PLUS: self.emit(OpCode.ADD)
        elif op == TokenType.MINUS: self.emit(OpCode.SUB)
        elif op == TokenType.STAR: self.emit(OpCode.MUL)
        elif op == TokenType.SLASH: self.emit(OpCode.DIV)
        elif op == TokenType.LESS: self.emit(OpCode.LESS)

    def visit_call_expression(self, expr):
        for arg in expr.arguments:
            arg.accept(self)
        callee_name = expr.callee.name.lexeme
        if callee_name in ['print', 'len', 'input']:
            self.emit(OpCode.CALL_NATIVE, callee_name)
        else:
            self.emit(OpCode.CALL, callee_name)

    def visit_identifier_expression(self, expr):
        self.emit(OpCode.LOAD, expr.name.lexeme)

    def visit_literal_expression(self, expr):
        if isinstance(expr.value, str):
            self.emit(OpCode.PUSH_STRING, expr.value)
        else:
            self.emit(OpCode.PUSH_CONST, expr.value)

    def visit_while_statement(self, stmt):
        loop_start = len(self.instructions)
        stmt.condition.accept(self)
        self.emit(OpCode.JUMP_IF_FALSE, -1)
        exit_jmp_idx = len(self.instructions) - 1
        
        stmt.body.accept(self)
        self.emit(OpCode.JUMP, loop_start)
        
        self.instructions[exit_jmp_idx]['val'] = len(self.instructions)

    def visit_if_statement(self, stmt):
        stmt.condition.accept(self)
        self.emit(OpCode.JUMP_IF_FALSE, -1)
        else_jmp_idx = len(self.instructions) - 1
        
        stmt.then_branch.accept(self)
        
        if stmt.else_branch:
            self.emit(OpCode.JUMP, -1)
            end_jmp_idx = len(self.instructions) - 1
            self.instructions[else_jmp_idx]['val'] = len(self.instructions)
            stmt.else_branch.accept(self)
            self.instructions[end_jmp_idx]['val'] = len(self.instructions)
        else:
            self.instructions[else_jmp_idx]['val'] = len(self.instructions)

    def visit_block_statement(self, stmt):
        for s in stmt.statements:
            if s: s.accept(self)
            
    def visit_function_declaration(self, stmt): pass
    def visit_agent_declaration(self, stmt): pass
    def visit_template_declaration(self, stmt): pass
    def visit_return_statement(self, stmt): pass
    def visit_get_expression(self, expr): pass
    def visit_set_expression(self, expr): pass
