from compiler.bytecode.opcodes import OpCode

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
