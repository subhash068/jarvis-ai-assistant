from compiler.lexer.token import TokenType

KEYWORDS = {
    "and": TokenType.AND,
    "class": TokenType.CLASS,
    "else": TokenType.ELSE,
    "false": TokenType.FALSE,
    "for": TokenType.FOR,
    "function": TokenType.FUNCTION,
    "if": TokenType.IF,
    "null": TokenType.NULL,
    "or": TokenType.OR,
    "return": TokenType.RETURN,
    "true": TokenType.TRUE,
    "let": TokenType.LET,
    "while": TokenType.WHILE,
    "agent": TokenType.AGENT,
    "task": TokenType.TASK,
    "template": TokenType.TEMPLATE,
}
