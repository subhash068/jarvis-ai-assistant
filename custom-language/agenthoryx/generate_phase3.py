import os
import sys

base_dir = r'c:\Users\windows-11\Desktop\jarvis-ai-assistant\custom-language\agenthoryx'

dirs = [
    'compiler/ir',
    'compiler/bytecode',
    'vm/core',
    'vm/memory',
    'vm/scheduler',
    'vm/executor',
    'vm/gc',
    'vm/debugger'
]
for d in dirs:
    os.makedirs(os.path.join(base_dir, d), exist_ok=True)

files = {
    'compiler/bytecode/opcodes.py': '''from enum import Enum, auto
class OpCode(Enum):
    PUSH_CONST = auto()
    PUSH_STRING = auto()
    LOAD = auto()
    STORE = auto()
    ADD = auto()
    SUB = auto()
    MUL = auto()
    DIV = auto()
    LESS = auto()
    LESS_EQUAL = auto()
    GREATER = auto()
    GREATER_EQUAL = auto()
    EQUAL_EQUAL = auto()
    CALL = auto()
    CALL_NATIVE = auto()
    RETURN = auto()
    JUMP = auto()
    JUMP_IF_FALSE = auto()
    HALT = auto()
    AI_CHAT = auto()
''',
    'compiler/bytecode/serializer.py': '''import pickle
def serialize(bytecode, path):
    with open(path, 'wb') as f:
        pickle.dump(bytecode, f)
        
def deserialize(path):
    with open(path, 'rb') as f:
        return pickle.load(f)
''',
    'compiler/bytecode/emitter.py': '''from compiler.bytecode.opcodes import OpCode
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
''',
    'vm/core/vm.py': '''from compiler.bytecode.opcodes import OpCode

class VM:
    def __init__(self, bytecode):
        self.bytecode = bytecode
        self.ip = 0
        self.stack = []
        self.globals = {}
        
    def run(self):
        while self.ip < len(self.bytecode):
            inst = self.bytecode[self.ip]
            op = inst['op']
            val = inst['val']
            
            if op == OpCode.PUSH_CONST or op == OpCode.PUSH_STRING:
                self.stack.append(val)
            elif op == OpCode.STORE:
                self.globals[val] = self.stack.pop()
            elif op == OpCode.LOAD:
                self.stack.append(self.globals.get(val, None))
            elif op == OpCode.ADD:
                b = self.stack.pop()
                a = self.stack.pop()
                self.stack.append(a + b)
            elif op == OpCode.LESS:
                b = self.stack.pop()
                a = self.stack.pop()
                self.stack.append(a < b)
            elif op == OpCode.CALL_NATIVE:
                if val == 'print':
                    arg = self.stack.pop()
                    print(arg)
            elif op == OpCode.JUMP_IF_FALSE:
                cond = self.stack.pop()
                if not cond:
                    self.ip = val
                    continue
            elif op == OpCode.JUMP:
                self.ip = val
                continue
            elif op == OpCode.HALT:
                break
                
            self.ip += 1
''',
    'vm/debugger/debugger.py': '''class Debugger:
    def __init__(self, vm):
        self.vm = vm
    def inspect(self):
        for i, inst in enumerate(self.vm.bytecode):
            print(f"{i:04} {inst['op'].name} {inst['val'] if inst['val'] is not None else ''}")
''',
    'agenthoryx.py': '''import sys
from compiler.lexer.lexer import Lexer
from compiler.parser.parser import Parser
from compiler.semantic.analyzer import SemanticAnalyzer
from runtime.interpreter import Interpreter
from compiler.bytecode.emitter import BytecodeEmitter
from compiler.bytecode.serializer import serialize, deserialize
from vm.core.vm import VM
from vm.debugger.debugger import Debugger

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def main():
    if len(sys.argv) < 3:
        print("Usage: agenthoryx <command> <file>")
        print("Commands: run, ast, check, compile, vm, inspect, debug")
        return

    command = sys.argv[1]
    file_path = sys.argv[2]
    
    if command in ['vm', 'inspect', 'debug']:
        bytecode = deserialize(file_path)
        machine = VM(bytecode)
        if command == 'vm':
            machine.run()
        elif command == 'inspect':
            dbg = Debugger(machine)
            dbg.inspect()
        return

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
        bytecode = emitter.generate(ast)
        out_path = file_path.replace('.agx', '.axb')
        serialize(bytecode, out_path)
        print(f"Compiled to {out_path}")
        return

    if command == "run":
        interpreter = Interpreter()
        interpreter.interpret(ast)

if __name__ == "__main__":
    main()
'''
}

for path, content in files.items():
    with open(os.path.join(base_dir, path), 'w', encoding='utf-8') as f:
        f.write(content)

print('Phase 3 generated')
