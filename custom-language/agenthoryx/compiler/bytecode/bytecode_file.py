class BytecodeFile:
    def __init__(self, instructions, constants=None):
        self.magic = b"CXB\0"
        self.version = 1
        self.instructions = instructions
        self.constants = constants or []

    def to_dict(self):
        return {
            'magic': self.magic,
            'version': self.version,
            'instructions': self.instructions,
            'constants': self.constants
        }
