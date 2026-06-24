import threading

class WorkflowTask:
    def __init__(self, name, action, retries=3):
        self.name = name
        self.action = action
        self.retries = retries
        self.status = "Pending"

    def execute(self):
        attempts = 0
        while attempts < self.retries:
            try:
                self.status = "Running"
                print(f"[Workflow] Executing task: {self.name}")
                self.action()
                self.status = "Completed"
                return True
            except Exception as e:
                attempts += 1
                print(f"[Workflow] Task {self.name} failed (Attempt {attempts}/{self.retries}): {e}")
        
        self.status = "Failed"
        return False

class WorkflowEngine:
    def __init__(self, name):
        self.name = name
        self.tasks = []

    def add_task(self, task):
        self.tasks.append(task)

    def run_sequential(self):
        print(f"Starting sequential workflow: {self.name}")
        for task in self.tasks:
            success = task.execute()
            if not success:
                print(f"Workflow {self.name} aborted due to task failure.")
                return False
        print(f"Workflow {self.name} completed successfully.")
        return True

    def run_parallel(self):
        print(f"Starting parallel workflow: {self.name}")
        threads = []
        for task in self.tasks:
            t = threading.Thread(target=task.execute)
            threads.append(t)
            t.start()
            
        for t in threads:
            t.join()
            
        success = all(task.status == "Completed" for task in self.tasks)
        if success:
            print(f"Parallel workflow {self.name} completed successfully.")
        else:
            print(f"Parallel workflow {self.name} completed with failures.")
        return success
