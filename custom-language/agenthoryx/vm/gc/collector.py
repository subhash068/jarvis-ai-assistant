class GarbageCollector:
    def __init__(self, heap, object_graph):
        self.heap = heap
        self.object_graph = object_graph

    def collect(self):
        marked = self.mark()
        self.sweep(marked)

    def mark(self):
        marked = set()
        roots = self.object_graph.get_roots()
        
        # Simple DFS for marking
        stack = list(roots)
        while stack:
            obj = stack.pop()
            if id(obj) not in marked:
                marked.add(id(obj))
                # If obj has references, we would add them to stack here
                # For example: if hasattr(obj, 'children'): stack.extend(obj.children)
                
        return marked

    def sweep(self, marked):
        unmarked = [obj for obj in self.heap.objects if id(obj) not in marked]
        for obj in unmarked:
            self.heap.free(obj)
