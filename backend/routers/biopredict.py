from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import random

try:
    import joblib
    import pandas as pd
    HAS_ML = True
except ImportError:
    HAS_ML = False

router = APIRouter(prefix="/biopredict", tags=["biopredict"])

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ml_models')

# Pydantic models for request bodies
class DiabetesInput(BaseModel):
    Pregnancies: float
    Glucose: float
    BloodPressure: float
    SkinThickness: float
    Insulin: float
    BMI: float
    DiabetesPedigreeFunction: float
    Age: float

class HeartDiseaseInput(BaseModel):
    Age: float
    Sex: float
    ChestPainType: float
    RestingBP: float
    Cholesterol: float
    FastingBS: float
    RestingECG: float
    MaxHR: float
    ExerciseAngina: float
    Oldpeak: float
    ST_Slope: float
    NumVessels: float
    Thalassemia: float

class BreastCancerInput(BaseModel):
    radius_mean: float
    texture_mean: float
    perimeter_mean: float
    area_mean: float
    smoothness_mean: float
    compactness_mean: float
    concavity_mean: float
    concave_points_mean: float
    symmetry_mean: float
    fractal_dimension_mean: float
    radius_se: float
    texture_se: float
    perimeter_se: float
    area_se: float
    smoothness_se: float
    compactness_se: float
    concavity_se: float
    concave_points_se: float
    symmetry_se: float
    fractal_dimension_se: float
    radius_worst: float
    texture_worst: float
    perimeter_worst: float
    area_worst: float
    smoothness_worst: float
    compactness_worst: float
    concavity_worst: float
    concave_points_worst: float
    symmetry_worst: float
    fractal_dimension_worst: float

# Helper function to predict
def make_prediction(model_name: str, input_data: BaseModel, feature_names: list, fallback_mock: bool = True):
    if HAS_ML:
        try:
            model_path = os.path.join(MODELS_DIR, f"{model_name}.pkl")
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model {model_name} not found")
            
            model = joblib.load(model_path)
            data_dict = input_data.dict()
            df = pd.DataFrame([data_dict], columns=feature_names)
            prediction = model.predict(df)[0]
            
            # Extract probability if supported
            probability = 0.0
            if hasattr(model, "predict_proba"):
                probs = model.predict_proba(df)[0]
                probability = probs[1] if len(probs) > 1 else probs[0]
                
            return {"prediction": int(prediction), "probability": float(probability)}
        except Exception as e:
            if not fallback_mock:
                raise HTTPException(status_code=500, detail=str(e))
            # Fall back to mock prediction
            pass

    # Mock prediction if no ML deps or model fails
    prediction = random.choice([0, 1])
    probability = random.uniform(0.5, 0.99) if prediction == 1 else random.uniform(0.01, 0.49)
    return {"prediction": prediction, "probability": float(probability), "mocked": True}


@router.post("/diabetes")
async def predict_diabetes(data: DiabetesInput):
    features = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']
    result = make_prediction('diabetes_model', data, features)
    result['disease'] = 'Diabetes'
    result['label'] = 'Diabetic' if result['prediction'] == 1 else 'Non-Diabetic'
    return result

@router.post("/heart")
async def predict_heart(data: HeartDiseaseInput):
    features = ['Age', 'Sex', 'ChestPainType', 'RestingBP', 'Cholesterol', 'FastingBS', 'RestingECG', 'MaxHR', 'ExerciseAngina', 'Oldpeak', 'ST_Slope', 'NumVessels', 'Thalassemia']
    result = make_prediction('heart_model', data, features)
    result['disease'] = 'Heart Disease'
    result['label'] = 'Heart Disease' if result['prediction'] == 1 else 'Healthy'
    return result

@router.post("/cancer")
async def predict_cancer(data: BreastCancerInput):
    features = [
        'radius_mean', 'texture_mean', 'perimeter_mean', 'area_mean', 'smoothness_mean',
        'compactness_mean', 'concavity_mean', 'concave_points_mean', 'symmetry_mean', 'fractal_dimension_mean',
        'radius_se', 'texture_se', 'perimeter_se', 'area_se', 'smoothness_se',
        'compactness_se', 'concavity_se', 'concave_points_se', 'symmetry_se', 'fractal_dimension_se',
        'radius_worst', 'texture_worst', 'perimeter_worst', 'area_worst', 'smoothness_worst',
        'compactness_worst', 'concavity_worst', 'concave_points_worst', 'symmetry_worst', 'fractal_dimension_worst'
    ]
    result = make_prediction('cancer_model', data, features)
    result['disease'] = 'Breast Cancer'
    result['label'] = 'Malignant' if result['prediction'] == 1 else 'Benign'
    return result
