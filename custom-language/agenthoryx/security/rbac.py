class Role:
    def __init__(self, name, permissions=None):
        self.name = name
        self.permissions = set(permissions or [])

    def add_permission(self, permission):
        self.permissions.add(permission)

    def has_permission(self, permission):
        return permission in self.permissions

class RBAC:
    def __init__(self):
        self.roles = {}
        self.users = {}  # Map user_id to role_name

    def create_role(self, name, permissions=None):
        role = Role(name, permissions)
        self.roles[name] = role
        return role

    def assign_role(self, user_id, role_name):
        if role_name in self.roles:
            self.users[user_id] = role_name
        else:
            raise ValueError(f"Role {role_name} does not exist.")

    def check_permission(self, user_id, permission):
        role_name = self.users.get(user_id)
        if not role_name:
            return False
        role = self.roles.get(role_name)
        return role.has_permission(permission)
