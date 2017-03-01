# Jesse Evers
# SDS235
# Assignment 1
# scraper.py -- scrapes data from tables on wikipedia pages

# Imports
import matplotlib.pyplot as plt
import os
import pandas
import sys
import requests
from bs4 import BeautifulSoup

# Gets column (table header) names. This assumes that the only table header cells
# will be those at the very top of the table, and that there will be exactly one <th> per column.
# Also prints out all columns with their number so that user can pick the index column.
#
# @param table a BeautifulSoup object containing the Wikipedia table
# @return      a list of column names (header names)
def get_print_headers(table):
        col_names = []
        for index, col in enumerate(table.findAll('th')):
            col_names.append(col.find(text = True))
            print(str(index) + ': ' + col_names[index])
        return col_names

# Gets user input on which column to use as the index column. If user does not enter an integer, reprompts them.
#
# @return the number of the column that the user wants to use as the index column
def input_index():

    valid_input = False
    index_col = 0
    while not valid_input:

        index_col_input = input('Enter a column number: ')

        # Make sure user input is an integer
        try:
            index_col = int(index_col_input)
            valid_input = True
        except ValueError:
            print('You didn\'t enter an integer.')

    return index_col


# Generates and writes header line to CSV file.
#
# @param csv   the file object to write the headers to
# @param cols  a list of column headers (in order)
def write_header(csv, cols):

    header_line = ''
    for index, col in enumerate(cols):
        header_line += col
        if index < len(cols) - 1:
            header_line += ','
    csv.write(header_line + '\n')


# Retrieves Wikipedia table headers and prompts user to choose index column.
#
# @param csv     the file object to write the headers to (gets passed to write_header())
# @param table   the BeautifulSoup object containing the Wikipedia table (gets passed to get_print_headers())
# @return index  the number of the column the user has selected to use as the index column
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


# Iterates over all non-header table rows and gets the data from each row
#
# @param csv        the file object to write the data to
# @param table      the BeautifulSoup object containing the Wikipedia table
# @param index_col  the number of the column the user has selected to use as the index column
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


# Sorts file by index column data
#
# @param csv  the file object to write the Wikipedia table data to
def sort(csv):

    filename = csv.name
    csv.close()
    df = pandas.read_csv(filename)
    os.remove(filename)
    df.sort_values(by = df.columns[0])  # Sort data by index column
    df.to_csv(filename, index = False)


# Processes Wikipedia table data
#
# @param url     the url of the Wikipedia page containing the desired tables
# @param tables  the numbers of the table(s) (in DOM order) to retrieve. Defaults to 0
def process(url, tables = 0):

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


# Called when file is run, and processes initial user input
def main():

    # Make sure enough arguments were passed
    if len(sys.argv) < 2 or len(sys.argv) > 3:

        print('Incorrect usage. For help, run scraper.py -help')
        sys.exit()

    elif sys.argv[1] == '-help':  # Print out help documentation

        print('Usage: scraper.py [wikipedia url] [nth table or range of tables (defaults to first table)]')

        print()

        print('Example 1: scraper.py https://en.wikipedia.org/wiki/List_of_rulers_of_Lithuania 3-5')
        print('Scrapes 3rd, 4th, and 5th table (in DOM order) from the Wikipedia page listing rulers of Lithuania, and saves each table to a separate CSV file in the current directory.')

        print()

        print('Example 2: scraper.py https://en.wikipedia.org/wiki/List_of_American_Idol_finalists 1')
        print('Scrapes 1st table (in DOM order) from the Wikipedia page listing American Idol finalists, and saves it to a CSV file in the current directory.')

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
