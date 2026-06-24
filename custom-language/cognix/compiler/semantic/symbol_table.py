class SymbolTable:
    def __init__(self):
        self.symbols = {}

    def define(self, name, type_info=None):
        self.symbols[name] = type_info

    def resolve(self, name):
        return self.symbols.get(name)

    def is_defined(self, name):
        return name in self.symbols
