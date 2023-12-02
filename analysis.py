import matplotlib.pyplot as plt
import pandas as pd
from collections import Counter
import numpy as np
# Your dataset
data = [
    {'review_id': 5, 'user_id': 5, 'club_id': '35827', 'overall_rating': 2, 'satisfaction': 3, 'difficulty': 4, 'hours_committed': 10, 'comp_components': 'interview,application', 'got_in': 'yes', 'preparation': 'yes', 'overall_thought': 'It was hard', 'advice': 'Practice interviews'}, {'review_id': 6, 'user_id': 6, 'club_id': '35827', 'overall_rating': 5, 'satisfaction': 1, 'difficulty': 5, 'hours_committed': 7, 'comp_components': 'application', 'got_in': 'no', 'preparation': 'yes', 'overall_thought': 'Was hard ', 'advice': 'waste of time'}, {'review_id': 7, 'user_id': 7, 'club_id': '35827', 'overall_rating': 5, 'satisfaction': 1, 'difficulty': 2, 'hours_committed': 5, 'comp_components': 'interview,application', 'got_in': 'yes', 'preparation': 'yes', 'overall_thought': 'It was easy', 'advice': 'A great experience~'}, {'review_id': 8, 'user_id': 8, 'club_id': '35827', 'overall_rating': 1, 'satisfaction': 5, 'difficulty': 5, 'hours_committed': 14, 'comp_components': 'interview,application', 'got_in': 'no', 'preparation': 'yes', 'overall_thought': 'It was too much work. It felt like a 5th class', 'advice': "Don't apply if you have busy feedback "}, {'review_id': 9, 'user_id': 10, 'club_id': '35827', 'overall_rating': 1, 'satisfaction': 5, 'difficulty': 4, 'hours_committed': 11, 'comp_components': 'interview,application', 'got_in': 'yes', 'preparation': 'yes', 'overall_thought': 'It was such a beneficial experience. I learned so much going through the comp process!', 'advice': 'This comp is demanding, but it is so worth it in the end. I made some of my best friends by doing this comp and being in this club.'}, {'review_id': 10, 'user_id': 11, 'club_id': '35827', 'overall_rating': 1, 'satisfaction': 5, 'difficulty': 4, 'hours_committed': 7, 'comp_components': 'interview,application', 'got_in': 'no', 'preparation': 'yes', 'overall_thought': "It was hard, and even though I didn't get in I was very happy with what I learned about consulting. ", 'advice': 'Try your best!'}, {'review_id': 11, 'user_id': 12, 'club_id': '35827', 'overall_rating': 2, 'satisfaction': 4, 'difficulty': 3, 'hours_committed': 6, 'comp_components': 'application', 'got_in': 'no', 'preparation': 'no', 'overall_thought': 'It was okay. I felt like it was overwhelming while I had to deal with classes. ', 'advice': 'Be interested'}, {'review_id': 12, 'user_id': 13, 'club_id': '35827', 'overall_rating': 3, 'satisfaction': 2, 'difficulty': 4, 'hours_committed': 2, 'comp_components': 'application', 'got_in': 'no', 'preparation': 'yes', 'overall_thought': "I didn't make it that far. ", 'advice': 'ksjdbf'}
]

# Convert the data to a DataFrame
df = pd.DataFrame(data)

# Convert comp_components to a list
df['comp_components'] = df['comp_components'].str.split(',')

# Plot bar chart for overall rating, satisfaction, difficulty, and hours committed
# Plot bar chart for overall rating
plt.figure(figsize=(12, 8))

plt.subplot(2, 2, 1)
rating_counts = df['overall_rating'].value_counts().sort_index()
rating_counts.reindex(range(1, 6), fill_value=0).plot(kind='bar', color='skyblue')
plt.xlabel('Overall Rating')
plt.ylabel('Number of Respondents')
plt.title('Distribution of Overall Ratings')

plt.subplot(2, 2, 2)
satisfaction_counts = df['satisfaction'].value_counts().sort_index()
satisfaction_counts.reindex(range(1, 6), fill_value=0).plot(kind='bar', color='lightcoral')
plt.xlabel('Satisfaction Level')
plt.ylabel('Number of Respondents')
plt.title('Distribution of Satisfaction Levels')

plt.subplot(2, 2, 3)
difficulty_counts = df['difficulty'].value_counts().sort_index()
difficulty_counts.reindex(range(1, 6), fill_value=0).plot(kind='bar', color='lightgreen')
plt.xlabel('Difficulty Level')
plt.ylabel('Number of Respondents')
plt.title('Distribution of Difficulty Levels')

plt.subplot(2, 2, 4)
# Determine dynamic binning for 'Number of Hours Committed'
max_hours = df['hours_committed'].max()
hours_bins = list(range(0, max_hours + 1))

# Bin the 'Number of Hours Committed'
df['hours_bin'] = pd.cut(df['hours_committed'], bins=hours_bins, labels=[f'{i}-{i+1}' for i in range(max_hours)])

# Plot bar chart for distribution of hours
plt.figure(figsize=(8, 6))
hours_counts = df['hours_bin'].value_counts().sort_index()
hours_counts.plot(kind='bar', color='gold')
plt.xlabel('Number of Hours Committed (bins)')
plt.ylabel('Number of Respondents')
plt.title('Distribution of Hours Committed')


plt.tight_layout()
plt.show()

# Calculate and print mean and median
print("Mean:")
print(df[['overall_rating', 'satisfaction', 'difficulty', 'hours_committed']].mean())
print("\nMedian:")
print(df[['overall_rating', 'satisfaction', 'difficulty', 'hours_committed']].median())

# Plot pie chart for comp components
comp_components_counts = Counter([comp for comps in df['comp_components'] for comp in comps])
plt.figure(figsize=(8, 8))
plt.pie(comp_components_counts.values(), labels=comp_components_counts.keys(), autopct='%1.1f%%', startangle=140)
plt.title('Comp Components Distribution')
plt.show()

# Plot pie chart for acceptance rate
acceptance_counts = df['got_in'].value_counts()
plt.figure(figsize=(6, 6))
plt.pie(acceptance_counts, labels=acceptance_counts.index, autopct='%1.1f%%', startangle=90)
plt.title('Acceptance Rate')
plt.show()

# Display comments for advice and overall_thought
print("\nAdvice:")
print(df['advice'].tolist())
print("\nOverall Thought:")
print(df['overall_thought'].tolist())
