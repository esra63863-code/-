def add(a, b):
return a + b

def subtract(a, b):
return a - b

def multiply(a, b):
return a * b

def divide(a, b):
if b != 0:
return a / b
else:
return "Error: Division by zero"

تشغيل بسيط للتأكد

if name == "main":
print("جمع: ", add(5, 3))
print("طرح: ", subtract(5, 3))
print("ضرب: ", multiply(5, 3))
print("قسمة: ", divide(5, 0))