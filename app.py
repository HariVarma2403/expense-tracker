from flask import Flask, render_template, request, jsonify
import json, os
from datetime import datetime

app = Flask(
    __name__,
    template_folder="templates",
    static_folder="static"
)


# Path to JSON data file
DATA_FILE = 'expenses.json'


if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump([], f)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/test-static")
def test_static():
    return """
    <link rel="stylesheet" href="/static/css/style.css">
    <h1>If this is styled, static works</h1>
    """


def load_expenses():
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_expenses(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

@app.route("/debug")
def debug():
    return "Flask is running"


@app.route('/')
def index():
    """Render main page"""
    return render_template('index.html')

@app.route("/api/expenses", methods=["GET", "POST"])
def expenses():
    if request.method == "GET":
        return jsonify(load_expenses())

    data = request.json
    expenses = load_expenses()

    expenses.append(data)
    save_expenses(expenses)

    return jsonify({"success": True})

    
    # Create new expense with auto-generated ID
    new_expense = {
        'id': len(expenses) + 1,
        'description': data.get('description'),
        'amount': float(data.get('amount')),
        'category': data.get('category'),
        'date': data.get('date', datetime.now().strftime('%Y-%m-%d'))
    }
    
    expenses.append(new_expense)
    save_expenses(expenses)
    
    return jsonify(new_expense), 201

@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    """Delete an expense"""
    expenses = load_expenses()
    expenses = [e for e in expenses if e['id'] != expense_id]
    save_expenses(expenses)
    return jsonify({'message': 'Expense deleted successfully'}), 200

@app.route('/api/expenses/<int:expense_id>', methods=['PUT'])
def update_expense(expense_id):
    """Update an expense"""
    data = request.json
    expenses = load_expenses()
    
    for expense in expenses:
        if expense['id'] == expense_id:
            expense['description'] = data.get('description', expense['description'])
            expense['amount'] = float(data.get('amount', expense['amount']))
            expense['category'] = data.get('category', expense['category'])
            expense['date'] = data.get('date', expense['date'])
            break
    
    save_expenses(expenses)
    return jsonify({'message': 'Expense updated successfully'}), 200

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get expense statistics"""
    expenses = load_expenses()
    
    total = sum(e['amount'] for e in expenses)
    
    # Category breakdown
    categories = {}
    for expense in expenses:
        cat = expense['category']
        categories[cat] = categories.get(cat, 0) + expense['amount']
    
    return jsonify({
        'total': total,
        'count': len(expenses),
        'categories': categories
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
