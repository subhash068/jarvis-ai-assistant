class Debugger:
    def __init__(self, vm):
        self.vm = vm
        self.breakpoints = set()
        
    def add_breakpoint(self, index):
        self.breakpoints.add(index)
        
    def remove_breakpoint(self, index):
        if index in self.breakpoints:
            self.breakpoints.remove(index)

    def inspect(self):
        print("Bytecode Viewer:")
        for i, inst in enumerate(self.vm.bytecode):
            bp = '*' if i in self.breakpoints else ' '
            val_str = str(inst['val']) if inst['val'] is not None else ''
            print(f"{bp} {i:04} {inst['op'].name} {val_str}")
            
    def dump_state(self):
        print("--- Memory Inspection ---")
        print(f"Heap objects: {len(self.vm.heap.objects)}")
        print(f"Memory allocated: {self.vm.memory_tracker.allocated}")
        print("--- Stack Inspection ---")
        print(f"Stack size: {len(self.vm.stack)}")
        print(f"Stack top: {self.vm.stack.peek() if len(self.vm.stack) > 0 else 'Empty'}")
        print("--- Globals ---")
        print(self.vm.globals)
        print("-------------------------")

    def run_debug(self):
        while self.vm.registers.ip < len(self.vm.bytecode):
            if self.vm.registers.ip in self.breakpoints:
                print(f"Breakpoint hit at {self.vm.registers.ip}")
                self.dump_state()
                cmd = input("debug> [s]tep, [c]ontinue, [q]uit: ").strip().lower()
                if cmd == 'q':
                    break
                elif cmd == 'c':
                    # temporarily remove to continue, or just step over it
                    pass
                elif cmd == 's':
                    self.step()
                    continue
                    
            self.step()
            
    def step(self):
        # execute one instruction manually
        # Note: In a real debugger, this would extract the single instruction logic
        # For simplicity, we just execute and print the current instruction
        inst = self.vm.bytecode[self.vm.registers.ip]
        print(f"Executing: {inst['op'].name} {inst['val'] if inst['val'] is not None else ''}")
        # Just advance IP for simulation if not fully integrated
        # In a real setup, we would call the actual VM dispatch loop for one iteration.
        self.vm.registers.ip += 1
