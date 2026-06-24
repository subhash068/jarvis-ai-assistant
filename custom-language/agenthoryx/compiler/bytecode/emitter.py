from compiler.bytecode.opcodes import OpCode
from compiler.ir.ir_nodes import IROp

class BytecodeEmitter:
    def __init__(self):
        self.instructions = []
        self.label_map = {}
        self.jumps = []

    def generate(self, ir_instructions):
        self.instructions = []
        self.label_map = {}
        self.jumps = []

        # First pass: emit instructions and record label positions
        for inst in ir_instructions:
            if inst.op == IROp.LABEL:
                self.label_map[inst.arg] = len(self.instructions)
            else:
                self.emit_ir(inst)
                
        # Second pass: resolve jumps
        for jump_idx, label in self.jumps:
            self.instructions[jump_idx]['val'] = self.label_map[label]

        return self.instructions

    def emit(self, op, val=None):
        self.instructions.append({'op': op, 'val': val})
        return len(self.instructions) - 1

    def emit_ir(self, inst):
        op = inst.op
        
        if op == IROp.LOAD_CONST:
            self.emit(OpCode.PUSH_CONST, inst.arg)
        elif op == IROp.LOAD_STRING:
            self.emit(OpCode.PUSH_STRING, inst.arg)
        elif op == IROp.LOAD_VAR:
            self.emit(OpCode.LOAD, inst.arg)
        elif op == IROp.STORE_VAR:
            self.emit(OpCode.STORE, inst.arg)
        elif op == IROp.ADD:
            self.emit(OpCode.ADD)
        elif op == IROp.SUB:
            self.emit(OpCode.SUB)
        elif op == IROp.MUL:
            self.emit(OpCode.MUL)
        elif op == IROp.DIV:
            self.emit(OpCode.DIV)
        elif op == IROp.MOD:
            self.emit(OpCode.MOD)
        elif op == IROp.LESS:
            self.emit(OpCode.LESS)
        elif op == IROp.LESS_EQUAL:
            self.emit(OpCode.LESS_EQUAL)
        elif op == IROp.GREATER:
            self.emit(OpCode.GREATER)
        elif op == IROp.GREATER_EQUAL:
            self.emit(OpCode.GREATER_EQUAL)
        elif op == IROp.EQUAL_EQUAL:
            self.emit(OpCode.EQUAL_EQUAL)
        elif op == IROp.CALL:
            self.emit(OpCode.CALL, inst.arg)
        elif op == IROp.CALL_NATIVE:
            self.emit(OpCode.CALL_NATIVE, inst.arg)
        elif op == IROp.RETURN:
            self.emit(OpCode.RETURN)
        elif op == IROp.JUMP:
            idx = self.emit(OpCode.JUMP, None)
            self.jumps.append((idx, inst.arg))
        elif op == IROp.JUMP_IF_FALSE:
            idx = self.emit(OpCode.JUMP_IF_FALSE, None)
            self.jumps.append((idx, inst.arg))
        elif op == IROp.HALT:
            self.emit(OpCode.HALT)
        elif op == IROp.AI_CHAT:
            self.emit(OpCode.AI_CHAT)
        elif op == IROp.AI_EMBED:
            self.emit(OpCode.AI_EMBED)
        elif op == IROp.AI_TOOL:
            self.emit(OpCode.AI_TOOL)
        elif op == IROp.AGENT_CREATE:
            self.emit(OpCode.AGENT_CREATE)
        elif op == IROp.TASK_EXECUTE:
            self.emit(OpCode.TASK_EXECUTE)
