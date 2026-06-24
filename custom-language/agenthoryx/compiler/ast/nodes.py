from abc import ABC, abstractmethod
from typing import Any

class Node(ABC):
    @abstractmethod
    def accept(self, visitor: Any) -> Any:
        pass
