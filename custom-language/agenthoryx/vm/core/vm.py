from compiler.bytecode.opcodes import OpCode
from vm.core.stack import Stack
from vm.core.registers import Registers
from vm.memory.heap import Heap
from vm.memory.memory_tracker import MemoryTracker

class VM:
    def __init__(self, bytecode):
        self.bytecode = bytecode
        self.registers = Registers()
        self.stack = Stack()
        self.globals = {}
        self.heap = Heap()
        self.memory_tracker = MemoryTracker()
        
    def run(self):
        while self.registers.ip < len(self.bytecode):
            inst = self.bytecode[self.registers.ip]
            op = inst['op']
            val = inst['val']
            
            if op == OpCode.PUSH_CONST or op == OpCode.PUSH_STRING:
                self.stack.push(val)
            elif op == OpCode.POP:
                self.stack.pop()
            elif op == OpCode.STORE:
                self.globals[val] = self.stack.pop()
            elif op == OpCode.LOAD:
                self.stack.push(self.globals.get(val, None))
            elif op == OpCode.ADD:
                b = self.stack.pop()
                a = self.stack.pop()
                self.stack.push(a + b)
            elif op == OpCode.SUB:
                b = self.stack.pop()
                a = self.stack.pop()
                self.stack.push(a - b)
            elif op == OpCode.MUL:
                b = self.stack.pop()
                a = self.stack.pop()
                self.stack.push(a * b)
            elif op == OpCode.DIV:
                b = self.stack.pop()
                a = self.stack.pop()
                self.stack.push(a / b)
            elif op == OpCode.MOD:
                b = self.stack.pop()
                a = self.stack.pop()
                self.stack.push(a % b)
            elif op == OpCode.LESS:
                b = self.stack.pop()
                a = self.stack.pop()
                self.stack.push(a < b)
            elif op == OpCode.LESS_EQUAL:
                b = self.stack.pop()
                a = self.stack.pop()
                self.stack.push(a <= b)
            elif op == OpCode.GREATER:
                b = self.stack.pop()
                a = self.stack.pop()
                self.stack.push(a > b)
            elif op == OpCode.GREATER_EQUAL:
                b = self.stack.pop()
                a = self.stack.pop()
                self.stack.push(a >= b)
            elif op == OpCode.EQUAL_EQUAL:
                b = self.stack.pop()
                a = self.stack.pop()
                self.stack.push(a == b)
            elif op == OpCode.CALL_NATIVE:
                if val == 'print':
                    arg = self.stack.pop()
                    print(arg)
            elif op == OpCode.JUMP_IF_FALSE:
                cond = self.stack.pop()
                if not cond:
                    self.registers.ip = val
                    continue
            elif op == OpCode.JUMP:
                self.registers.ip = val
                continue
            elif op == OpCode.HALT:
                break
                
            self.registers.ip += 1
