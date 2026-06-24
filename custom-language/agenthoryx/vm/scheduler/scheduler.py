import threading
import time

class Task:
    def __init__(self, target, args=()):
        self.target = target
        self.args = args
        self.thread = threading.Thread(target=self.target, args=self.args)

    def start(self):
        self.thread.start()

    def join(self):
        self.thread.join()

class Scheduler:
    def __init__(self):
        self.tasks = []

    def spawn(self, target, args=()):
        task = Task(target, args)
        self.tasks.append(task)
        task.start()
        return task

    def await_all(self):
        for task in self.tasks:
            task.join()
        self.tasks = []
