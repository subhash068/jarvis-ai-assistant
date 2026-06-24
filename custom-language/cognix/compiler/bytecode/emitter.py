class BytecodeEmitter:
    def __init__(self):
        self.instructions = []
        
    def generate(self, ast):
        print("Generating bytecode...")
        if ast:
            # Fake traversal for phase 1
            print("PUSH 22\nSTORE age")
