import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier
import joblib

# Ensure the models directory exists
MODELS_DIR = os.path.dirname(os.path.abspath(__file__))

def train_diabetes_model():
    print("Training Diabetes Model (XGBoost)...")
    np.random.seed(42)
    n_samples = 768
    X = pd.DataFrame({
        'Pregnancies': np.random.randint(0, 15, n_samples),
        'Glucose': np.random.randint(50, 200, n_samples),
        'BloodPressure': np.random.randint(40, 120, n_samples),
        'SkinThickness': np.random.randint(0, 100, n_samples),
        'Insulin': np.random.randint(0, 800, n_samples),
        'BMI': np.random.uniform(15.0, 50.0, n_samples),
        'DiabetesPedigreeFunction': np.random.uniform(0.1, 2.5, n_samples),
        'Age': np.random.randint(21, 80, n_samples)
    })
    
    y = ((X['Glucose'] > 140) & (X['BMI'] > 30) | (X['Age'] > 50) & (X['Glucose'] > 120)).astype(int)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = XGBClassifier(use_label_encoder=False, eval_metric='logloss')
    model.fit(X_train, y_train)
    
    accuracy = model.score(X_test, y_test)
    print(f"Diabetes Model Accuracy: {accuracy:.2f}")
    
    model_path = os.path.join(MODELS_DIR, 'diabetes_model.pkl')
    joblib.dump(model, model_path)
    print(f"Saved to {model_path}\n")

def train_heart_disease_model():
    print("Training Heart Disease Model (Random Forest)...")
    np.random.seed(42)
    n_samples = 300
    X = pd.DataFrame({
        'Age': np.random.randint(29, 77, n_samples),
        'Sex': np.random.randint(0, 2, n_samples),
        'ChestPainType': np.random.randint(0, 4, n_samples),
        'RestingBP': np.random.randint(90, 200, n_samples),
        'Cholesterol': np.random.randint(126, 564, n_samples),
        'FastingBS': np.random.randint(0, 2, n_samples),
        'RestingECG': np.random.randint(0, 3, n_samples),
        'MaxHR': np.random.randint(71, 202, n_samples),
        'ExerciseAngina': np.random.randint(0, 2, n_samples),
        'Oldpeak': np.random.uniform(0.0, 6.2, n_samples),
        'ST_Slope': np.random.randint(0, 3, n_samples),
        'NumVessels': np.random.randint(0, 4, n_samples),
        'Thalassemia': np.random.randint(0, 4, n_samples)
    })
    
    y = ((X['Age'] > 55) & (X['Cholesterol'] > 250) | (X['MaxHR'] < 120)).astype(int)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    accuracy = model.score(X_test, y_test)
    print(f"Heart Disease Model Accuracy: {accuracy:.2f}")
    
    model_path = os.path.join(MODELS_DIR, 'heart_model.pkl')
    joblib.dump(model, model_path)
    print(f"Saved to {model_path}\n")

def train_breast_cancer_model():
    print("Training Breast Cancer Model (SVM)...")
    np.random.seed(42)
    n_samples = 569
    feature_names = [
        'radius_mean', 'texture_mean', 'perimeter_mean', 'area_mean', 'smoothness_mean',
        'compactness_mean', 'concavity_mean', 'concave_points_mean', 'symmetry_mean', 'fractal_dimension_mean',
        'radius_se', 'texture_se', 'perimeter_se', 'area_se', 'smoothness_se',
        'compactness_se', 'concavity_se', 'concave_points_se', 'symmetry_se', 'fractal_dimension_se',
        'radius_worst', 'texture_worst', 'perimeter_worst', 'area_worst', 'smoothness_worst',
        'compactness_worst', 'concavity_worst', 'concave_points_worst', 'symmetry_worst', 'fractal_dimension_worst'
    ]
    
    X = pd.DataFrame(np.random.rand(n_samples, 30) * 100, columns=feature_names)
    y = ((X['radius_mean'] > 50) | (X['area_mean'] > 70)).astype(int)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = SVC(probability=True, random_state=42)
    model.fit(X_train, y_train)
    
    accuracy = model.score(X_test, y_test)
    print(f"Breast Cancer Model Accuracy: {accuracy:.2f}")
    
    model_path = os.path.join(MODELS_DIR, 'cancer_model.pkl')
    joblib.dump(model, model_path)
    print(f"Saved to {model_path}\n")

if __name__ == "__main__":
    print("Generating synthetic data and training models...\n")
    train_diabetes_model()
    train_heart_disease_model()
    train_breast_cancer_model()
    print("All models trained and saved successfully.")
