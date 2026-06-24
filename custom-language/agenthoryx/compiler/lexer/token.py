from enum import Enum, auto
from dataclasses import dataclass
from typing import Any

class TokenType(Enum):
    LEFT_PAREN = auto()
    RIGHT_PAREN = auto()
    LEFT_BRACE = auto()
    RIGHT_BRACE = auto()
    COMMA = auto()
    DOT = auto()
    MINUS = auto()
    PLUS = auto()
    SEMICOLON = auto()
    SLASH = auto()
    STAR = auto()
    BANG = auto()
    BANG_EQUAL = auto()
    EQUAL = auto()
    EQUAL_EQUAL = auto()
    GREATER = auto()
    GREATER_EQUAL = auto()
    LESS = auto()
    LESS_EQUAL = auto()
    IDENTIFIER = auto()
    STRING = auto()
    NUMBER = auto()
    INTEGER = auto()
    AND = auto()
    CLASS = auto()
    ELSE = auto()
    FALSE = auto()
    FUNCTION = auto()
    FOR = auto()
    IF = auto()
    NULL = auto()
    OR = auto()
    PRINT = auto()
    RETURN = auto()
    TRUE = auto()
    LET = auto()
    WHILE = auto()
    AGENT = auto()
    TASK = auto()
    TEMPLATE = auto()
    EOF = auto()

@dataclass
class Token:
    type: TokenType
    lexeme: str
    literal: Any
    line: int

    def __str__(self):
        if self.literal is not None:
            return f"{self.type.name}({self.literal})"
        if self.type == TokenType.IDENTIFIER:
            return f"IDENTIFIER({self.lexeme})"
        return self.type.name
