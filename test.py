import json
import numpy as np
from sklearn.linear_model import LinearRegression
import matplotlib.pyplot as plt

# Data inflasi dalam format JSON
data_json = '''
[
    { "Period": "2013", "Inflation Data": 8.38 },
    { "Period": "2014", "Inflation Data": 8.36 },
    { "Period": "2015", "Inflation Data": 3.35 },
    { "Period": "2016", "Inflation Data": 3.02 },
    { "Period": "2017", "Inflation Data": 3.61 },
    { "Period": "2018", "Inflation Data": 3.13 },
    { "Period": "2019", "Inflation Data": 2.72 },
    { "Period": "2020", "Inflation Data": 1.68 },
    { "Period": "2021", "Inflation Data": 1.87 },
    { "Period": "2022", "Inflation Data": 5.51 },
    { "Period": "2023", "Inflation Data": 2.61 }
]
'''

# Parse JSON data
data = json.loads(data_json)

# Ekstrak tahun dan data inflasi
years = np.array([int(item['Period']) for item in data]).reshape(-1, 1)
inflation_data = np.array([item['Inflation Data'] for item in data])

# Inisialisasi model Linear Regression
model = LinearRegression()

# Latih model menggunakan data yang ada
model.fit(years, inflation_data)

# Prediksi inflasi untuk 10 tahun ke depan
future_years = np.array([[year] for year in range(2024, 2034)])
predicted_inflation = model.predict(future_years)

# Gabungkan tahun dan inflasi aktual dengan prediksi
all_years = np.vstack((years, future_years))
all_inflation_data = np.concatenate((inflation_data, predicted_inflation))

# Cetak hasil prediksi
for year, inflation in zip(future_years.flatten(), predicted_inflation):
    print(f"Prediksi tingkat inflasi untuk tahun {year} adalah {inflation:.2f}%")

# Visualisasi data
plt.scatter(years, inflation_data, color='blue', label='Data Inflasi Aktual')
plt.plot(all_years, all_inflation_data, color='red', label='Garis Regresi dan Prediksi')
plt.scatter(future_years, predicted_inflation, color='green', label='Prediksi Tahun Depan')
plt.xlabel('Tahun')
plt.ylabel('Tingkat Inflasi (%)')
plt.title('Forecasting Tingkat Inflasi 10 Tahun Mendatang Menggunakan Linear Regression')
plt.legend()
plt.grid(True)
plt.show()
