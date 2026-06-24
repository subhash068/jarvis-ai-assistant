class ExecutionNode:
    def __init__(self, node_id):
        self.node_id = node_id
        self.status = "Idle"

    def execute_task(self, task):
        self.status = "Busy"
        print(f"[Node {self.node_id}] Executing task: {task}")
        # Simulate execution
        import time
        time.sleep(0.1)
        self.status = "Idle"
        print(f"[Node {self.node_id}] Task {task} completed")

class AgentCluster:
    def __init__(self, name, replicas=1):
        self.name = name
        self.replicas = replicas
        self.nodes = [ExecutionNode(i) for i in range(replicas)]
        print(f"Cluster '{self.name}' created with {replicas} execution nodes.")

    def run_distributed(self, tasks):
        print(f"Distributing {len(tasks)} tasks across {self.replicas} nodes in {self.name}...")
        for i, task in enumerate(tasks):
            node = self.nodes[i % self.replicas]
            node.execute_task(task)
