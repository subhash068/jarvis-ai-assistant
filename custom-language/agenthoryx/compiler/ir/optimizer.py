from compiler.ir.ir_nodes import IROp

class Optimizer:
    def __init__(self, instructions):
        self.instructions = instructions

    def optimize(self):
        self.instructions = self.constant_folding(self.instructions)
        self.instructions = self.dead_code_elimination(self.instructions)
        # Function inlining could be implemented here as well
        return self.instructions

    def constant_folding(self, instructions):
        optimized = []
        i = 0
        n = len(instructions)
        while i < n:
            inst = instructions[i]
            
            # Look for LOAD_CONST, LOAD_CONST, BINARY_OP
            if (i + 2 < n and 
                instructions[i].op == IROp.LOAD_CONST and 
                instructions[i+1].op == IROp.LOAD_CONST and 
                instructions[i+2].op in (IROp.ADD, IROp.SUB, IROp.MUL, IROp.DIV, IROp.MOD)):
                
                left = instructions[i].arg
                right = instructions[i+1].arg
                op = instructions[i+2].op
                
                result = None
                if op == IROp.ADD: result = left + right
                elif op == IROp.SUB: result = left - right
                elif op == IROp.MUL: result = left * right
                elif op == IROp.DIV: result = left / right if right != 0 else 0
                elif op == IROp.MOD: result = left % right if right != 0 else 0
                
                if result is not None:
                    # Replace 3 instructions with 1 LOAD_CONST
                    optimized.append(instructions[i].__class__(IROp.LOAD_CONST, result))
                    i += 3
                    continue
            
            optimized.append(inst)
            i += 1
            
        return optimized

    def dead_code_elimination(self, instructions):
        # A simple pass: remove instructions after a RETURN, JUMP, or HALT until the next LABEL
        optimized = []
        reachable = True
        
        for inst in instructions:
            if inst.op == IROp.LABEL:
                reachable = True
            
            if reachable:
                optimized.append(inst)
            
            if inst.op in (IROp.RETURN, IROp.JUMP, IROp.HALT):
                reachable = False
                
        return optimized
