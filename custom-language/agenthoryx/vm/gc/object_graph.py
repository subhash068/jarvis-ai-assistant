class ObjectGraph:
    def __init__(self):
        self.roots = []

    def add_root(self, obj):
        if obj not in self.roots:
            self.roots.append(obj)
            
    def remove_root(self, obj):
        if obj in self.roots:
            self.roots.remove(obj)

    def get_roots(self):
        return self.roots
