class Heap:
    def __init__(self):
        self.objects = []

    def allocate(self, obj):
        self.objects.append(obj)
        return obj

    def free(self, obj):
        if obj in self.objects:
            self.objects.remove(obj)
