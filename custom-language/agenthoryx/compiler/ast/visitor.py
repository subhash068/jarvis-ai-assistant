from abc import ABC, abstractmethod

class Visitor(ABC):
    @abstractmethod
    def visit_binary_expression(self, expr): pass
    @abstractmethod
    def visit_call_expression(self, expr): pass
    @abstractmethod
    def visit_identifier_expression(self, expr): pass
    @abstractmethod
    def visit_literal_expression(self, expr): pass
    @abstractmethod
    def visit_get_expression(self, expr): pass
    @abstractmethod
    def visit_set_expression(self, expr): pass
    
    @abstractmethod
    def visit_program(self, stmt): pass
    @abstractmethod
    def visit_expression_statement(self, stmt): pass
    @abstractmethod
    def visit_variable_declaration(self, stmt): pass
    @abstractmethod
    def visit_function_declaration(self, stmt): pass
    @abstractmethod
    def visit_if_statement(self, stmt): pass
    @abstractmethod
    def visit_while_statement(self, stmt): pass
    @abstractmethod
    def visit_return_statement(self, stmt): pass
    @abstractmethod
    def visit_block_statement(self, stmt): pass
    @abstractmethod
    def visit_agent_declaration(self, stmt): pass
    @abstractmethod
    def visit_template_declaration(self, stmt): pass
