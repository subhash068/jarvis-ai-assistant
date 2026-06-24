from enum import Enum, auto

class IROp(Enum):
    LOAD_CONST = auto()
    LOAD_STRING = auto()
    LOAD_VAR = auto()
    STORE_VAR = auto()
    ADD = auto()
    SUB = auto()
    MUL = auto()
    DIV = auto()
    MOD = auto()
    LESS = auto()
    LESS_EQUAL = auto()
    GREATER = auto()
    GREATER_EQUAL = auto()
    EQUAL_EQUAL = auto()
    CALL = auto()
    CALL_NATIVE = auto()
    RETURN = auto()
    JUMP = auto()
    JUMP_IF_FALSE = auto()
    LABEL = auto()
    HALT = auto()
    AI_CHAT = auto()
    AI_EMBED = auto()
    AI_TOOL = auto()
    AGENT_CREATE = auto()
    TASK_EXECUTE = auto()

class IRInstruction:
    def __init__(self, op, arg=None, target=None):
        self.op = op
        self.arg = arg
        self.target = target

    def __repr__(self):
        parts = [self.op.name]
        if self.arg is not None:
            parts.append(str(self.arg))
        if self.target is not None:
            parts.append(f"-> {self.target}")
        return " ".join(parts)
