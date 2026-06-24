class Stack:
    def __init__(self, max_size=1024):
        self.elements = []
        self.max_size = max_size

    def push(self, value):
        if len(self.elements) >= self.max_size:
            raise Exception("Stack overflow")
        self.elements.append(value)

    def pop(self):
        if not self.elements:
            raise Exception("Stack underflow")
        return self.elements.pop()

    def peek(self):
        if not self.elements:
            raise Exception("Stack underflow")
        return self.elements[-1]
        
    def __len__(self):
        return len(self.elements)
