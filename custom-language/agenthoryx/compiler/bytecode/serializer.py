import pickle
from compiler.bytecode.bytecode_file import BytecodeFile

def serialize(bytecode, path):
    bc_file = BytecodeFile(bytecode)
    with open(path, 'wb') as f:
        pickle.dump(bc_file.to_dict(), f)
        
def deserialize(path):
    with open(path, 'rb') as f:
        data = pickle.load(f)
        return data['instructions']
