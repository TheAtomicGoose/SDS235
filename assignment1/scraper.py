# Jesse Evers
# SDS235
# Assignment 1
# scraper.py -- scrapes data from tables on wikipedia pages

# Imports
import matplotlib.pyplot as plt
import pandas
import sys
import requests
from bs4 import BeautifulSoup

def get_print_headers(table):
        # Get column (table header) names. This assumes that the only table header cells
        # will be those at the very top of the table, and that there will be exactly one <th> per column.
        #
        # Also print out all columns with their number so that user can pick the index column
        col_names = []
        for index, col in enumerate(table.findAll('th')):
            col_names.append(col.find(text = True))
            print(str(index) + ': ' + col_names[index])
        return col_names

# Gets user input on which column to use as the index column. If user does not enter an integer, reprompts them.
def input_index():

    valid_input = False
    index_col = 0
    while not valid_input:

        index_col_input = input('Enter a column number: ')

        try:
            index_col = int(index_col_input)
            valid_input = True
        except ValueError:
            print('You didn\'t enter an integer.')

    return index_col


# Generate and write header line
def write_header(csv, cols):

    header_line = ''
    for index, col in enumerate(cols):
        header_line += col
        if index < len(cols) - 1:
            header_line += ','
    csv.write(header_line + '\n')


def get_headers_index(csv, table):

    print()
    print('Choose a column to be the index column for this table. If you enter a column number that does not exist for this table, the first column in the table will be used as the index column.')

    # Get column header names and index column
    cols = get_print_headers(table)
    index = input_index()

    # If the index column is not a column that the table actually has, use the first column as the index column
    if not (0 <= index <= len(cols) - 1):
        index = 0

    # Move the index column name to the beginning of the list of column names
    cols.insert(0, cols.pop(index))

    write_header(csv, cols)

    return index


# Iterate over all non-header table rows
def parse_table_body(csv, table, index_col):

    for row in table.findAll('tr')[1:]:

        row_data = []
        cells = row.findAll('td')

        for cell in cells:
            row_data.append(cell.find(text = True))

        row_data.insert(0, row_data.pop(index_col))

        line = ''
        for index, col in enumerate(row_data):
            line += col
            if index < len(row_data) - 1:
                line += ','
        csv.write(line + '\n')


def sort(csv):

    filename = csv.name
    csv.close()
    df = pandas.read_csv(filename)
    pandas.tools.plotting.scatter_matrix(df)
    plt.show()


# Process data
def process(url, tables = 1):
    result = requests.get(url)
    page = result.content
    soup = BeautifulSoup(page, "lxml")

    # Get specific table or range of tables
    wiki_tables = []
    if isinstance(tables, list):
        wiki_tables = soup.findAll('table')[tables[0]:tables[1]]
    else:
        wiki_tables = [soup.findAll('table')[tables]]

    for index, table in enumerate(wiki_tables):

        # Create new csv file for this table
        f = open('table' + str(index + 1) + '.csv', 'w')

        index_cols = get_headers_index(f, table)
        parse_table_body(f, table, index_cols)

        sort(f)


def main():

    # Make sure enough arguments were passed
    if len(sys.argv) < 2:
        print('Usage: scraper.py [wikipedia url] [nth table or range of tables (defaults to first table)]')
        print()
        print('Example: scraper.py https://en.wikipedia.org/wiki/List_of_rulers_of_Lithuania 3-5')
        print('Scrapes 3rd, 4th, and 5th table (in DOM order) from the Wikipedia page listing rulers of Lithuania, and saves each table to a separate CSV file.')
        sys.exit()
    elif len(sys.argv) < 3:
        process(sys.argv[1])
    else:
        tables = []
        if '-' in sys.argv[2]:
            split = sys.argv[2].split('-')
            tables.append(int(split[0]) - 1)
            tables.append(int(split[1]))
        else:
            tables = int(sys.argv[2]) - 1

        process(sys.argv[1], tables)

if __name__ == '__main__':
    main()
