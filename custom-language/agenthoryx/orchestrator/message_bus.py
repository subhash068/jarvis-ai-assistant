class MessageBus:
    def __init__(self):
        self.mailboxes = {}

    def register(self, agent_id):
        if agent_id not in self.mailboxes:
            self.mailboxes[agent_id] = []

    def send(self, sender_id, target_id, data):
        if target_id not in self.mailboxes:
            self.register(target_id)
            
        print(f"Message from {sender_id} to {target_id}: {data}")
        self.mailboxes[target_id].append({"from": sender_id, "data": data})

    def receive(self, agent_id):
        if agent_id in self.mailboxes and self.mailboxes[agent_id]:
            return self.mailboxes[agent_id].pop(0)
        return None
