import sys
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
        print("Usage: cognix <command> <file>")
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
        out_path = file_path.replace('.cgx', '.cxb')
        serialize(bytecode, out_path)
        print(f"Compiled to {out_path}")
        return

    if command == "run":
        interpreter = Interpreter()
        interpreter.interpret(ast)

if __name__ == "__main__":
    main()
