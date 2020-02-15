import sqlite3
import csv
import pickle
import pandas as pd

COLLEGE_CSV = 'school_confessions.csv'
CONFESSION_PICKLE = 'fb-scraper/school_confessions.pickle'
DEPRESSION_CSV = 'nlp/school_indices.csv'
TOP_WORDS_CSV = 'nlp/top_phrases.csv'

conn = sqlite3.connect('database.db')

# Clear table if exists
print("Creating database table...")
cursor = conn.cursor()
cursor.execute("DROP TABLE IF EXISTS colleges")
cursor.execute("CREATE TABLE IF NOT EXISTS colleges (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, size INTEGER, lat REAL, long REAL, depression REAL)")

# Create confession table
cursor.execute("DROP TABLE IF EXISTS confessions")
cursor.execute("CREATE TABLE IF NOT EXISTS confessions (id INTEGER PRIMARY KEY AUTOINCREMENT, college_id INTEGER, confession TEXT)")

# Create confession table
cursor.execute("DROP TABLE IF EXISTS top_words")
cursor.execute("CREATE TABLE IF NOT EXISTS top_words (id INTEGER PRIMARY KEY AUTOINCREMENT, college_id INTEGER, word TEXT)")

# Load CSV
print("Loading CSV...")
SCHOOL_DICT = {}
with open(COLLEGE_CSV, 'r') as csvfile:
    rea = csv.DictReader(csvfile)
    for row in rea:
        if row['School Name'] in SCHOOL_DICT:
            continue
        try:
            SCHOOL_DICT[row['School Name']] = ([int(row['School Size'].replace(',' ,'')), float(row['Latitude (GPS)']), float(row['Longitude (GPS)'])])
        except:
            continue

# Populate database
print("Populating database with colleges...")
for school in SCHOOL_DICT:
    school_tuple = SCHOOL_DICT[school]

    cmd = f"INSERT INTO colleges (name, size, lat, long, depression) VALUES (\"{school}\", {school_tuple[0]}, {school_tuple[1]}, {school_tuple[2]}, 0)"

    cursor.execute(cmd)

conn.commit()

print("Loading pandas")
a = pd.read_csv(DEPRESSION_CSV)
for idx, row in a.iterrows():
    dep_score = row['Index']
    college = row['School']
    try:
        cursor.execute("UPDATE colleges SET depression=? WHERE name=?", (dep_score, college))
    except:
        continue

conn.commit()

print("Loading pandas (top words)")
a = pd.read_csv(TOP_WORDS_CSV)
for idx, row in a.iterrows():
    word = row['Word']
    college = row['School']
    try:
        school_id = cursor.execute(f"SELECT id FROM colleges WHERE name=\"{college}\"").fetchall()[0][0]

        cursor.execute("INSERT INTO top_words (college_id, word) VALUES (?, ?)", (school_id, word))
    except:
        continue

conn.commit()

print("Populating confessions...")
with open(CONFESSION_PICKLE, 'rb') as f:
    confs = pickle.load(f)

for school in confs:
    try:
        school_id = cursor.execute(f"SELECT id FROM colleges WHERE name=\"{school}\"").fetchall()[0][0]
        cmd = "INSERT INTO confessions (college_id, confession) VALUES (?, ?)"

        for confession in confs[school]:
            cursor.execute(cmd, (school_id, confession))
    except:
        continue

conn.commit()

# command = f"SELECT * FROM colleges"
# print(conn.execute(command).fetchall())
# command = f"SELECT * FROM confessions"
#print(conn.execute(command).fetchall())

conn.close()
