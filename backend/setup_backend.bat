@echo off

echo ================================
echo TAO MOI TRUONG AO
echo ================================

python -m venv venv

echo ================================
echo KICH HOAT VENV
echo ================================

call venv\Scripts\activate

echo ================================
echo CAP NHAT PIP
echo ================================

python -m pip install --upgrade pip

echo ================================
echo CAI THU VIEN BACKEND
echo ================================

python -m pip install -r requirements.txt

echo ================================
echo CAI THEM FLASK
echo ================================

python -m pip install flask

echo ================================
echo MAKEMIGRATIONS
echo ================================

python manage.py makemigrations

echo ================================
echo MIGRATE DATABASE
echo ================================

python manage.py migrate

echo ================================
echo LOAD DATA
echo ================================

python manage.py loaddata users.json
python manage.py loaddata tour.json

echo ================================
echo BACKEND SETUP HOAN TAT
echo ================================

pause