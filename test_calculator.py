
from calculator import add, subtract, multiply, divide

اختبارات بسيطة

def test_add():
assert add(2, 3) == 5

def test_subtract():
assert subtract(5, 3) == 2

def test_multiply():
assert multiply(4, 2) == 8

def test_divide():
assert divide(6, 3) == 2
assert divide(5, 0) == "Error: Division by zero"

تشغيل الاختبارات

if name == "main":
test_add()
test_subtract()
test_multiply()
test_divide()
print("كل الاختبارات نجحت ✅")