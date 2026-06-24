import sys
from compiler.lexer.lexer import Lexer
from compiler.parser.parser import Parser
from compiler.semantic.analyzer import SemanticAnalyzer
from runtime.interpreter import Interpreter

from compiler.ir.ir_builder import IRBuilder
from compiler.ir.optimizer import Optimizer
from compiler.bytecode.emitter import BytecodeEmitter
from compiler.bytecode.serializer import serialize, deserialize

from cloud.deployer import AgenthoryxCloudDeployer

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def main():
    if len(sys.argv) < 3:
        print("Usage: agenthoryx <command> <file>")
        print("Commands: run, check, deploy")
        print("Note: The Python VM (vm, inspect, debug, compile) is deprecated in Phase 6. Use the Rust runtime for bytecode execution.")
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
        # 1. AST to IR
        ir_builder = IRBuilder()
        ir_instructions = ir_builder.build(ast)
        
        # 2. Optimize IR
        optimizer = Optimizer(ir_instructions)
        optimized_ir = optimizer.optimize()
        
        # 3. IR to Bytecode
        emitter = BytecodeEmitter()
        bytecode = emitter.generate(optimized_ir)
        
        out_path = file_path.replace('.agx', '.axb')
        serialize(bytecode, out_path)
        print(f"Compiled to {out_path}")
        return

    if command == "run":
        # Legacy interpreted run
        interpreter = Interpreter()
        interpreter.interpret(ast)

    if command == "deploy":
        deployer = AgenthoryxCloudDeployer()
        deployer.deploy(file_path)
        return

if __name__ == "__main__":
    main()
