import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import os

# Load dataset (with weather features + fire_risk column)
df = pd.read_csv("model/forest_dataset.csv")

# Features and label
X = df[["temperature", "humidity", "rainfall", "wind_speed"]]
y = df["fire_risk"]

# Train-test split with stratification
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Create and fit scaler for Naive Bayes model
nb_scaler = StandardScaler()
X_train_scaled = nb_scaler.fit_transform(X_train)
X_test_scaled = nb_scaler.transform(X_test)

# Train Naive Bayes
model = GaussianNB()
model.fit(X_train_scaled, y_train)

# Evaluate
y_pred = model.predict(X_test_scaled)
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
print("Classification Report:\n", classification_report(y_test, y_pred))

# Save model and scaler
joblib.dump(model, "model/naive_bayes.pkl")
joblib.dump(nb_scaler, "model/naive_bayes_scaler.pkl")
print("✅ Naive Bayes model saved at model/naive_bayes.pkl")
print("✅ Naive Bayes scaler saved at model/naive_bayes_scaler.pkl")
