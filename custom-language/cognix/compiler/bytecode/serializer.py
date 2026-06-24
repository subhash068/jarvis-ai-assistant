import pickle
def serialize(bytecode, path):
    with open(path, 'wb') as f:
        pickle.dump(bytecode, f)
        
def deserialize(path):
    with open(path, 'rb') as f:
        return pickle.load(f)
