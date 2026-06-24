import sys
from compiler.lexer.lexer import Lexer
from compiler.parser.parser import Parser
from compiler.semantic.analyzer import SemanticAnalyzer
from runtime.interpreter import Interpreter
from compiler.bytecode.emitter import BytecodeEmitter

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def main():
    if len(sys.argv) < 3:
        print("Usage: cognix <command> <file.cgx>")
        print("Commands: run, ast, check, compile")
        return

    command = sys.argv[1]
    file_path = sys.argv[2]
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
        # Simplified AST printer
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
        emitter.generate(ast)
        return

    if command == "run":
        interpreter = Interpreter()
        interpreter.interpret(ast)

if __name__ == "__main__":
    main()
