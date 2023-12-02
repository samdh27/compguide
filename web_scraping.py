import sqlite3
from bs4 import BeautifulSoup

# Replace 'path/to/saved/page.html' with the actual path to your saved HTML file
file_path = 'List_Of_Groups.html'

def extract_club_info(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')

    # Find all list items with class "list-group-item"
    club_items = soup.find_all('li', class_='list-group-item')

    club_data = []

    for club_item in club_items:
        # Check if the h2 element with class "media-heading" exists
        h2_element = club_item.find('h2', class_='media-heading')
        if h2_element:
            # Extract club name from the h2 tag
            club_name = h2_element.text.strip()
            
            # Check if the 'a' tag exists within the h2 element
            a_tag = h2_element.find('a')
            if a_tag:
                # Extract club ID from the href attribute of the 'a' tag
                club_id = a_tag['href'].split('=')[-1]

                # Extract additional information from the p tag with class "h5 media-heading grey-element"
                additional_info = club_item.find('p', class_='h5 media-heading grey-element')
                additional_info_text = additional_info.text.strip() if additional_info else ''

                # Append the data to the list
                club_data.append({'name': club_name, 'club_id': club_id, 'additional_info': additional_info_text})

    return club_data

def main():
    # Connect to SQLite database
    #conn = sqlite3.connect('compguide.db')

    # Create 'clubs' table if not exists
    #create_clubs_table(conn)

    with open(file_path, 'r', encoding='utf-8') as file:
        html_content = file.read()
    

    # Extract club information
    clubs = extract_club_info(html_content)

    # Insert club information into the 'clubs' table
    # insert_clubs_data(conn, clubs)

    # Close database connection
    # conn.close()
    if clubs:
        print("Extracted club information:")
        for club in clubs:
            print(f' "{club["name"]}",')
    else:
        print("No club information found in the HTML file.")
    print("Club information successfully stored in the compguide.db database.")

if __name__ == "__main__":
    main()
