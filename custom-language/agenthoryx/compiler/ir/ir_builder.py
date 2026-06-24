from compiler.ast.visitor import Visitor
from compiler.lexer.token import TokenType
from compiler.ir.ir_nodes import IRInstruction, IROp

class IRBuilder(Visitor):
    def __init__(self):
        self.instructions = []
        self.label_counter = 0

    def new_label(self):
        label = f"L{self.label_counter}"
        self.label_counter += 1
        return label

    def emit(self, op, arg=None, target=None):
        inst = IRInstruction(op, arg, target)
        self.instructions.append(inst)
        return inst

    def build(self, ast):
        if ast:
            ast.accept(self)
        self.emit(IROp.HALT)
        return self.instructions

    def visit_program(self, stmt):
        for statement in stmt.statements:
            if statement: statement.accept(self)

    def visit_expression_statement(self, stmt):
        stmt.expression.accept(self)

    def visit_variable_declaration(self, stmt):
        if stmt.initializer:
            stmt.initializer.accept(self)
        else:
            self.emit(IROp.LOAD_CONST, None)
        self.emit(IROp.STORE_VAR, stmt.name.lexeme)

    def visit_binary_expression(self, expr):
        if expr.operator.type == TokenType.EQUAL:
            expr.right.accept(self)
            self.emit(IROp.STORE_VAR, expr.left.name.lexeme)
            return
            
        expr.left.accept(self)
        expr.right.accept(self)
        
        op = expr.operator.type
        if op == TokenType.PLUS: self.emit(IROp.ADD)
        elif op == TokenType.MINUS: self.emit(IROp.SUB)
        elif op == TokenType.STAR: self.emit(IROp.MUL)
        elif op == TokenType.SLASH: self.emit(IROp.DIV)
        elif op == TokenType.LESS: self.emit(IROp.LESS)

    def visit_call_expression(self, expr):
        for arg in expr.arguments:
            arg.accept(self)
        callee_name = expr.callee.name.lexeme
        if callee_name in ['print', 'len', 'input']:
            self.emit(IROp.CALL_NATIVE, callee_name)
        else:
            self.emit(IROp.CALL, callee_name)

    def visit_identifier_expression(self, expr):
        self.emit(IROp.LOAD_VAR, expr.name.lexeme)

    def visit_literal_expression(self, expr):
        if isinstance(expr.value, str):
            self.emit(IROp.LOAD_STRING, expr.value)
        else:
            self.emit(IROp.LOAD_CONST, expr.value)

    def visit_while_statement(self, stmt):
        start_label = self.new_label()
        end_label = self.new_label()
        
        self.emit(IROp.LABEL, start_label)
        stmt.condition.accept(self)
        self.emit(IROp.JUMP_IF_FALSE, end_label)
        
        stmt.body.accept(self)
        self.emit(IROp.JUMP, start_label)
        self.emit(IROp.LABEL, end_label)

    def visit_if_statement(self, stmt):
        else_label = self.new_label()
        end_label = self.new_label()
        
        stmt.condition.accept(self)
        self.emit(IROp.JUMP_IF_FALSE, else_label)
        
        stmt.then_branch.accept(self)
        
        if stmt.else_branch:
            self.emit(IROp.JUMP, end_label)
            self.emit(IROp.LABEL, else_label)
            stmt.else_branch.accept(self)
            self.emit(IROp.LABEL, end_label)
        else:
            self.emit(IROp.LABEL, else_label)

    def visit_block_statement(self, stmt):
        for s in stmt.statements:
            if s: s.accept(self)
            
    def visit_function_declaration(self, stmt): pass
    def visit_agent_declaration(self, stmt): pass
    def visit_template_declaration(self, stmt): pass
    def visit_return_statement(self, stmt): pass
    def visit_get_expression(self, expr): pass
    def visit_set_expression(self, expr): pass
