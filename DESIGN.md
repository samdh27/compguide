We reused the code from the finance Pset to create a login and signup page, with the index page serving as our default page. This page contains links to the reviews. Upon clicking on a club's hyperlink, users are directed to the corresponding review page. We utilize Jinja's /reviewed?club_id={{ club.club_id }} as our get method to visualize the data.

Once the club id is obtained, we extract reviews from the reviews table where the club id is a match. Subsequently, we pass the reviews dictionary to a function called process_reviews, which calculates overall ratings, median ratings of difficulty, overall rating, and satisfaction. Similarly, components such as acceptance rates are also computed. The overall thoughts and advice are converted into a list.

A dictionary called analysis_data is created to store all the reviewed values calculated in the function and returned back to the main process. This data is then passed to the HTML, and Jinja and JavaScript are employed to visualize it.

In the forms section, users can review a club, with the restriction that each user can review only one club. To ensure correct club input, we extracted all Harvard clubs from the SOCO app using BeautifulSoup and saved the code in a Python file named web_scrapping.py. Due to SOCO's website requiring 2FA, we saved the HTML file and utilized web_scrapping.py on the saved HTML file.

Once the list of all the clubs is extracted, we store it in a table called 'clubs' with columns for club_id, name, and category, where club_id serves as the primary key.

Our database is compguide.db which comprises three tables. Here’s the schema of our database:
CREATE TABLE users(id integer primary key autoincrement not null, email text not null unique, hash text not null, username text not null);
CREATE TABLE sqlite_sequence(name,seq);
CREATE UNIQUE INDEX username on users(username);
CREATE TABLE clubs (
    club_id TEXT PRIMARY KEY,
    name TEXT,
    category TEXT
);
CREATE TABLE reviews (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id INTEGER NOT NULL,
    club_id TEXT NOT NULL,
    overall_rating INTEGER NOT NULL,
    satisfaction INTEGER NOT NULL,
    difficulty INTEGER NOT NULL,
    comp_components TEXT NOT NULL,
    got_in TEXT NOT NULL,
    preparation TEXT NOT NULL,
    overall_thought TEXT,
    advice TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (club_id) REFERENCES clubs (club_id)

We have tried our best to avoid data redundancy. 

We also implemented resetpassword which basically sends a unique email using flask_mail python library. We created a gmail called compguide2023@gmail.com and used the SMTP credentials to connect it to our flask app. 
