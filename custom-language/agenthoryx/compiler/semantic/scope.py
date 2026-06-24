from compiler.semantic.symbol_table import SymbolTable

class Scope:
    def __init__(self, enclosing=None):
        self.enclosing = enclosing
        self.symbols = SymbolTable()

    def define(self, name, type_info=None):
        self.symbols.define(name, type_info)

    def resolve(self, name):
        if self.symbols.is_defined(name):
            return self.symbols.resolve(name)
        if self.enclosing:
            return self.enclosing.resolve(name)
        return None

    def is_defined(self, name):
        if self.symbols.is_defined(name):
            return True
        if self.enclosing:
            return self.enclosing.is_defined(name)
        return False
