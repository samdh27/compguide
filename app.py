import os

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session, url_for
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
import matplotlib.pyplot as plt
import pandas as pd
from collections import Counter
import statistics
from helpers import login_required
from datetime import datetime, timedelta
from flask_mail import Mail, Message
import secrets

# Configure application
app = Flask(__name__)
app = Flask(__name__, static_url_path='/static')
# Custom filter

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///compguide.db")

#confifure mail 
app.config['MAIL_SERVER'] = 'smtp.googlemail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'compguide2023@gmail.com'
app.config['MAIL_PASSWORD'] = 'otzj shwg taqi lujj'
mail = Mail(app)

reset_tokens = {}

@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/")
@login_required
def index():
    club_list = []
    club_ids = db.execute("SELECT club_id FROM reviews GROUP BY club_id")
    for id in club_ids:
        club_data = db.execute("SELECT name, club_id FROM clubs WHERE club_id = ?", id['club_id'])
        if club_data:
            club_list.append(club_data[0])
    
    # Render the links to the review
    return render_template("index.html", clubs=club_list)
    # Render portfolio table
   
@app.route("/reviewed", methods=['GET'])
@login_required
def reviewed():
    # Retrieve the club id from the query parameters
    club_id = request.args.get('club_id')
    club_details = db.execute(
            "SELECT * FROM clubs WHERE club_id = ?", (club_id)
        )
    club_details = club_details[0]
    club_reviews = db.execute("SELECT * from reviews where club_id = ?", club_id)

    analysis_data = process_reviews(club_reviews)
    #return render_template("test.html", test= club_reviews)
    return render_template('reviewed.html', analysis_data=analysis_data, club=club_details)

def process_reviews(reviews):
    # Extracting data for overall ratings
    overall_ratings = [int(review['overall_rating']) for review in reviews]
    overall_ratings_count = Counter(overall_ratings)

    # Extracting data for median ratings
    satisfaction_values = [review['satisfaction'] for review in reviews]
    difficulty_values = [review['difficulty'] for review in reviews]

    median_ratings = [
        statistics.median(overall_ratings),
        statistics.median(satisfaction_values),
        statistics.median(difficulty_values),
    ]

    # Extracting data for comp components
    comp_components_values = [comp for review in reviews for comp in review['comp_components'].split(',')]
    comp_components_count = Counter(comp_components_values)

    # Calculating acceptance rate
    acceptance_rate = (sum(review['got_in'] == 'yes' for review in reviews) / len(reviews)) * 100

    advice_list = [review['advice'] for review in reviews if 'advice' in review]
    overall_thought_list = [review['overall_thought'] for review in reviews if 'overall_thought' in review]

    sorted_labels = sorted(overall_ratings_count.keys(), key=lambda x: int(x))

    analysis_data = {
        "overall_ratings": {
            "labels": list(overall_ratings_count.keys()),
            "data": list(overall_ratings_count.values())
        },
        "median_ratings": {
            "labels": ["Overall Rating", "Satisfaction", "Difficulty"],
            "data": median_ratings
        },
        "comp_components": {
            "labels": list(comp_components_count.keys()),
            "data": list(comp_components_count.values())
        },
        "acceptance_rate": acceptance_rate,
        "advice_list": advice_list,
        "overall_thought_list": overall_thought_list
    }

    return analysis_data


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        # Ensure username was submitted
        if not request.form.get("email"):
            flash('No email', 'danger')
            return render_template("login.html")

        # Ensure password was submitted
        elif not request.form.get("password"):
            flash('Password Missing', 'danger')
            return render_template("login.html")

        # Query database for username
        rows = db.execute(
            "SELECT * FROM users WHERE email = ?", request.form.get("email")
        )

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(
            rows[0]["hash"], request.form.get("password")
        ):
            flash('Invalid email or password', 'danger')
            return render_template("login.html")

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")

