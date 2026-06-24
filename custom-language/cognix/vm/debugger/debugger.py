class Debugger:
    def __init__(self, vm):
        self.vm = vm
    def inspect(self):
        for i, inst in enumerate(self.vm.bytecode):
            print(f"{i:04} {inst['op'].name} {inst['val'] if inst['val'] is not None else ''}")
