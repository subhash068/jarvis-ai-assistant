class MemoryTracker:
    def __init__(self, limit=1024 * 1024):
        self.allocated = 0
        self.limit = limit

    def track(self, size):
        self.allocated += size
        if self.allocated > self.limit:
            # Trigger GC (not implemented directly here, usually a callback)
            pass

    def release(self, size):
        self.allocated -= size
        if self.allocated < 0:
            self.allocated = 0