@app.route("/forms", methods=["GET", "POST"])
@login_required
def forms():
    if request.method == "POST":
        club_name = request.form.get("club_name")
        if not club_name:
            flash ('Missing Club Name', 'danger')
            return render_template("forms.html")
        overall_rating = request.form.get("overall_rating")
        if not overall_rating:
            flash ('Missing Overall Rating', 'danger')
            return render_template("forms.html")
        satisfaction= request.form.get("satisfaction_rating")
        if not satisfaction:
            flash ('Missing Satisfaction Rating', 'danger')
            return render_template("forms.html")
        difficulty = request.form.get("difficulty_rating")
        if not difficulty:
            flash ('Missing Difficulty Rating', 'danger')
            return render_template("forms.html")
        comp_components = ",".join(request.form.getlist("comp_component"))
        if not comp_components:
            flash ('Missing Comp Components', 'danger')
            return render_template("forms.html")
        got_in = request.form.get("got_in")
        if not got_in:
            flash ('Missing "Did you get in?"', 'danger')
            return render_template("forms.html")
        preparation = request.form.get("preparation")
        if not preparation:
            flash ('Missing "Did the comp require any preparation?" ', 'danger')
            return render_template("forms.html")
        overall_thought = request.form.get("overall_thought")
        advice = request.form.get("advice")
        user_id = session["user_id"]
        rows = db.execute(
            "SELECT * FROM clubs WHERE name = ?", (club_name)
        )
        # Ensure club exists
        if len(rows) != 1:
            flash('Invalid Club Name', 'danger')
            return render_template("forms.html")
        
        club_id = rows[0]['club_id']

        if has_user_reviewed(user_id, club_id) is True:
            flash('Already Reviewed','danger')
            return render_template("forms.html")
        
        db.execute("INSERT INTO reviews (user_id, club_id, overall_rating, satisfaction, difficulty, comp_components, got_in, preparation, overall_thought, advice) VALUES(?,?,?,?,?,?,?,?,?,?)", user_id, club_id, overall_rating, satisfaction, difficulty, comp_components, got_in, preparation, overall_thought, advice)
        return redirect("/")
    else: 
        return render_template("forms.html")

def has_user_reviewed(user_id, club_id):
    """
    Check if the user has already reviewed the club.
    :param user_id: ID of the user
    :param club_id: ID of the club
    :return: True if the user has already reviewed the club, False otherwise
    """
    reviews = db.execute("SELECT user_id, club_id FROM reviews WHERE user_id = ? AND club_id = ?", user_id, club_id)
    if len(reviews) == 1:
        return True
    else: 
        return False

@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")



@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")
        conf_password = request.form.get("confirmation")
        if not username:
            flash('Missing Username', 'danger')
            return render_template("register.html")
        elif not password:
            flash('Missing Password', 'danger')
            return render_template("register.html")
        elif not email:
            flash('Missing Email', 'danger')
            return render_template("register.html")
        if password != conf_password:
            flash("Password don't match", 'danger')
            return render_template("register.html")
        if not email.endswith('@college.harvard.edu'):
            flash("Enter your Harvard Email")
            return render_template("register.html")
        hash = generate_password_hash(password, method="pbkdf2", salt_length=16)
        duplicate_users = db.execute(
            "SELECT username FROM users where username = ?", username
        )
        if bool(duplicate_users):
            flash('Username Already Exists', 'danger')
            return render_template("register.html")
        
        db.execute("INSERT INTO users (username, email, hash) VALUES(?,?,?)", username, email, hash)
        session["user_id"] = id

        # Let user know they're registered
        flash("Registered!")
        return redirect("/")
    else:
        return render_template("register.html")




@app.route('/resetpassword', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form['email']
        # Query database for username
        rows = db.execute(
            "SELECT * FROM users WHERE email = ?", email
        )
        if len(rows) == 1:
            # Generate a unique token
            token = secrets.token_urlsafe(16)
            reset_tokens[email] = {'token': token, 'expiry_time': datetime.now() + timedelta(hours=1)}

            # Send the reset email
            send_reset_email(email, token)
            flash('Password reset email sent. Check your inbox.', 'success')
            return render_template("login.html")
        flash('Email address not found.', 'danger')

    return render_template('resetpassword.html')

@app.route('/reset_password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    for email, data in reset_tokens.items():
        if data['token'] == str(token) and datetime.now() < data['expiry_time']:
            found_email = email
            break
    else:
        flash('Invalid or expired reset token.', 'danger')
        return render_template("login.html")

    if request.method == 'POST':
        new_password = request.form['new_password']
        
        # Update the password (simulate updating the database)
        hash = generate_password_hash(new_password, method="pbkdf2", salt_length=16)
        db.execute("UPDATE users SET hash =? WHERE  email= ? ", hash, found_email)
        # Remove the used token
        del reset_tokens[email]

        flash('Password reset successful. You can now log in with your new password.', 'success')
        return redirect(url_for('login'))

    return render_template('reset_password.html')

def send_reset_email(email, token):
    msg = Message('Password Reset Request', sender='compguide2023@gmail.com', recipients=[email])
    msg.body = f"Click the following link to reset your password: {url_for('reset_password', token=token, _external=True)}"
    mail.send(msg)